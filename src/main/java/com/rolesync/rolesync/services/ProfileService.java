package com.rolesync.rolesync.services;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.rolesync.rolesync.entities.Profile;
import com.rolesync.rolesync.repositories.ProfileRepository;

@Service
public class ProfileService {
    // This service will handle profile-related operations
    @Autowired
    private ProfileRepository profileRepository;

    // This method retrieves all profiles
    public List<Profile> getAllProfiles() {
        return (List<Profile>) profileRepository.findAll();
    }

    // This method retrieves a profile by its ID
    public Profile getProfileById(Long id) {
        return profileRepository.findById(id).orElse(null);
    }

    // This method saves a profile
    public Profile saveProfile(Profile profile) {
        return profileRepository.save(profile);
    }

    // This method deletes a profile by its ID
    public void deleteProfile(Long id) {
        profileRepository.deleteById(id);
    }

}
