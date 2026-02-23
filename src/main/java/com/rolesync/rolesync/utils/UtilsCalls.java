package com.rolesync.rolesync.utils;

import java.util.Arrays;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import com.rolesync.rolesync.model.Campaign;
import com.rolesync.rolesync.model.Profile;
import com.rolesync.rolesync.model.ProfileType;
import com.rolesync.rolesync.model.User;
import com.rolesync.rolesync.repository.ProfileRepository;
import com.rolesync.rolesync.repository.UserRepository;

@Component
public class UtilsCalls {

    @Autowired ProfileRepository profileRepository;
    @Autowired UserRepository userRepository;

    public Optional<Profile> getProfileFromAuthentication(Authentication authentication, String roleType) {
        String principal = authentication.getName();
        ProfileType profileType = ProfileType.valueOf(roleType.toUpperCase());
        Optional<Profile> profile = profileRepository.findByUsernameAndProfileType(principal, profileType);
        return profile;
    }

    public Optional<Profile> getProfileFromAuthentication(Authentication authentication) {
        String principal = authentication.getName();
        Optional<Profile> profile = profileRepository.findByProfilename(principal);
        return profile;
    }

    public Optional<User> getUserFromUsername(Authentication authentication) {
        String username = authentication.getName();
        Optional<User> user = userRepository.findByEmail(username);
        return user;
    }

    public String getUserRelationToCampaign(Authentication authentication, Campaign campaign) {
        Optional<Profile> profileOpt = getProfileFromAuthentication(authentication, campaign.getCampaignType().name());
        if (profileOpt.isPresent()) {
            Profile profile = profileOpt.get();
            if (profile.getProfilename().equals(campaign.getOwnerName())) {
                return "OWNER";
            } else if(campaign.getMembers()!=null && Arrays.asList(campaign.getMembers()).contains(profile.getProfilename())) {
                return "MEMBER";
            }
        }
        return "NONE";
    }
}