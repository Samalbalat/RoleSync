package com.rolesync.rolesync.controllers;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.rolesync.rolesync.controller.AuthController;
import com.rolesync.rolesync.dto.authcontroller.LoginRequest;
import com.rolesync.rolesync.dto.authcontroller.ProfileMeResponse;
import com.rolesync.rolesync.dto.authcontroller.SignupRequest;
import com.rolesync.rolesync.model.LoginSession;
import com.rolesync.rolesync.model.Profile;
import com.rolesync.rolesync.model.ProfileType;
import com.rolesync.rolesync.model.User;
import com.rolesync.rolesync.model.UserMetrics;
import com.rolesync.rolesync.repository.LoginSessionRepository;
import com.rolesync.rolesync.repository.ProfileRepository;
import com.rolesync.rolesync.repository.UserMetricsRepository;
import com.rolesync.rolesync.repository.UserRepository;
import com.rolesync.rolesync.security.jwt.JwtUtils;
import com.rolesync.rolesync.security.service.UserDetailsImpl;
import com.rolesync.rolesync.services.UserMetricsService;
import com.rolesync.rolesync.utils.UtilsCalls;

@ExtendWith(MockitoExtension.class)
class AuthControllerTest {

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private ProfileRepository profileRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder encoder;

    @Mock
    private JwtUtils jwtUtils;

    @Mock
    private UserMetricsRepository userMetricsRepository;

    @Mock
    private LoginSessionRepository loginSessionRepository;

    @Mock
    private UserMetricsService userMetricsService;

    @Mock
    private UtilsCalls utilsCalls;

    @Mock
    private Authentication authentication;

    @InjectMocks
    private AuthController authController;

    private User user;
    private UserMetrics metrics;

    @BeforeEach
    void setUp() {
        SecurityContextHolder.clearContext();

        user = mock(User.class);
        metrics = mock(UserMetrics.class);
    }

    // =====================================================
    // LOGIN
    // =====================================================

    @Test
    void authenticateUserShouldReturnErrorWhenUserDoesNotExist() {

        LoginRequest request = new LoginRequest();
        request.setEmail("test@test.com");

        when(userRepository.findByEmail("test@test.com"))
                .thenReturn(Optional.empty());

        ResponseEntity<?> response = authController.authenticateUser(request);

        assertEquals(400, response.getStatusCode().value());
        assertEquals("Error: User not found.", response.getBody());

        verifyNoInteractions(authenticationManager);
    }

    @Test
    void authenticateUserShouldThrowWhenMetricsDoNotExist() {

        LoginRequest request = new LoginRequest();
        request.setEmail("test@test.com");
        request.setPassword("password");

        UserDetailsImpl userDetails = mock(UserDetailsImpl.class);

        when(userRepository.findByEmail(anyString()))
                .thenReturn(Optional.of(user));

        when(authenticationManager.authenticate(any()))
                .thenReturn(authentication);

        when(authentication.getPrincipal())
                .thenReturn(userDetails);

        when(jwtUtils.generateJwtCookie(userDetails))
                .thenReturn(ResponseCookie.from("jwt", "token").build());

        when(profileRepository.findAllByUser(user))
                .thenReturn(List.of());

        when(userMetricsRepository.findByUser(user))
                .thenReturn(Optional.empty());

        assertThrows(
                IllegalStateException.class,
                () -> authController.authenticateUser(request));
    }

    @Test
    void authenticateUserShouldReturnErrorWhenActiveSessionExists() {

        LoginRequest request = new LoginRequest();
        request.setEmail("test@test.com");
        request.setPassword("password");

        UserDetailsImpl userDetails = mock(UserDetailsImpl.class);

        when(userRepository.findByEmail(anyString()))
                .thenReturn(Optional.of(user));

        when(authenticationManager.authenticate(any()))
                .thenReturn(authentication);

        when(authentication.getPrincipal())
                .thenReturn(userDetails);

        when(jwtUtils.generateJwtCookie(userDetails))
                .thenReturn(ResponseCookie.from("jwt", "token").build());

        when(profileRepository.findAllByUser(user))
                .thenReturn(List.of());

        when(userMetricsRepository.findByUser(user))
                .thenReturn(Optional.of(metrics));

        when(loginSessionRepository.findFirstByUserAndActiveTrue(user))
                .thenReturn(Optional.of(mock(LoginSession.class)));

        ResponseEntity<?> response = authController.authenticateUser(request);

        assertEquals(400, response.getStatusCode().value());
        assertEquals(
                "Error: User already has an active session.",
                response.getBody());

        verify(userMetricsRepository).save(metrics);
    }

    @Test
    void authenticateUserShouldLoginSuccessfully() {

        LoginRequest request = new LoginRequest();
        request.setEmail("test@test.com");
        request.setPassword("password");

        UserDetailsImpl userDetails = mock(UserDetailsImpl.class);

        Profile profile = mock(Profile.class);

        when(profile.getProfilename())
                .thenReturn("Profile");

        when(profile.getProfileType())
                .thenReturn(ProfileType.TABLETOP);

        when(userRepository.findByEmail(anyString()))
                .thenReturn(Optional.of(user));

        when(authenticationManager.authenticate(any()))
                .thenReturn(authentication);

        when(authentication.getPrincipal())
                .thenReturn(userDetails);

        when(userDetails.getUsername())
                .thenReturn("test@test.com");

        ResponseCookie cookie = ResponseCookie.from("jwt", "token").build();

        when(jwtUtils.generateJwtCookie(userDetails))
                .thenReturn(cookie);

        when(profileRepository.findAllByUser(user))
                .thenReturn(List.of(profile));

        when(userMetricsRepository.findByUser(user))
                .thenReturn(Optional.of(metrics));

        when(loginSessionRepository.findFirstByUserAndActiveTrue(user))
                .thenReturn(Optional.empty());

        when(metrics.getSessionsCount()).thenReturn(5L);

        ResponseEntity<?> response = authController.authenticateUser(request);

        assertEquals(200, response.getStatusCode().value());

        assertEquals(
                cookie.toString(),
                response.getHeaders().getFirst(HttpHeaders.SET_COOKIE));

        @SuppressWarnings("unchecked")
        List<ProfileMeResponse> body = (List<ProfileMeResponse>) response.getBody();

        assertNotNull(body);
        assertEquals(1, body.size());

        verify(userMetricsRepository).save(metrics);
        verify(loginSessionRepository).save(any(LoginSession.class));
    }

    // =====================================================
    // REGISTER
    // =====================================================

    @Test
    void registerUserShouldReturnErrorWhenEmailAlreadyExists() {

        SignupRequest request = new SignupRequest();
        request.setEmail("test@test.com");

        when(userRepository.existsByEmail("test@test.com"))
                .thenReturn(true);

        ResponseEntity<?> response = authController.registerUser(request);

        assertEquals(400, response.getStatusCode().value());
        assertEquals(
                "Error: Email already in use",
                response.getBody());

        verify(profileRepository, never()).save(any());
    }

    @Test
    void registerUserShouldReturnErrorWhenProfileNameExists() {

        SignupRequest request = new SignupRequest();
        request.setEmail("test@test.com");
        request.setProfilename("profile");

        when(userRepository.existsByEmail(anyString()))
                .thenReturn(false);

        when(profileRepository.existsByProfilename("profile"))
                .thenReturn(true);

        ResponseEntity<?> response = authController.registerUser(request);

        assertEquals(400, response.getStatusCode().value());
        assertEquals(
                "Error: Profile name already in use",
                response.getBody());
    }

    @Test
    void registerUserShouldRegisterSuccessfully() {

        SignupRequest request = new SignupRequest();
        request.setEmail("test@test.com");
        request.setPassword("password");
        request.setTimeZone("UTC");
        request.setProfilename("profile");
        request.setRoleType("TABLETOP");

        when(userRepository.existsByEmail(anyString()))
                .thenReturn(false);

        when(profileRepository.existsByProfilename(anyString()))
                .thenReturn(false);

        when(encoder.encode("password"))
                .thenReturn("encoded");

        ResponseEntity<?> response = authController.registerUser(request);

        assertEquals(200, response.getStatusCode().value());
        assertEquals(
                "Usuario registrado exitosamente!",
                response.getBody());

        verify(userRepository).save(any(User.class));
        verify(profileRepository).save(any(Profile.class));
        verify(userMetricsService).onUserRegister(any(User.class));
    }

    // =====================================================
    // LOGOUT
    // =====================================================

    @Test
    void logoutShouldSucceedWhenAuthenticationIsNull() {

        ResponseCookie cookie = ResponseCookie.from("jwt", "").build();

        when(jwtUtils.getCleanJwtCookie())
                .thenReturn(cookie);

        ResponseEntity<?> response = authController.logoutUser(null);

        assertEquals(200, response.getStatusCode().value());
        assertEquals("Sesión cerrada.", response.getBody());

        verify(userMetricsService, never())
                .onSessionClosed(any());
    }

    @Test
    void logoutShouldReturnErrorWhenUserCannotBeResolved() {

        when(utilsCalls.getUserFromUsername(authentication))
                .thenReturn(Optional.empty());

        ResponseEntity<?> response = authController.logoutUser(authentication);

        assertEquals(400, response.getStatusCode().value());
        assertEquals("Error: User not found.", response.getBody());
    }

    @Test
    void logoutShouldReturnErrorWhenClosingSessionFails() {

        when(utilsCalls.getUserFromUsername(authentication))
                .thenReturn(Optional.of(user));

        doThrow(new IllegalStateException("No active session"))
                .when(userMetricsService)
                .onSessionClosed(user);

        ResponseEntity<?> response = authController.logoutUser(authentication);

        assertEquals(400, response.getStatusCode().value());
        assertEquals(
                "Error: No active session",
                response.getBody());
    }

    @Test
    void logoutShouldCloseSessionSuccessfully() {

        ResponseCookie cookie = ResponseCookie.from("jwt", "").build();

        when(utilsCalls.getUserFromUsername(authentication))
                .thenReturn(Optional.of(user));

        when(jwtUtils.getCleanJwtCookie())
                .thenReturn(cookie);

        ResponseEntity<?> response = authController.logoutUser(authentication);

        assertEquals(200, response.getStatusCode().value());
        assertEquals("Sesión cerrada.", response.getBody());

        assertEquals(
                cookie.toString(),
                response.getHeaders().getFirst(HttpHeaders.SET_COOKIE));

        verify(userMetricsService)
                .onSessionClosed(user);
    }
}