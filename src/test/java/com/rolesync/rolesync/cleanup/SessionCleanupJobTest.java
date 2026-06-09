package com.rolesync.rolesync.cleanup;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import java.time.Duration;
import java.time.Instant;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import com.rolesync.rolesync.model.LoginSession;
import com.rolesync.rolesync.model.User;
import com.rolesync.rolesync.repository.LoginSessionRepository;
import com.rolesync.rolesync.services.UserMetricsService;

class SessionCleanupJobTest {

    @Mock
    private LoginSessionRepository repository;

    @Mock
    private UserMetricsService userMetricsService;

    @InjectMocks
    private SessionCleanupJob sessionCleanupJob;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void shouldDoNothingWhenNoActiveSessionsExist() {
        when(repository.findByActiveTrue()).thenReturn(List.of());

        sessionCleanupJob.closeInactiveSessions();

        verify(repository).findByActiveTrue();
        verifyNoInteractions(userMetricsService);
    }

    @Test
    void shouldNotCloseSessionWhenWithinTimeout() {
        LoginSession session = createSession(10);

        when(repository.findByActiveTrue())
                .thenReturn(List.of(session));

        sessionCleanupJob.closeInactiveSessions();

        verify(userMetricsService, never()).onSessionTimeOut(any());
    }

    @Test
    void shouldCloseSessionWhenTimeoutExceeded() {
        User user = createUser("user@test.com");
        LoginSession session = createSession(user, 31);

        when(repository.findByActiveTrue())
                .thenReturn(List.of(session));

        sessionCleanupJob.closeInactiveSessions();

        verify(userMetricsService).onSessionTimeOut(user);
    }

    @Test
    void shouldNotCloseSessionJustBeforeTimeout() {
        User user = mock(User.class);

        LoginSession session = mock(LoginSession.class);
        when(session.getUser()).thenReturn(user);
        when(session.getLastRequest())
                .thenReturn(
                        Instant.now()
                                .minus(Duration.ofMinutes(29))
                                .minus(Duration.ofSeconds(59)));

        when(repository.findByActiveTrue())
                .thenReturn(List.of(session));

        sessionCleanupJob.closeInactiveSessions();

        verify(userMetricsService, never()).onSessionTimeOut(any());
    }

    @Test
    void shouldProcessMultipleSessionsCorrectly() {
        User activeUser = createUser("active@test.com");
        User timedOutUser = createUser("timeout@test.com");

        LoginSession activeSession = createSession(activeUser, 5);
        LoginSession timedOutSession = createSession(timedOutUser, 45);

        when(repository.findByActiveTrue())
                .thenReturn(List.of(activeSession, timedOutSession));

        sessionCleanupJob.closeInactiveSessions();

        verify(userMetricsService).onSessionTimeOut(timedOutUser);
        verify(userMetricsService, never()).onSessionTimeOut(activeUser);
    }

    private User createUser(String email) {
        User user = mock(User.class);
        when(user.getEmail()).thenReturn(email);
        return user;
    }

    private LoginSession createSession(long minutesAgo) {
        return createSession(mock(User.class), minutesAgo);
    }

    private LoginSession createSession(User user, long minutesAgo) {
        LoginSession session = mock(LoginSession.class);

        when(session.getUser()).thenReturn(user);
        when(session.getId()).thenReturn(1L);
        when(session.getLastRequest())
                .thenReturn(Instant.now().minus(Duration.ofMinutes(minutesAgo)));

        return session;
    }
}
