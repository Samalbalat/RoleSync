package com.rolesync.rolesync.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.RestController;

import com.rolesync.rolesync.entities.Profile;
import com.rolesync.rolesync.services.ProfileService;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;


@RestController
public class RegistrationController {

    @Autowired
    private ProfileService profileService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostMapping(value = "/req/signup", consumes = "application/json")
    public Profile createProfile(@RequestBody Profile profile) {
        profile.setPassword(passwordEncoder.encode(profile.getPassword()));
        return profileService.saveProfile(profile);
    }
    
    
}
