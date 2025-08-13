package com.rolesync.rolesync.services;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.rolesync.rolesync.entities.Profile;
import com.rolesync.rolesync.repositories.ProfileRepository;

import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class ProfileService implements UserDetailsService{
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

    @Override
    public UserDetails loadUserByUsername(String name) throws UsernameNotFoundException {
        Optional<Profile> profile = profileRepository.findByName(name);
        if(profile.isPresent()) {
            var p = profile.get();
            return User.builder()
            .username(p.getName())
            .password(p.getPassword())
            .build();
        } else {
           throw new UsernameNotFoundException("Profile not found with name: " + name);
        }
    }

}
