package com.rolesync.rolesync.utils;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import com.rolesync.rolesync.model.Campaign;
import com.rolesync.rolesync.model.Profile;
import com.rolesync.rolesync.model.User;
import com.rolesync.rolesync.repository.CampaignRequestRepository;
import com.rolesync.rolesync.repository.ProfileRepository;
import com.rolesync.rolesync.repository.UserRepository;

@Component
public class UtilsCalls {

    @Autowired ProfileRepository profileRepository;
    @Autowired UserRepository userRepository;
    @Autowired CampaignRequestRepository campaignRequestRepository;

    public Optional<User> getUserFromUsername(Authentication authentication) {
        String username = authentication.getName();
        Optional<User> user = userRepository.findByEmail(username);
        return user;
    }

    public String getProfileRelationToCampaign(String profileName, Campaign campaign) {
        Optional<Profile> profileOpt = profileRepository.findByProfilename(profileName);
        if (profileOpt.isPresent()) {
            String profileNameRetrieved = profileOpt.get().getProfilename();
            Profile profile = profileOpt.get();
            if (profileNameRetrieved.equals(campaign.getOwnerName())) {
                return "OWNER";
            } else if(campaign.getMembers()!=null && campaign.getMembers().contains(profileNameRetrieved)) {
                return "MEMBER";
            } else if(campaignRequestRepository.findAllByCampaignAndProfile(campaign, profile)!=null && !campaignRequestRepository.findAllByCampaignAndProfile(campaign, profile).isEmpty()) {
                return "PENDING";
            }
        }
        return "NONE";
    }

    public boolean checkAuthAndProfile(Authentication authentication, String profileName) {
        Optional<User> userOpt = getUserFromUsername(authentication);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            List<Profile> userProfiles = profileRepository.findAllByUsername(user.getEmail());
                if (userProfiles.stream().anyMatch(p -> p.getProfilename().equals(profileName))) {
                return true;
            }
        }
        return false;
    }
}