package com.rolesync.rolesync.controllers;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.rolesync.rolesync.controller.CampaignController;
import com.rolesync.rolesync.dto.campaigncontroller.CampaignPutInDTO;
import com.rolesync.rolesync.dto.campaigncontroller.predicates.CampaignPredicateBuilder;
import com.rolesync.rolesync.model.Campaign;
import com.rolesync.rolesync.model.CampaignRequest;
import com.rolesync.rolesync.model.CampaignRequestStatus;
import com.rolesync.rolesync.model.Profile;

import com.rolesync.rolesync.repository.CampaignRepository;
import com.rolesync.rolesync.repository.CampaignRequestRepository;
import com.rolesync.rolesync.repository.CharacterSheetRepository;
import com.rolesync.rolesync.repository.ProfileRepository;
import com.rolesync.rolesync.services.ReviewService;
import com.rolesync.rolesync.utils.UtilsCalls;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import com.rolesync.rolesync.dto.campaigncontroller.CampaignRequestPutInDTO;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(CampaignController.class)
class CampaignControllerRequestsTest {

        @Autowired
        private MockMvc mockMvc;

        @Autowired
        private ObjectMapper objectMapper;

        @MockitoBean
        private CampaignRepository campaignRepository;

        @MockitoBean
        private ProfileRepository profileRepository;

        @MockitoBean
        private CampaignRequestRepository campaignRequestRepository;

        @MockitoBean
        private CharacterSheetRepository characterSheetRepository;

        @MockitoBean
        private ReviewService reviewService;

        @MockitoBean
        private UtilsCalls utilsCalls;

        @MockitoBean
        private CampaignPredicateBuilder campaignPredicateBuilder;

        private Authentication authentication() {
                return new UsernamePasswordAuthenticationToken(
                                "test@test.com",
                                "password");
        }

        @Test
        void shouldUpdateCampaignRequest() throws Exception {

                Campaign campaign = new Campaign();
                campaign.setId(1L);
                campaign.setOwnerName("testProfile");
                campaign.setMembers(new ArrayList<>());

                CampaignRequestPutInDTO dto = new CampaignRequestPutInDTO();
                dto.setProfileName("targetUser");
                dto.setStatus("ACCEPT");

                CampaignRequest request = new CampaignRequest();
                request.setId(123L);
                request.setCampaign(campaign);
                request.setProfile(profile("targetUser"));
                request.setStatus(CampaignRequestStatus.PENDING);

                when(utilsCalls.checkAuthAndProfile(any(), eq("testProfile")))
                                .thenReturn(true);

                when(campaignRepository.findById(1L))
                                .thenReturn(Optional.of(campaign));

                when(profileRepository.findByProfilename("targetUser"))
                                .thenReturn(Optional.of(profile("targetUser")));

                when(campaignRequestRepository.findAllByCampaignAndProfile(any(), any()))
                                .thenReturn(List.of(
                                                request));

                mockMvc.perform(put("/campaigns/1/requests")
                                .with(user("test@test.com"))
                                .with(csrf())
                                .header("X-Profile-Name", "testProfile")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(dto))
                                .principal(authentication()))
                                .andExpect(status().isOk());

                verify(campaignRepository).save(any());
        }

        @Test
        @DisplayName("POST /campaigns/{id}/kick - should kick member")
        void shouldKickMember() throws Exception {

                Campaign campaign = new Campaign();
                campaign.setId(1L);
                campaign.setOwnerName("testProfile");
                List<String> members = new ArrayList<>();
                members.add("targetUser");
                campaign.setMembers(members);

                CampaignRequestPutInDTO dto = new CampaignRequestPutInDTO();
                dto.setProfileName("targetUser");

                CampaignRequest request = new CampaignRequest();
                request.setId(123L);
                request.setCampaign(campaign);
                request.setProfile(profile("targetUser"));
                request.setStatus(CampaignRequestStatus.PENDING);

                when(utilsCalls.checkAuthAndProfile(any(), eq("testProfile")))
                                .thenReturn(true);

                when(campaignRepository.findById(1L))
                                .thenReturn(Optional.of(campaign));

                when(profileRepository.findByProfilename("targetUser"))
                                .thenReturn(Optional.of(profile("targetUser")));

                when(campaignRequestRepository.findLastRequestByProfileAndCampaign(anyLong(), anyLong()))
                                .thenReturn(Optional.of(request));

                mockMvc.perform(put("/campaigns/1/kick")
                                .with(user("test@test.com"))
                                .with(csrf())
                                .header("X-Profile-Name", "testProfile")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(dto))
                                .principal(authentication()))
                                .andExpect(status().isOk());

                verify(campaignRepository).save(any(Campaign.class));
        }

        @Test
        @DisplayName("PUT /campaigns/{id}/block - should block member")
        void shouldBlockMember() throws Exception {

                Campaign campaign = new Campaign();
                campaign.setId(1L);
                campaign.setOwnerName("testProfile");
                List<String> members = new ArrayList<>();
                members.add("targetUser");
                campaign.setMembers(members);

                CampaignRequestPutInDTO dto = new CampaignRequestPutInDTO();
                dto.setProfileName("targetUser");

                CampaignRequest request = new CampaignRequest();
                request.setId(123L);
                request.setCampaign(campaign);
                request.setProfile(profile("targetUser"));
                request.setStatus(CampaignRequestStatus.PENDING);

                when(profileRepository.findByProfilename("targetUser"))
                                .thenReturn(Optional.of(profile("targetUser")));

                when(campaignRequestRepository.findLastRequestByProfileAndCampaign(anyLong(), anyLong()))
                                .thenReturn(Optional.of(request));

                when(utilsCalls.checkAuthAndProfile(any(), eq("testProfile")))
                                .thenReturn(true);

                when(campaignRepository.findById(1L))
                                .thenReturn(Optional.of(campaign));

                mockMvc.perform(put("/campaigns/1/block")
                                .with(user("test@test.com"))
                                .with(csrf())
                                .header("X-Profile-Name", "testProfile")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(dto))
                                .principal(authentication()))
                                .andExpect(status().isOk());

                verify(campaignRepository).save(any(Campaign.class));
        }

        @Test
        @DisplayName("GET /campaigns/{id}/participants - should return participants")
        void shouldGetParticipants() throws Exception {

                Campaign campaign = new Campaign();
                campaign.setId(1L);
                campaign.setMembers(List.of("testProfile", "user2"));
                campaign.setOwnerName("testProfile");
                when(utilsCalls.checkAuthAndProfile(any(), eq("testProfile")))
                                .thenReturn(true);

                when(campaignRepository.findById(1L))
                                .thenReturn(Optional.of(campaign));

                mockMvc.perform(get("/campaigns/1/participants")
                                .with(user("test@test.com"))
                                .header("X-Profile-Name", "testProfile")
                                .principal(authentication()))
                                .andExpect(status().isOk());

                verify(campaignRepository).findById(1L);
        }

        @Test
        @DisplayName("GET /campaigns/{id}/requests - should return requests")
        void shouldGetCampaignRequests() throws Exception {

                Campaign campaign = new Campaign();
                campaign.setId(1L);
                campaign.setOwnerName("testProfile");

                when(utilsCalls.checkAuthAndProfile(any(), eq("testProfile")))
                                .thenReturn(true);

                when(campaignRepository.findById(1L))
                                .thenReturn(Optional.of(campaign));

                mockMvc.perform(get("/campaigns/1/requests")
                                .with(user("test@test.com"))
                                .header("X-Profile-Name", "testProfile")
                                .principal(authentication()))
                                .andExpect(status().isOk());

                verify(campaignRepository).findById(1L);
        }

        @Test
        @DisplayName("PUT /campaigns/{id}/status - should change status")
        void shouldChangeCampaignStatus() throws Exception {

                Campaign campaign = new Campaign();
                campaign.setId(1L);
                campaign.setOwnerName("testProfile");

                CampaignPutInDTO dto = mock(CampaignPutInDTO.class);
                when(dto.getStatus()).thenReturn("FINISHED");

                when(utilsCalls.checkAuthAndProfile(any(), eq("testProfile")))
                                .thenReturn(true);

                when(campaignRepository.findById(1L))
                                .thenReturn(Optional.of(campaign));

                mockMvc.perform(put("/campaigns/1/status")
                                .with(user("test@test.com"))
                                .with(csrf())
                                .header("X-Profile-Name", "testProfile")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(dto))
                                .principal(authentication()))
                                .andExpect(status().isOk());

                verify(campaignRepository).save(any(Campaign.class));
        }

        private Profile profile(String name) {
                Profile p = new Profile();
                p.setId(99L);
                p.setProfilename(name);
                return p;
        }
}
