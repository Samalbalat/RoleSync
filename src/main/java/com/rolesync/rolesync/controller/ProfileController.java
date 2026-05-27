package com.rolesync.rolesync.controller;

import com.rolesync.rolesync.repository.UserRepository;
import java.util.List;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.rolesync.rolesync.dto.profilecontroller.ProfileInDTO;
import com.rolesync.rolesync.dto.profilecontroller.ProfileOutDTO;
import com.rolesync.rolesync.model.Profile;
import com.rolesync.rolesync.model.ProfileType;
import com.rolesync.rolesync.model.ReviewTargetType;
import com.rolesync.rolesync.model.User;
import com.rolesync.rolesync.repository.UserMetricsRepository;
import com.rolesync.rolesync.repository.ProfileRepository;
import com.rolesync.rolesync.security.jwt.JwtUtils;
import com.rolesync.rolesync.services.ReviewService;
import com.rolesync.rolesync.utils.UtilsCalls;

/**
 * This controller handles all the endpoints related to user profiles.
 * It allows users to create, retrieve, and update their profiles based on their role type (Tabletop or Written).
 * The profile data includes a profile name, an image URL, and a description. 
 * The controller uses JWT authentication to ensure that only authenticated users can access and modify their profiles.
 */
@RestController
@RequestMapping("/rolesync/profile/{roleType}")
public class ProfileController {
    @Autowired UserRepository userRepository;
    @Autowired ProfileRepository profileRepository;
    @Autowired JwtUtils jwtUtils;
    @Autowired UtilsCalls utilsCalls;
    @Autowired UserMetricsRepository metricsRepository;
    @Autowired ReviewService reviewService;

    ProfileController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

     /**
     * Get the profile of the authenticated user with the given roleType. If the profile does not exist, return a 404 Not Found response.
     * @param authentication The authentication object containing the user's details
     * @param roleType The role type of the profile to be retrieved
     * @return ResponseEntity containing the profile data if found, or a 404 Not Found response if the profile does not exist
     */

    /**
     * Get the profile of the authenticated user with the given roleType. If the profile does not exist, return a 404 Not Found response.
     * @param authentication The authentication object containing the user's details
     * @param roleType The role type of the profile to be retrieved
     * @return ResponseEntity containing the profile data if found, or a 404 Not Found response if the profile does not exist
     */
    @GetMapping()
    public ResponseEntity<?> getProfile(Authentication authentication,
        @PathVariable String roleType,
        @RequestHeader("X-Profile-Name") String profileName)
        {
        Optional<Profile> profile = profileRepository.findByProfilename(profileName);
        if (profile.isPresent()) {
            ProfileOutDTO response = profile.map(p -> 
            new ProfileOutDTO(p.getId(), p.getProfilename(), p.getImage(), p.getDescription(), reviewService.getSummary(ReviewTargetType.PROFILE, p.getId()))
        ).orElse(null);
        return ResponseEntity.ok()
                .body(response);
        }else{
            return ResponseEntity.status(404).body("Profile not found");
        }
    }

    @GetMapping("/{profileToGet}")
    public ResponseEntity<?> getProfileByName(Authentication authentication,
        @PathVariable String roleType,
        @PathVariable String profileToGet,
        @RequestHeader("X-Profile-Name") String profileName)
        {
        Optional<Profile> profile = profileRepository.findByProfilename(profileToGet);
        if (profile.isPresent()) {
            ProfileOutDTO response = profile.map(p -> 
            new ProfileOutDTO(p.getId(), p.getProfilename(), p.getImage(), p.getDescription(), reviewService.getSummary(ReviewTargetType.PROFILE, p.getId()))
        ).orElse(null);
        return ResponseEntity.ok()
                .body(response);
        }else{
            return ResponseEntity.status(404).body("Profile not found");
        }
    }

    /**
     * Update the profile of the authenticated user with the given roleType. If the profile does not exist, return a 404 Not Found response.
     * @param authentication The authentication object containing the user's details
     * @param roleType The role type of the profile to be updated
     * @return ResponseEntity indicating the result of the operation
     */
    @PutMapping()
    public ResponseEntity<?> putProfile(Authentication authentication,
        @PathVariable String roleType,
        @RequestBody ProfileInDTO profilePutInDTO,
        @RequestHeader("X-Profile-Name") String profileName)
        {
        if(!utilsCalls.checkAuthAndProfile(authentication, profileName)){
             return ResponseEntity.status(403).body("Unauthorized to update this profile");
        }
        Profile activeProfile = profileRepository.findByProfilename(profilePutInDTO.getProfileName()).orElse(null);
        if(profileRepository.findByProfilename(profilePutInDTO.getProfileName()).isPresent() && !activeProfile.getProfilename().equals(profileName)){
            return ResponseEntity.status(403).body("Profile name already exists and is not the current profile");
        }
        Optional<Profile> profile = profileRepository.findByProfilename(profileName);
        if (profile.isPresent()) {
            Profile editable = profile.get();
            editable.setDescription(profilePutInDTO.getDescription());
            editable.setImage(profilePutInDTO.getImage());
            editable.setProfilename(profilePutInDTO.getProfileName());
            profileRepository.save(editable);
            return ResponseEntity.ok().build();
        }else{
            return ResponseEntity.status(404).body("Profile not found");
        }  
    }
    /**
    * Create a profile for the authenticated user with the given roleType if it does not exist already.
    * If a profile with the same roleType already exists for the user, return a 403 Forbidden response.
    *
    * @param authentication The authentication object containing the user's details
    * @param roleType The role type of the profile to be created
    * @param profilePostInDTO The profile data to be created
    * @return ResponseEntity indicating the result of the operation
    * 
    */
    @PostMapping()
    public ResponseEntity<?> postProfile(Authentication authentication,
        @PathVariable String roleType,
        @RequestBody ProfileInDTO profilePostInDTO,
        @RequestHeader("X-Profile-Name") String profileName)
        {
        if(!utilsCalls.checkAuthAndProfile(authentication, profileName)){
            return ResponseEntity.status(403).body("Unauthorized to create a profile for the current user");
        }
        User principal = utilsCalls.getUserFromUsername(authentication).get();
        List<Profile> userProfiles = profileRepository.findAllByUser(principal);
        if (userProfiles.size()==2) {
            return ResponseEntity.status(403).body("User already has profiles for both role types");
        }else if(userProfiles.stream().anyMatch(p -> p.getProfileType().toString().equalsIgnoreCase(roleType) || p.getProfilename().equals(profilePostInDTO.getProfileName()))){
            return ResponseEntity.status(403).body("User already has a profile for this role type or profile name is already taken");
        }
            
            System.out.println("Profile creation available for user: " + principal + " and roleType: " + roleType);
            
            Profile newProfile = new Profile();
            newProfile.setUser(principal);
            newProfile.setProfileType(ProfileType.valueOf(roleType.toUpperCase()));
            newProfile.setProfilename(profilePostInDTO.getProfileName());
            newProfile.setImage(profilePostInDTO.getImage());
            newProfile.setDescription(profilePostInDTO.getDescription());
            
            profileRepository.save(newProfile);
            return ResponseEntity.status(201).build();
    }
}

