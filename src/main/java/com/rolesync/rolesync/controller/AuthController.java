package com.rolesync.rolesync.controller;


import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.bind.annotation.*;

import com.rolesync.rolesync.dto.LoginRequest;
import com.rolesync.rolesync.dto.ProfileMeResponse;
import com.rolesync.rolesync.dto.SignupRequest;
import com.rolesync.rolesync.dto.UserInfoResponse;
import com.rolesync.rolesync.model.Profile;
import com.rolesync.rolesync.model.User;
import com.rolesync.rolesync.repository.UserRepository;
import com.rolesync.rolesync.repository.ProfileRepository;
import com.rolesync.rolesync.security.jwt.JwtUtils;
import com.rolesync.rolesync.security.service.UserDetailsImpl;

import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/rolesync/auth")
public class AuthController {
    @Autowired AuthenticationManager authenticationManager;
    @Autowired ProfileRepository profileRepository;
    @Autowired UserRepository userRepository;
    @Autowired PasswordEncoder encoder;
    @Autowired JwtUtils jwtUtils;

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@RequestBody LoginRequest loginRequest) {
        System.out.println(loginRequest);
        User user = userRepository.findByEmail(loginRequest.getEmail())
                .orElseThrow(() -> new RuntimeException("Error: Usuario no encontrado."));
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(user.getEmail(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        ResponseCookie jwtCookie = jwtUtils.generateJwtCookie(userDetails);

        List<Profile> profiles = profileRepository.findAllByUsername(userDetails.getUsername());
        List<ProfileMeResponse> profileResponses = profiles.stream().map(profile -> {
            ProfileMeResponse response = new ProfileMeResponse();
            response.setProfileName(profile.getProfilename());
            response.setRoleType(profile.getProfileType().name());
            response.setEmail(userDetails.getUsername());
            return response;
        }).toList();
        return ResponseEntity.ok().header(HttpHeaders.SET_COOKIE, jwtCookie.toString())
                .body(profileResponses);
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody SignupRequest signUpRequest) {
        if (userRepository.existsByEmail(signUpRequest.getEmail())) {
            return ResponseEntity.badRequest().body("Error: Username ya está en uso");
        }

        User user = new User(signUpRequest.getEmail(),
                encoder.encode(signUpRequest.getPassword()), signUpRequest.getTimeZone());
        Profile profile = new Profile(signUpRequest.getEmail(), signUpRequest.getProfilename()
        ,signUpRequest.getRoleType(),null);

        userRepository.save(user);
        profileRepository.save(profile);
        return ResponseEntity.ok("Usuario registrado exitosamente!");
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logoutUser() {
        ResponseCookie cookie = jwtUtils.getCleanJwtCookie();
        return ResponseEntity.ok().header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body("Sesión cerrada.");
    }
}