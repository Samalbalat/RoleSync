package com.rolesync.rolesync.controllers;

import com.rolesync.rolesync.controller.ProfileController;
import com.rolesync.rolesync.dto.profilecontroller.ProfileInDTO;
import com.rolesync.rolesync.model.Profile;
import com.rolesync.rolesync.model.ProfileType;
import com.rolesync.rolesync.model.User;
import com.rolesync.rolesync.repository.ProfileRepository;
import com.rolesync.rolesync.repository.UserRepository;
import com.rolesync.rolesync.repository.UserMetricsRepository;
import com.rolesync.rolesync.security.jwt.JwtUtils;
import com.rolesync.rolesync.services.ReviewService;
import com.rolesync.rolesync.utils.UtilsCalls;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProfileControllerTest {

    @Mock
    UserRepository userRepository;
    @Mock
    ProfileRepository profileRepository;
    @Mock
    JwtUtils jwtUtils;
    @Mock
    UtilsCalls utilsCalls;
    @Mock
    UserMetricsRepository metricsRepository;
    @Mock
    ReviewService reviewService;
    @Mock
    Authentication authentication;

    @InjectMocks
    ProfileController controller;

    private User user;
    private Profile profile;

    @BeforeEach
    void setup() {
        user = new User();

        profile = new Profile();
        profile.setId(1L);
        profile.setProfilename("testUser");
        profile.setDescription("desc");
        profile.setImage("img");
        profile.setProfileType(ProfileType.WRITTEN);
    }

    // --------------------------------------------------
    // GET PROFILE - FOUND
    // --------------------------------------------------
    @Test
    void shouldReturn200_getProfile_found() {
        when(profileRepository.findByProfilename("testUser"))
                .thenReturn(Optional.of(profile));

        when(reviewService.getSummary(any(), anyLong()))
                .thenReturn(null);

        ResponseEntity<?> res = controller.getProfile(
                authentication, "WRITTEN", "testUser");

        assertEquals(200, res.getStatusCode().value());
    }

    // --------------------------------------------------
    // GET PROFILE - NOT FOUND
    // --------------------------------------------------
    @Test
    void shouldReturn404_getProfile_notFound() {
        when(profileRepository.findByProfilename("missing"))
                .thenReturn(Optional.empty());

        ResponseEntity<?> res = controller.getProfile(
                authentication, "WRITTEN", "missing");

        assertEquals(404, res.getStatusCode().value());
    }

    // --------------------------------------------------
    // GET PROFILE BY NAME - FOUND
    // --------------------------------------------------
    @Test
    void shouldReturn200_getProfileByName_found() {
        when(profileRepository.findByProfilename("other"))
                .thenReturn(Optional.of(profile));

        when(reviewService.getSummary(any(), anyLong()))
                .thenReturn(null);

        ResponseEntity<?> res = controller.getProfileByName(
                authentication, "WRITTEN", "other", "testUser");

        assertEquals(200, res.getStatusCode().value());
    }

    // --------------------------------------------------
    // GET PROFILE BY NAME - NOT FOUND
    // --------------------------------------------------
    @Test
    void shouldReturn404_getProfileByName_notFound() {
        when(profileRepository.findByProfilename("other"))
                .thenReturn(Optional.empty());

        ResponseEntity<?> res = controller.getProfileByName(
                authentication, "WRITTEN", "other", "testUser");

        assertEquals(404, res.getStatusCode().value());
    }

    // --------------------------------------------------
    // PUT PROFILE - AUTH FAIL
    // --------------------------------------------------
    @Test
    void shouldReturn403_putProfile_authFail() {
        when(utilsCalls.checkAuthAndProfile(authentication, "testUser"))
                .thenReturn(false);

        ProfileInDTO dto = new ProfileInDTO();
        dto.setProfileName("newName");

        ResponseEntity<?> res = controller.putProfile(
                authentication, "WRITTEN", dto, "testUser");

        assertEquals(403, res.getStatusCode().value());
    }

    // --------------------------------------------------
    // PUT PROFILE - NAME CONFLICT
    // --------------------------------------------------
    @Test
    void shouldReturn403_putProfile_nameConflict() {
        when(utilsCalls.checkAuthAndProfile(authentication, "testUser"))
                .thenReturn(true);

        Profile existing = new Profile();
        existing.setProfilename("newName");

        when(profileRepository.findByProfilename("newName"))
                .thenReturn(Optional.of(existing));

        ProfileInDTO dto = new ProfileInDTO();
        dto.setProfileName("newName");

        ResponseEntity<?> res = controller.putProfile(
                authentication, "WRITTEN", dto, "testUser");

        assertEquals(403, res.getStatusCode().value());
    }

    // --------------------------------------------------
    // PUT PROFILE - NOT FOUND
    // --------------------------------------------------
    @Test
    void shouldReturn404_putProfile_notFound() {
        when(utilsCalls.checkAuthAndProfile(authentication, "testUser"))
                .thenReturn(true);

        when(profileRepository.findByProfilename("testUser"))
                .thenReturn(Optional.empty());

        ProfileInDTO dto = new ProfileInDTO();
        dto.setProfileName("testUser");

        ResponseEntity<?> res = controller.putProfile(
                authentication, "WRITTEN", dto, "testUser");

        assertEquals(404, res.getStatusCode().value());
    }

    // --------------------------------------------------
    // PUT PROFILE - SUCCESS
    // --------------------------------------------------
    @Test
    void shouldReturn200_putProfile_success() {
        when(utilsCalls.checkAuthAndProfile(authentication, "testUser"))
                .thenReturn(true);

        when(profileRepository.findByProfilename("newName"))
                .thenReturn(Optional.empty());

        when(profileRepository.findByProfilename("testUser"))
                .thenReturn(Optional.of(profile));

        ProfileInDTO dto = new ProfileInDTO();
        dto.setProfileName("newName");
        dto.setDescription("newDesc");
        dto.setImage("newImg");

        ResponseEntity<?> res = controller.putProfile(
                authentication, "WRITTEN", dto, "testUser");

        assertEquals(200, res.getStatusCode().value());
        verify(profileRepository).save(any(Profile.class));
    }

    // --------------------------------------------------
    // POST PROFILE - AUTH FAIL
    // --------------------------------------------------
    @Test
    void shouldReturn403_postProfile_authFail() {
        when(utilsCalls.checkAuthAndProfile(authentication, "testUser"))
                .thenReturn(false);

        ProfileInDTO dto = new ProfileInDTO();

        ResponseEntity<?> res = controller.postProfile(
                authentication, "WRITTEN", dto, "testUser");

        assertEquals(403, res.getStatusCode().value());
    }

    // --------------------------------------------------
    // POST PROFILE - 2 PROFILES LIMIT
    // --------------------------------------------------
    @Test
    void shouldReturn403_postProfile_twoProfiles() {
        when(utilsCalls.checkAuthAndProfile(authentication, "testUser"))
                .thenReturn(true);

        when(utilsCalls.getUserFromUsername(authentication))
                .thenReturn(Optional.of(user));

        when(profileRepository.findAllByUser(user))
                .thenReturn(List.of(new Profile(), new Profile()));

        ProfileInDTO dto = new ProfileInDTO();

        ResponseEntity<?> res = controller.postProfile(
                authentication, "WRITTEN", dto, "testUser");

        assertEquals(403, res.getStatusCode().value());
    }

    // --------------------------------------------------
    // POST PROFILE - ROLE OR NAME CONFLICT
    // --------------------------------------------------
    @Test
    void shouldReturn403_postProfile_conflict() {
        when(utilsCalls.checkAuthAndProfile(authentication, "testUser"))
                .thenReturn(true);

        when(utilsCalls.getUserFromUsername(authentication))
                .thenReturn(Optional.of(user));

        Profile existing = new Profile();
        existing.setProfileType(ProfileType.WRITTEN);
        existing.setProfilename("testUser");

        when(profileRepository.findAllByUser(user))
                .thenReturn(List.of(existing));

        ProfileInDTO dto = new ProfileInDTO();
        dto.setProfileName("testUser");

        ResponseEntity<?> res = controller.postProfile(
                authentication, "WRITTEN", dto, "testUser");

        assertEquals(403, res.getStatusCode().value());
    }

    // --------------------------------------------------
    // POST PROFILE - SUCCESS
    // --------------------------------------------------
    @Test
    void shouldReturn201_postProfile_success() {
        when(utilsCalls.checkAuthAndProfile(authentication, "testUser"))
                .thenReturn(true);

        when(utilsCalls.getUserFromUsername(authentication))
                .thenReturn(Optional.of(user));

        when(profileRepository.findAllByUser(user))
                .thenReturn(List.of());

        ProfileInDTO dto = new ProfileInDTO();
        dto.setProfileName("newProfile");
        dto.setImage("img");
        dto.setDescription("desc");

        ResponseEntity<?> res = controller.postProfile(
                authentication, "WRITTEN", dto, "testUser");

        assertEquals(201, res.getStatusCode().value());
        verify(profileRepository).save(any(Profile.class));
    }
}