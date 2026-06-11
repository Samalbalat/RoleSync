package com.rolesync.rolesync.utils;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.springframework.security.core.Authentication;

import com.rolesync.rolesync.model.Campaign;
import com.rolesync.rolesync.model.CampaignRequest;
import com.rolesync.rolesync.model.CampaignRequestStatus;
import com.rolesync.rolesync.model.Profile;
import com.rolesync.rolesync.model.User;
import com.rolesync.rolesync.repository.CampaignRequestRepository;
import com.rolesync.rolesync.repository.ProfileRepository;
import com.rolesync.rolesync.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = org.mockito.quality.Strictness.LENIENT)
class UtilsCallsTest {

    @Mock ProfileRepository profileRepository;
    @Mock UserRepository userRepository;
    @Mock CampaignRequestRepository campaignRequestRepository;
    @Mock Authentication authentication;

    @InjectMocks UtilsCalls utilsCalls;

    private User user;
    private Profile profile;
    private Profile ownerProfile;
    private Campaign campaign;

    @BeforeEach
    void setUp() {
        user = new User();

        profile = new Profile();
        profile.setProfilename("player1");

        ownerProfile = new Profile();
        ownerProfile.setProfilename("owner");

        campaign = mock(Campaign.class);

        User ownerUser = new User();
        ownerProfile.setUser(ownerUser);
    }

    // -------------------------
    // getUserFromUsername
    // -------------------------

    @Test
    void getUserFromUsernameFound() {
        when(authentication.getName()).thenReturn("mail@test.com");
        when(userRepository.findByEmail("mail@test.com"))
                .thenReturn(Optional.of(user));

        Optional<User> result = utilsCalls.getUserFromUsername(authentication);

        assertTrue(result.isPresent());
        assertEquals(user, result.get());
    }

    @Test
    void getUserFromUsernameNotFound() {
        when(authentication.getName()).thenReturn("mail@test.com");
        when(userRepository.findByEmail("mail@test.com"))
                .thenReturn(Optional.empty());

        Optional<User> result = utilsCalls.getUserFromUsername(authentication);

        assertTrue(result.isEmpty());
    }

    // -------------------------
    // getProfileRelationToCampaign
    // -------------------------

    @Test
    void getProfileRelationOwner() {
        when(profileRepository.findByProfilename("player1"))
                .thenReturn(Optional.of(profile));

        when(campaign.getOwner()).thenReturn(ownerProfile);

        ownerProfile.setProfilename("player1");

        String result = utilsCalls.getProfileRelationToCampaign("player1", campaign);

        assertEquals("OWNER", result);
    }

    @Test
    void getProfileRelationMember() {
        when(profileRepository.findByProfilename("player1"))
                .thenReturn(Optional.of(profile));

        when(campaign.getOwner()).thenReturn(ownerProfile);
        when(campaign.getMembers()).thenReturn(List.of("player1"));

        String result = utilsCalls.getProfileRelationToCampaign("player1", campaign);

        assertEquals("MEMBER", result);
    }

    @Test
    void getProfileRelationPending() {
        when(profileRepository.findByProfilename("player1"))
                .thenReturn(Optional.of(profile));

        when(campaign.getOwner()).thenReturn(ownerProfile);
        when(campaign.getMembers()).thenReturn(List.of());

        CampaignRequest cr = new CampaignRequest();
        cr.setStatus(CampaignRequestStatus.PENDING);

        when(campaignRequestRepository.findAllByCampaignAndProfile(campaign, profile))
                .thenReturn(List.of(cr));

        when(campaignRequestRepository.findTopByCampaignAndProfileOrderByIdDesc(campaign, profile))
                .thenReturn(Optional.of(cr));
        String result = utilsCalls.getProfileRelationToCampaign("player1", campaign);

        assertEquals("PENDING", result);
    }

    @Test
    void getProfileRelationNoneProfileNotFound() {
        when(profileRepository.findByProfilename("player1"))
                .thenReturn(Optional.empty());

        String result = utilsCalls.getProfileRelationToCampaign("player1", campaign);

        assertEquals("NONE", result);
    }

    @Test
    void getProfileRelationNoneCampaignNull() {
        when(profileRepository.findByProfilename("player1"))
                .thenReturn(Optional.of(profile));

        String result = utilsCalls.getProfileRelationToCampaign("player1", null);

        assertEquals("NONE", result);
    }

    @Test
    void getProfileRelationNoneNoConditionsMatch() {
        when(profileRepository.findByProfilename("player1"))
                .thenReturn(Optional.of(profile));

        when(campaign.getOwner()).thenReturn(ownerProfile);
        ownerProfile.setProfilename("someoneElse");
        when(campaign.getMembers()).thenReturn(List.of("x", "y"));
        when(campaignRequestRepository.findAllByCampaignAndProfile(campaign, profile))
                .thenReturn(List.of());

        String result = utilsCalls.getProfileRelationToCampaign("player1", campaign);

        assertEquals("NONE", result);
    }

    // -------------------------
    // checkAuthAndProfile
    // -------------------------

    @Test
    void checkAuthAndProfileTrue() {
        when(authentication.getName()).thenReturn("mail@test.com");
        when(userRepository.findByEmail("mail@test.com"))
                .thenReturn(Optional.of(user));

        Profile p1 = new Profile();
        p1.setProfilename("player1");

        when(profileRepository.findAllByUser(user))
                .thenReturn(List.of(p1));

        boolean result = utilsCalls.checkAuthAndProfile(authentication, "player1");

        assertTrue(result);
    }

    @Test
    void checkAuthAndProfileFalseNoUser() {
        when(authentication.getName()).thenReturn("mail@test.com");
        when(userRepository.findByEmail("mail@test.com"))
                .thenReturn(Optional.empty());

        boolean result = utilsCalls.checkAuthAndProfile(authentication, "player1");

        assertFalse(result);
    }

    @Test
    void checkAuthAndProfileFalseProfileNotMatch() {
        when(authentication.getName()).thenReturn("mail@test.com");
        when(userRepository.findByEmail("mail@test.com"))
                .thenReturn(Optional.of(user));

        Profile p1 = new Profile();
        p1.setProfilename("other");

        when(profileRepository.findAllByUser(user))
                .thenReturn(List.of(p1));

        boolean result = utilsCalls.checkAuthAndProfile(authentication, "player1");

        assertFalse(result);
    }
}
