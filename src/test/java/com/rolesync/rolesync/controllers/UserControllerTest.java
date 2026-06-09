package com.rolesync.rolesync.controllers;

import com.rolesync.rolesync.controller.UserController;
import com.rolesync.rolesync.dto.usercontroller.UserPutInDTO;
import com.rolesync.rolesync.model.Profile;
import com.rolesync.rolesync.model.ProfileType;
import com.rolesync.rolesync.model.User;
import com.rolesync.rolesync.repository.ProfileRepository;
import com.rolesync.rolesync.repository.UserRepository;
import com.rolesync.rolesync.security.jwt.JwtUtils;
import com.rolesync.rolesync.utils.UtilsCalls;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserControllerTest {

    @Mock
    UserRepository userRepository;
    @Mock
    ProfileRepository profileRepository;
    @Mock
    PasswordEncoder encoder;
    @Mock
    JwtUtils jwtUtils;
    @Mock
    UtilsCalls utilsCalls;
    @Mock
    Authentication authentication;

    @InjectMocks
    UserController controller;

    private User user;
    private Profile profile;

    @BeforeEach
    void setup() {
        user = new User();
        user.setId(1L);
        user.setEmail("test@mail.com");
        user.setPassword("OldPass123!");

        profile = new Profile();
        profile.setId(10L);
        profile.setProfilename("testUser");
        profile.setProfileType(ProfileType.TABLETOP);
    }

    // --------------------------------------------------
    // GET /me
    // --------------------------------------------------
    @Test
    void shouldReturn200_getMe() {
        Object principal = new Object();

        when(authentication.getPrincipal()).thenReturn(principal);

        ResponseEntity<?> res = controller.getMe(authentication);

        assertEquals(200, res.getStatusCode().value());
        assertEquals(principal, res.getBody());
    }

    // --------------------------------------------------
    // GET /user - not found
    // --------------------------------------------------
    @Test
    void shouldReturn404_getUserInfo_notFound() {
        when(utilsCalls.getUserFromUsername(authentication))
                .thenReturn(Optional.empty());

        ResponseEntity<?> res = controller.getUserInfo(authentication);

        assertEquals(404, res.getStatusCode().value());
    }

    // --------------------------------------------------
    // GET /user - success
    // --------------------------------------------------
    @Test
    void shouldReturn200_getUserInfo_success() {
        when(utilsCalls.getUserFromUsername(authentication))
                .thenReturn(Optional.of(user));

        when(profileRepository.findAllByUser(user))
                .thenReturn(List.of(profile));

        ResponseEntity<?> res = controller.getUserInfo(authentication);

        assertEquals(200, res.getStatusCode().value());
    }

    // --------------------------------------------------
    // PUT /user - user not found
    // --------------------------------------------------
    @Test
    void shouldReturn404_putUserInfo_notFound() {
        when(utilsCalls.getUserFromUsername(authentication))
                .thenReturn(Optional.empty());

        UserPutInDTO dto = new UserPutInDTO();

        ResponseEntity<?> res = controller.putUserInfo(authentication, dto);

        assertEquals(404, res.getStatusCode().value());
    }

    // --------------------------------------------------
    // PUT /user - blank fields
    // --------------------------------------------------
    @Test
    void shouldReturn400_putUserInfo_blankFields() {
        when(utilsCalls.getUserFromUsername(authentication))
                .thenReturn(Optional.of(user));

        UserPutInDTO dto = new UserPutInDTO();
        dto.setEmail("");
        dto.setPassword("");
        dto.setTimeZone("");

        ResponseEntity<?> res = controller.putUserInfo(authentication, dto);

        assertEquals(400, res.getStatusCode().value());
    }

    // --------------------------------------------------
    // PUT /user - email conflict
    // --------------------------------------------------
    @Test
    void shouldReturn403_putUserInfo_emailConflict() {
        when(utilsCalls.getUserFromUsername(authentication))
                .thenReturn(Optional.of(user));

        UserPutInDTO dto = new UserPutInDTO();
        dto.setEmail("other@mail.com");
        dto.setPassword("Valid123!");
        dto.setTimeZone("UTC");
        dto.setOldPassword("OldPass123!");

        when(userRepository.findByEmail("other@mail.com"))
                .thenReturn(Optional.of(new User()));

        ResponseEntity<?> res = controller.putUserInfo(authentication, dto);

        assertEquals(403, res.getStatusCode().value());
    }

    // --------------------------------------------------
    // PUT /user - wrong old password
    // --------------------------------------------------
    @Test
    void shouldReturn403_putUserInfo_wrongOldPassword() {
        when(utilsCalls.getUserFromUsername(authentication))
                .thenReturn(Optional.of(user));

        UserPutInDTO dto = new UserPutInDTO();
        dto.setEmail("test@mail.com");
        dto.setPassword("Valid123!");
        dto.setTimeZone("UTC");
        dto.setOldPassword("WRONG");

        ResponseEntity<?> res = controller.putUserInfo(authentication, dto);

        assertEquals(403, res.getStatusCode().value());
    }

    // --------------------------------------------------
    // PUT /user - invalid password policy
    // --------------------------------------------------
    @Test
    void shouldReturn400_putUserInfo_invalidPassword() {
        when(utilsCalls.getUserFromUsername(authentication))
                .thenReturn(Optional.of(user));

        UserPutInDTO dto = new UserPutInDTO();
        dto.setEmail("test@mail.com");
        dto.setPassword("weak"); // invalid
        dto.setTimeZone("UTC");
        dto.setOldPassword("OldPass123!");

        ResponseEntity<?> res = controller.putUserInfo(authentication, dto);

        assertEquals(400, res.getStatusCode().value());
    }

    // --------------------------------------------------
    // PUT /user - success
    // --------------------------------------------------
    @Test
    void shouldReturn200_putUserInfo_success() {
        when(utilsCalls.getUserFromUsername(authentication))
                .thenReturn(Optional.of(user));

        // IMPORTANT: must match old password exactly
        user.setPassword("OldPass123!");

        UserPutInDTO dto = new UserPutInDTO();
        dto.setEmail("new@mail.com");
        dto.setPassword("Valid123@"); // FIXED: valid regex
        dto.setTimeZone("UTC");
        dto.setOldPassword("OldPass123!");

        when(userRepository.findByEmail("new@mail.com"))
                .thenReturn(Optional.empty());

        when(encoder.encode("Valid123@"))
                .thenReturn("ENCODED");

        ResponseEntity<?> res = controller.putUserInfo(authentication, dto);

        assertEquals(200, res.getStatusCode().value());

        verify(userRepository).save(any(User.class));
    }
}