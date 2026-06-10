package com.rolesync.rolesync.services;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import java.time.Instant;
import java.util.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;

import com.rolesync.rolesync.model.*;
import com.rolesync.rolesync.repository.*;

@ExtendWith(MockitoExtension.class)
class UserMetricsServiceTest {

    @Mock
    private UserMetricsRepository repo;

    @Mock
    private LoginSessionRepository loginSessionRepo;

    @InjectMocks
    private UserMetricsService service;

    private User user;
    private UserMetrics metrics;

    @BeforeEach
    void setup() {
        user = new User();

        metrics = new UserMetrics();
        metrics.setUser(user);
        metrics.setPostsCount(10);
        metrics.setSessionsCount(2);
        metrics.setAvgSessionTimeSeconds(1200);

        metrics.setRegistrationDate(new Date());
        metrics.setLastUpdated(Instant.now());
    }

    // -----------------------------
    // onUserRegister
    // -----------------------------
    @Test
    void onUserRegisterShouldCreateMetrics() {
        service.onUserRegister(user);

        ArgumentCaptor<UserMetrics> captor = ArgumentCaptor.forClass(UserMetrics.class);
        verify(repo).save(captor.capture());

        UserMetrics saved = captor.getValue();
        assertEquals(user, saved.getUser());
        assertEquals(0, saved.getCredibilityScore());
        assertEquals(0, saved.getPostsCount());
        assertEquals(0, saved.getSessionsCount());
        assertNotNull(saved.getLastUpdated());
        assertNotNull(saved.getRegistrationDate());
    }

    // -----------------------------
    // onPostCreated
    // -----------------------------
    @Test
    void onPostCreatedShouldIncrementAndRecompute() {
        when(repo.findByUser(user)).thenReturn(Optional.of(metrics));

        service.onPostCreated(user);

        verify(repo).incrementPosts(user);
        verify(repo).findByUser(user);
        verify(repo, atLeastOnce()).save(any(UserMetrics.class));
    }

    // -----------------------------
    // recomputeScore success
    // -----------------------------
    @Test
    void recomputeScoreShouldUpdateScore() {
        when(repo.findByUser(user)).thenReturn(Optional.of(metrics));

        service.recomputeScore(user);

        verify(repo).save(metrics);
        assertNotNull(metrics.getLastUpdated());
    }

    // -----------------------------
    // recomputeScore missing metrics
    // -----------------------------
    @Test
    void recomputeScoreShouldThrowWhenMissing() {
        when(repo.findByUser(user)).thenReturn(Optional.empty());

        assertThrows(IllegalStateException.class,
                () -> service.recomputeScore(user));
    }

    // -----------------------------
    // recomputeAll
    // -----------------------------
    @Test
    void recomputeAllShouldProcessAll() {
        UserMetrics m1 = new UserMetrics();
        m1.setUser(user);
        m1.setPostsCount(1);
        m1.setSessionsCount(1);
        m1.setAvgSessionTimeSeconds(100);
        m1.setRegistrationDate(new Date());

        when(repo.findAll()).thenReturn(List.of(m1));

        service.recomputeAll();

        verify(repo, atLeastOnce()).save(m1);
    }

    // -----------------------------
    // onSessionClosed success
    // -----------------------------
    @Test
    void onSessionClosedShouldCloseSessionAndUpdateMetrics() {
        LoginSession session = mock(LoginSession.class);

        when(repo.findByUser(user)).thenReturn(Optional.of(metrics));
        when(loginSessionRepo.findFirstByUserAndActiveTrue(user))
                .thenReturn(Optional.of(session));

        when(session.getEffectiveDurationSeconds()).thenReturn(500L);
        when(session.getLoginTime()).thenReturn(Instant.now());

        metrics.setSessionsCount(2);

        service.onSessionClosed(user);

        verify(session).closeSession();
        verify(session).setActive(false);
        verify(loginSessionRepo).save(session);
        verify(repo).save(metrics);
    }

    // -----------------------------
    // onSessionClosed missing session
    // -----------------------------
    @Test
    void onSessionClosedShouldThrowWhenNoSession() {
        when(repo.findByUser(user)).thenReturn(Optional.of(metrics));
        when(loginSessionRepo.findFirstByUserAndActiveTrue(user))
                .thenReturn(Optional.empty());

        assertThrows(IllegalStateException.class,
                () -> service.onSessionClosed(user));
    }

    // -----------------------------
    // onSessionTimeOut success
    // -----------------------------
    @Test
    void onSessionTimeOutShouldTimeoutSessionAndSave() {
        LoginSession session = mock(LoginSession.class);

        when(repo.findByUser(user)).thenReturn(Optional.of(metrics));
        when(loginSessionRepo.findFirstByUserAndActiveTrue(user))
                .thenReturn(Optional.of(session));

        when(session.getEffectiveDurationSeconds()).thenReturn(300L);
        when(session.getLoginTime()).thenReturn(Instant.now());

        metrics.setSessionsCount(2);

        service.onSessionTimeOut(user);

        verify(session).sessionTimeout();
        verify(session).setActive(false);
        verify(loginSessionRepo).save(session);
        verify(repo).save(metrics);
    }

    // -----------------------------
    // onSessionTimeOut missing metrics
    // -----------------------------
    @Test
    void onSessionTimeOutShouldThrowWhenNoMetrics() {
        when(repo.findByUser(user)).thenReturn(Optional.empty());

        assertThrows(IllegalStateException.class,
                () -> service.onSessionTimeOut(user));
    }

    // -----------------------------
    // loginDayRatio branch coverage via recomputeScore
    // -----------------------------
    @Test
    void recomputeScoreShouldHandleLoginRatio() {
        when(repo.findByUser(user)).thenReturn(Optional.of(metrics));
        when(loginSessionRepo.countDistinctLoginDays(user)).thenReturn(5L);

        service.recomputeScore(user);

        verify(repo).save(metrics);
    }

    // -----------------------------
    // recomputeAll empty list
    // -----------------------------
    @Test
    void recomputeAllShouldHandleEmptyList() {
        when(repo.findAll()).thenReturn(Collections.emptyList());

        service.recomputeAll();

        verify(repo, never()).save(any());
    }
}