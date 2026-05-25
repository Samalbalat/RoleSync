package com.rolesync.rolesync.services;

import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.util.Date;
import java.util.List;

import org.springframework.stereotype.Service;
import com.rolesync.rolesync.model.LoginSession;
import com.rolesync.rolesync.model.User;
import com.rolesync.rolesync.model.UserMetrics;
import com.rolesync.rolesync.repository.LoginSessionRepository;
import com.rolesync.rolesync.repository.UserMetricsRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserMetricsService {

    // -----------------------------
    // EVENT HANDLERS (ENTRY POINTS)
    // -----------------------------

    private final UserMetricsRepository repo;
    private final LoginSessionRepository loginSessionRepo;

    @Transactional
    public void onUserRegister(User user) {
        UserMetrics m = new UserMetrics();
        m.setUser(user);
        m.setCredibilityScore(0);
        m.setPostsCount(0);
        m.setSessionsCount(0);
        m.setLastUpdated(Instant.now());
        m.setRegistrationDate(new Date());
        repo.save(m);
    }

    @Transactional
    public void onPostCreated(User user) {
        repo.incrementPosts(user); // atomic DB update
        recomputeScore(user); // recompute after change
    }

    // -----------------------------
    // SCORE LOGIC
    // -----------------------------

    @Transactional
    public void recomputeScore(User user) {
        UserMetrics m = repo.findByUser(user)
                .orElseThrow(() -> new IllegalStateException("Metrics not found"));

        double score = computeScore(m);

        m.setCredibilityScore(score);
        m.setLastUpdated(Instant.now());
        repo.save(m);
    }

    private double computeScore(UserMetrics m) {
        // Tiempo medio de sesión
        double sessionTimeValue = 0.15f * Math.min(m.getAvgSessionTimeSeconds() / 2700.0f, 1.0f); // max 45 min
        // Antigüedad del usuario
        double ageTimeValue = 0.2f * Math
                .min(Duration.between(m.getRegistrationDate().toInstant(), Instant.now()).toDays() / 365.0f, 1.0f); // max 1 año
        // Número de posts (con logaritmo para evitar crecimiento descontrolado)
        double postCountValue = 0.2f * Math.log(1 + m.getPostsCount()) / Math.log(301); // log para evitar crecimiento descontrolado, max 300 posts
        // Porcentaje de días activos desde el registro
        double loginDayPercentageValue = 0.15f * getLoginDayRatio(m);

        //El valor siempre va a estar entre 0 y 0.7
        //Dado que el 30% de la credibilidad se basa en otros factores (calidad de reseñas, feedback de otros usuarios, etc.) 
        // que no se modelan aquí, el máximo teórico de esta función es 70 puntos.
        return sessionTimeValue + ageTimeValue + postCountValue + loginDayPercentageValue;
    }

    // -----------------------------
    // BULK / REPAIR
    // -----------------------------

    @Transactional
    public void recomputeAll() {
        List<UserMetrics> all = repo.findAll();

        for (UserMetrics m : all) {
            m.setCredibilityScore(computeScore(m));
            m.setLastUpdated(Instant.now());
            repo.save(m);
        }
    }

    @Transactional
    public void onSessionClosed(User author) {
        UserMetrics metrics = repo.findByUser(author)
                .orElseThrow(() -> new IllegalStateException("Metrics not found"));
        LoginSession session = loginSessionRepo.findFirstByEmailAndActiveTrue(author.getEmail())
                .orElseThrow(() -> new IllegalStateException("No closed sessions found for user"));
        session.closeSession();
        metrics.setAvgSessionTimeSeconds(
                (metrics.getAvgSessionTimeSeconds() * (metrics.getSessionsCount() - 1)
                        + session.getEffectiveDurationSeconds())
                        / (metrics.getSessionsCount()));
        metrics.setLastSessionTime(Date.from(session.getLoginTime()));
        session.setActive(false);
        recomputeScore(author);
        loginSessionRepo.save(session);
    }

    @Transactional
    public void onSessionTimeOut(User author) {
        UserMetrics metrics = repo.findByUser(author)
                .orElseThrow(() -> new IllegalStateException("Metrics not found"));
        LoginSession session = loginSessionRepo.findFirstByEmailAndActiveTrue(author.getEmail())
                .orElseThrow(() -> new IllegalStateException("No closed sessions found for user"));
        session.sessionTimeout();
        metrics.setAvgSessionTimeSeconds(
                (metrics.getAvgSessionTimeSeconds() * (metrics.getSessionsCount() - 1)
                        + session.getEffectiveDurationSeconds())
                        / (metrics.getSessionsCount()));
        metrics.setLastSessionTime(Date.from(session.getLoginTime()));

        session.setActive(false);
        recomputeScore(author);
        loginSessionRepo.save(session);
        repo.save(metrics);
    }

    private double getLoginDayRatio(UserMetrics metrics) {
        Instant firstLogin = metrics.getRegistrationDate().toInstant();

        if (firstLogin == null) {
            return 0.0;
        }

        Long activeDays = loginSessionRepo.countDistinctLoginDays(metrics.getUser().getEmail());

        LocalDate firstDate = firstLogin.atZone(java.time.ZoneOffset.UTC).toLocalDate();
        LocalDate today = LocalDate.now(java.time.ZoneOffset.UTC);

        long totalDays = java.time.temporal.ChronoUnit.DAYS.between(firstDate, today) + 1;

        if (totalDays <= 0) {
            return 0.0;
        }

        return activeDays.doubleValue() / totalDays;
    }

}
