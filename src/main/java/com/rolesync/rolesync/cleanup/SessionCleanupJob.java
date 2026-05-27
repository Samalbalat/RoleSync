package com.rolesync.rolesync.cleanup;

import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.concurrent.TimeUnit;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import com.rolesync.rolesync.model.LoginSession;
import com.rolesync.rolesync.repository.LoginSessionRepository;
import com.rolesync.rolesync.repository.UserRepository;
import com.rolesync.rolesync.services.UserMetricsService;

import jakarta.transaction.Transactional;

@Component
public class SessionCleanupJob {

        @Autowired
        LoginSessionRepository repository;
        @Autowired
        UserMetricsService userMetricsService;
        @Autowired
        UserRepository userRepository;

        private static final Duration TIMEOUT = Duration.ofMinutes(30);
        // Runs every 30 minutes
        @Transactional
        @Scheduled(fixedRate = 30, timeUnit = TimeUnit.MINUTES)
        public void closeInactiveSessions() {
                System.out.println("Running session cleanup job at " + Instant.now());

                Instant now = Instant.now();

                List<LoginSession> activeSessions = repository.findByActiveTrue();

                for (LoginSession session : activeSessions) {

                        if (Duration.between(
                                        session.getLastRequest(),
                                        now).compareTo(TIMEOUT) > 0) {
                                System.out.println("Closing session " + session.getId() + " for user " + session.getUser().getEmail());
                                userMetricsService.onSessionTimeOut(session.getUser());
                        }
                }
        }
}
