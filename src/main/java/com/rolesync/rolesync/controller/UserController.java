package com.rolesync.rolesync.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.rolesync.rolesync.dto.SimpleProfileDTO;
import com.rolesync.rolesync.dto.UserInfoResponseDetailed;
import com.rolesync.rolesync.dto.UserPutInDTO;
import com.rolesync.rolesync.model.Profile;
import com.rolesync.rolesync.model.User;
import com.rolesync.rolesync.repository.ProfileRepository;
import com.rolesync.rolesync.repository.UserRepository;
import com.rolesync.rolesync.security.jwt.JwtUtils;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;


@RestController
@RequestMapping("/rolesync")
public class UserController {
    @Autowired UserRepository userRepository;
    @Autowired ProfileRepository profileRepository;
    @Autowired PasswordEncoder encoder;
    @Autowired JwtUtils jwtUtils;


    @GetMapping("/me")
    public String getMethodName(Authentication authentication) {
        //TO-DO return user info
        return authentication.getPrincipal().toString();
    }

    @GetMapping("/user")
    public String getUserInfo(Authentication authentication) {
        String username = authentication.getPrincipal().toString();
        Optional<User> user = userRepository.findByEmail(username);
        if (user.isPresent()) {
            List<Profile> profiles = profileRepository.findAllByUsername(username);
            UserInfoResponseDetailed response = new UserInfoResponseDetailed();
            response.setId(user.get().getId());
            response.setEmail(user.get().getEmail());
            response.setTimeZone(user.get().getTimeZone());
            List<SimpleProfileDTO> profileDTOs = profiles.stream().map(profile -> 
                new SimpleProfileDTO(profile.getId(), profile.getProfilename(), profile.getImage())
            ).toList();
            return profileDTOs.toString();
        } else {
            return "User not found";
        }
    }

    @PutMapping("/user")
    public void putMethodName(Authentication authentication, @RequestBody UserPutInDTO userPutInDTO) {
        String username = authentication.getPrincipal().toString();
        Optional<User> user = userRepository.findByEmail(username);
        if (user.isPresent()) {
            User updatedUser = user.get();
            updatedUser.setEmail(userPutInDTO.getEmail());
            updatedUser.setTimeZone(userPutInDTO.getTimeZone());
            updatedUser.setPassword(encoder.encode(userPutInDTO.getPassword()));
            userRepository.save(updatedUser);
        }
    }
}
