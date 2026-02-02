package com.rolesync.rolesync.controller;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.rolesync.rolesync.dto.profileControllerDTOs.ProfilePostInDTO;
import com.rolesync.rolesync.model.Profile;
import com.rolesync.rolesync.model.ProfileType;
import com.rolesync.rolesync.repository.ProfileRepository;
import com.rolesync.rolesync.security.jwt.JwtUtils;


@RestController
@RequestMapping("/rolesync")
public class ProfileController {
    @Autowired ProfileRepository profileRepository;
    @Autowired JwtUtils jwtUtils;

    @GetMapping("/profile/{roleType}")
    public ResponseEntity<?> getProfile(Authentication authentication, @PathVariable String roleType) {
        String principal = authentication.getPrincipal().toString();
        Optional<Profile> profile = profileRepository.findByUsernameAndProfileType(principal, roleType);
        if (profile.isPresent()) {
            System.out.println("Profile found: " + profile.get());
            ProfilePostInDTO response = profile.map(p -> 
            new ProfilePostInDTO(p.getProfilename(), p.getImage(), p.getDescription())
        ).orElse(null);
        return ResponseEntity.ok()
                .body(response);
        }else{
            return ResponseEntity.status(404).body("Profile not found");
        }
    }

    @PutMapping("/profile/{roleType}")
    public ResponseEntity<?> putProfile(Authentication authentication, @PathVariable String roleType) {
        String principal = authentication.getPrincipal().toString();
        Optional<Profile> profile = profileRepository.findByUsernameAndProfileType(principal, roleType);
        if (profile.isPresent()) {
            System.out.println("Profile found: " + profile.get());
            Profile editable = profile.get();
            editable.setDescription(profile.get().getDescription());
            editable.setImage(profile.get().getImage());
            editable.setProfilename(profile.get().getProfilename());
            profileRepository.save(editable);
            return ResponseEntity.ok().build();

        }else{
            return ResponseEntity.status(404).body("Profile not found");
        }  
    }
    /*
    * Create a profile for the authenticated user with the given roleType if it does not exist
    *
    * @param authentication The authentication object containing the user's details
    * @param roleType The role type of the profile to be created
    * @param profilePostInDTO The profile data to be created
    * @return ResponseEntity indicating the result of the operation
    * 
    */
    @PostMapping("/profile/{roleType}")
    public ResponseEntity<?> postProfile(Authentication authentication, @PathVariable String roleType, @RequestBody ProfilePostInDTO profilePostInDTO) {
        String principal = authentication.getPrincipal().toString();
        Optional<Profile> profile = profileRepository.findByUsernameAndProfileType(principal, roleType);
        if (!profile.isPresent()) {
            System.out.println("Profile not found for user: " + principal + " and roleType: " + roleType);
            Profile newProfile = new Profile();
            newProfile.setUsername(principal);
            newProfile.setProfileType(ProfileType.valueOf(roleType));
            newProfile.setProfilename(profilePostInDTO.getProfileName());
            newProfile.setImage(profilePostInDTO.getImage());
            newProfile.setDescription(profilePostInDTO.getDescription());
            profileRepository.save(newProfile);
            return ResponseEntity.status(201).build();

        }else{
            return ResponseEntity.status(403).body("Profile already exists");
        }  
    }
    
}
