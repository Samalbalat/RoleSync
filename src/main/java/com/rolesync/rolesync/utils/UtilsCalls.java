package com.rolesync.rolesync.utils;

import java.util.Arrays;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import com.rolesync.rolesync.model.Campaign;
import com.rolesync.rolesync.model.Profile;
import com.rolesync.rolesync.model.User;
import com.rolesync.rolesync.repository.ProfileRepository;
import com.rolesync.rolesync.repository.UserRepository;

@Component
public class UtilsCalls {

    @Autowired ProfileRepository profileRepository;
    @Autowired UserRepository userRepository;

    public Optional<User> getUserFromUsername(Authentication authentication) {
        String username = authentication.getName();
        Optional<User> user = userRepository.findByEmail(username);
        return user;
    }

    public String getProfileRelationToCampaign(String profileName, Campaign campaign) {
        Optional<Profile> profileOpt = profileRepository.findByProfilename(profileName);
        if (profileOpt.isPresent()) {
            String profileNameRetrieved = profileOpt.get().getProfilename();
            if (profileNameRetrieved.equals(campaign.getOwnerName())) {
                return "OWNER";
            } else if(campaign.getMembers()!=null && Arrays.asList(campaign.getMembers()).contains(profileNameRetrieved)) {
                return "MEMBER";
            }
        }
        return "NONE";
    }
}