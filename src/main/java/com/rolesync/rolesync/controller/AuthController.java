package com.rolesync.rolesync.controller;


import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import com.rolesync.rolesync.dto.authcontroller.LoginRequest;
import com.rolesync.rolesync.dto.authcontroller.ProfileMeResponse;
import com.rolesync.rolesync.dto.authcontroller.SignupRequest;

import com.rolesync.rolesync.model.LoginSession;
import com.rolesync.rolesync.model.Profile;
import com.rolesync.rolesync.model.UserMetrics;
import com.rolesync.rolesync.model.ProfileType;
import com.rolesync.rolesync.model.User;
import com.rolesync.rolesync.repository.UserRepository;
import com.rolesync.rolesync.repository.LoginSessionRepository;
import com.rolesync.rolesync.repository.UserMetricsRepository;
import com.rolesync.rolesync.repository.ProfileRepository;
import com.rolesync.rolesync.security.jwt.JwtUtils;
import com.rolesync.rolesync.security.service.UserDetailsImpl;
import com.rolesync.rolesync.services.UserMetricsService;
import com.rolesync.rolesync.utils.UtilsCalls;

/**
 * This controller handles all the endpoints related to user authentication and
 * registration. It allows users to log in, register, and log out of the
 * application.
 * The controller uses JWT authentication to secure the endpoints and ensure
 * that only authenticated users can access certain resources.
 * The login endpoint generates a JWT cookie upon successful authentication,
 * while the logout endpoint clears the JWT cookie to log the user out.
 * The registration endpoint allows new users to create an account by providing
 * their email, password, time zone, profile name, and role type.
 * The controller also includes error handling to return appropriate responses
 * when authentication fails or when a user tries to register with an email that
 * is already in use.
 */
@RestController
@RequestMapping("/rolesync/auth")
public class AuthController {
    @Autowired
    AuthenticationManager authenticationManager;
    @Autowired
    ProfileRepository profileRepository;
    @Autowired
    UserRepository userRepository;
    @Autowired
    PasswordEncoder encoder;
    @Autowired
    JwtUtils jwtUtils;
    @Autowired
    UserMetricsRepository userMetricsRepository;
    @Autowired
    LoginSessionRepository loginSessionRepository;
    @Autowired
    UserMetricsService userMetricsService;
    @Autowired
    UtilsCalls utilsCalls;

    /**
     * Authenticate the user with the provided email and password.
     * If the authentication is successful, a JWT cookie is generated and returned
     * in the response header, along with a list of the user's profiles in the
     * response body.
     * If the authentication fails, an error message is returned.
     * 
     * @param loginRequest The LoginRequest object containing the user's email and
     *                     password
     * @return A ResponseEntity containing a JWT cookie in the response header and a
     *         list of the user's profiles in the response body if the
     *         authentication is successful, or an error message if the
     *         authentication fails
     */
    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@RequestBody LoginRequest loginRequest) {
        System.out.println(loginRequest);
        Optional<User> userOptional = userRepository.findByEmail(loginRequest.getEmail());
        if (userOptional.isEmpty()) {
            return ResponseEntity.badRequest().body("Error: User not found.");
        }
        User user = userOptional.get();
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(user.getEmail(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        ResponseCookie jwtCookie = jwtUtils.generateJwtCookie(userDetails);

        List<Profile> profiles = profileRepository.findAllByUser(user);
        List<ProfileMeResponse> profileResponses = profiles.stream().map(profile -> {
            ProfileMeResponse response = new ProfileMeResponse();
            response.setProfileName(profile.getProfilename());
            response.setRoleType(profile.getProfileType().name());
            response.setEmail(userDetails.getUsername());
            return response;
        }).toList();
        UserMetrics metrics = userMetricsRepository.findByUser(user)
                .orElseThrow(() -> new IllegalStateException("Metrics not found"));
        metrics.setSessionsCount(metrics.getSessionsCount() + 1);
        userMetricsRepository.save(metrics);
        if(loginSessionRepository.findFirstByUserAndActiveTrue(user).isPresent()) {
            return ResponseEntity.badRequest().body("Error: User already has an active session.");
        }
        LoginSession session = new LoginSession(user);
        loginSessionRepository.save(session);
        return ResponseEntity.ok().header(HttpHeaders.SET_COOKIE, jwtCookie.toString())
                .body(profileResponses);
    }

    /**
     * Register a new user with the provided information, including email, password,
     * time zone, profile name, and role type.
     * If the email is already in use, an error message is returned.
     * 
     * @param signUpRequest The SignupRequest object containing the new user's
     *                      information, including email, password, time zone,
     *                      profile name, and role type
     * @return A ResponseEntity containing a success message if the user is
     *         registered successfully, or an error message if the email is already
     *         in use
     */
    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody SignupRequest signUpRequest) {
        if (userRepository.existsByEmail(signUpRequest.getEmail())) {
            System.out.println("Entrada a register user excep");
            return ResponseEntity.badRequest().body("Error: Email already in use");
        } else if (profileRepository.existsByProfilename(signUpRequest.getProfilename())) {
            System.out.println("Entrada a register profile excep");
            return ResponseEntity.badRequest().body("Error: Profile name already in use");
        }
        User user = new User(signUpRequest.getEmail(),
                encoder.encode(signUpRequest.getPassword()), signUpRequest.getTimeZone());
        Profile profile = new Profile(user,
                signUpRequest.getProfilename(),
                ProfileType.valueOf(signUpRequest.getRoleType().toUpperCase()),
                "",
                null,
                null);
        userRepository.save(user);
        profileRepository.save(profile);
        userMetricsService.onUserRegister(user);
        return ResponseEntity.ok("Usuario registrado exitosamente!");
    }

    /**
     * Log out the authenticated user by clearing the JWT cookie. A success message
     * is returned in the response body.
     * 
     * @return A ResponseEntity containing a success message in the response body
     *         and a cleared JWT cookie in the response header
     */
    @PostMapping("/logout")
    public ResponseEntity<?> logoutUser(Authentication authentication) {
        if (authentication != null) {
                User user = utilsCalls.getUserFromUsername(authentication).orElse(null);
                if (user == null) {
                    return ResponseEntity.badRequest().body("Error: User not found.");
                }
                try{
                    userMetricsService.onSessionClosed(user);
                } catch (IllegalStateException e) {
                    return ResponseEntity.badRequest().body("Error: " + e.getMessage());
                }
        }
        ResponseCookie cookie = jwtUtils.getCleanJwtCookie();
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body("Sesión cerrada.");
    }
}