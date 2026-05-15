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

@Component
public class SessionCleanupJob {

        @Autowired
        LoginSessionRepository repository;

        private static final Duration TIMEOUT = Duration.ofMinutes(30);

        // Runs every 30 minutes
        @Scheduled(fixedRate = 30, timeUnit = TimeUnit.MINUTES)
        public void closeInactiveSessions() {
                System.out.println("Running session cleanup job at " + Instant.now());

                Instant now = Instant.now();

                List<LoginSession> activeSessions = repository.findByActiveTrue();

                for (LoginSession session : activeSessions) {

                        if (Duration.between(
                                        session.getLastRequest(),
                                        now).compareTo(TIMEOUT) > 0) {

                                Instant inferredEnd = session.getLastRequest()
                                                .plus(TIMEOUT);

                                session.setInferredEndTime(inferredEnd);

                                session.setEffectiveDurationSeconds(
                                                Duration.between(
                                                                session.getLoginTime(),
                                                                inferredEnd).getSeconds());

                                session.setActive(false);
                                session.setLogoutTime(now);

                                repository.save(session);
                        }
                }
        }
}
