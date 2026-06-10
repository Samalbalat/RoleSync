package com.rolesync.rolesync.filters;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import java.time.Instant;
import java.util.Optional;

import jakarta.servlet.FilterChain;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import com.rolesync.rolesync.model.LoginSession;
import com.rolesync.rolesync.model.User;
import com.rolesync.rolesync.repository.LoginSessionRepository;
import com.rolesync.rolesync.utils.UtilsCalls;

class ActivityTrackingFilterTest {

    @Mock
    private LoginSessionRepository sessionRepository;

    @Mock
    private UtilsCalls utils;

    @Mock
    private FilterChain filterChain;

    @Mock
    private HttpServletRequest request;

    @Mock
    private HttpServletResponse response;

    @InjectMocks
    private ActivityTrackingFilter filter;

    private AutoCloseable mocks;

    @BeforeEach
    void setUp() {
        mocks = MockitoAnnotations.openMocks(this);
    }

    @AfterEach
    void tearDown() throws Exception {
        mocks.close();
        SecurityContextHolder.clearContext();
    }

    private void setAuth(Authentication auth) {
        SecurityContext context = mock(SecurityContext.class);
        when(context.getAuthentication()).thenReturn(auth);
        SecurityContextHolder.setContext(context);
    }

    private Authentication auth() {
        return new UsernamePasswordAuthenticationToken("user", "pass");
    }

    // ---------------------------
    // Base execution verification
    // ---------------------------

    @Test
    void shouldAlwaysCallFilterChain() throws Exception {
        setAuth(null);

        filter.doFilterInternal(request, response, filterChain);

        verify(filterChain).doFilter(request, response);
    }

    // ---------------------------
    // Unauthenticated / edge cases
    // ---------------------------

    @Test
    void shouldDoNothingWhenAuthIsNull() throws Exception {
        setAuth(null);

        filter.doFilterInternal(request, response, filterChain);

        verify(utils, never()).getUserFromUsername(any());
        verify(sessionRepository, never()).findFirstByUserAndActiveTrue(any());
    }

    @Test
    void shouldDoNothingWhenAuthIsNotAuthenticated() throws Exception {
        Authentication auth = mock(Authentication.class);
        when(auth.isAuthenticated()).thenReturn(false);

        setAuth(auth);

        filter.doFilterInternal(request, response, filterChain);

        verify(utils, never()).getUserFromUsername(any());
    }

    // ---------------------------
    // User resolution
    // ---------------------------

    @Test
    void shouldSkipWhenUserNotFound() throws Exception {
        Authentication auth = auth();
        setAuth(auth);

        when(utils.getUserFromUsername(auth))
                .thenReturn(Optional.empty());

        filter.doFilterInternal(request, response, filterChain);

        verify(sessionRepository, never()).findFirstByUserAndActiveTrue(any());
    }

    // ---------------------------
    // Session handling
    // ---------------------------

    @Test
    void shouldNotUpdateWhenNoSessionExists() throws Exception {
        Authentication auth = auth();
        setAuth(auth);

        User user = new User();
        when(utils.getUserFromUsername(auth))
                .thenReturn(Optional.of(user));

        when(sessionRepository.findFirstByUserAndActiveTrue(user))
                .thenReturn(Optional.empty());

        filter.doFilterInternal(request, response, filterChain);

        verify(sessionRepository, never()).save(any());
    }

    @Test
    void shouldUpdateWhenLastRequestIsNull() throws Exception {
        Authentication auth = mock(Authentication.class);
        when(auth.isAuthenticated()).thenReturn(true);

        SecurityContext context = mock(SecurityContext.class);
        when(context.getAuthentication()).thenReturn(auth);
        SecurityContextHolder.setContext(context);

        User user = new User();

        when(utils.getUserFromUsername(auth))
                .thenReturn(Optional.of(user));

        LoginSession session = new LoginSession();
        session.setLastRequest(null);

        when(sessionRepository.findFirstByUserAndActiveTrue(any(User.class)))
                .thenReturn(Optional.of(session));

        filter.doFilterInternal(request, response, filterChain);

        verify(sessionRepository).save(session);
    }

    @Test
    void shouldUpdateWhenMoreThan60SecondsPassed() throws Exception {
        Authentication auth = mock(Authentication.class);
        when(auth.isAuthenticated()).thenReturn(true);

        SecurityContext context = mock(SecurityContext.class);
        when(context.getAuthentication()).thenReturn(auth);
        SecurityContextHolder.setContext(context);

        User user = new User();

        when(utils.getUserFromUsername(auth))
                .thenReturn(Optional.of(user));

        LoginSession session = new LoginSession();
        session.setLastRequest(Instant.now().minusSeconds(120));

         when(sessionRepository.findFirstByUserAndActiveTrue(any(User.class)))
                .thenReturn(Optional.of(session));

        filter.doFilterInternal(request, response, filterChain);

        verify(sessionRepository).save(session);
    }

    @Test
    void shouldNotUpdateWhenWithin60Seconds() throws Exception {
        Authentication auth = mock(Authentication.class);
        when(auth.isAuthenticated()).thenReturn(true);

        SecurityContext context = mock(SecurityContext.class);
        when(context.getAuthentication()).thenReturn(auth);
        SecurityContextHolder.setContext(context);

        User user = new User();

        when(utils.getUserFromUsername(auth))
                .thenReturn(Optional.of(user));

        LoginSession session = new LoginSession();
        session.setLastRequest(Instant.now().minusSeconds(30));

         when(sessionRepository.findFirstByUserAndActiveTrue(any(User.class)))
                .thenReturn(Optional.of(session));

        filter.doFilterInternal(request, response, filterChain);

        verify(sessionRepository,times(0)).save(session);
    }
}