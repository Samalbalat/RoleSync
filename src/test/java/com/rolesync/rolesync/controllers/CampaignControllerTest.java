package com.rolesync.rolesync.controllers;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.querydsl.core.types.dsl.BooleanExpression;
import com.rolesync.rolesync.controller.CampaignController;
import com.rolesync.rolesync.dto.campaigncontroller.CampaignFilter;
import com.rolesync.rolesync.dto.campaigncontroller.CampaignPostInDTO;
import com.rolesync.rolesync.dto.campaigncontroller.CampaignPutInDTO;
import com.rolesync.rolesync.dto.campaigncontroller.predicates.CampaignPredicateBuilder;
import com.rolesync.rolesync.dto.reviewercontroller.ReviewSummaryDTO;
import com.rolesync.rolesync.model.Campaign;
import com.rolesync.rolesync.model.CampaignStatus;
import com.rolesync.rolesync.model.Profile;
import com.rolesync.rolesync.model.ProfileType;
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
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ActiveProfiles("test")
@WebMvcTest(CampaignController.class)
class CampaignControllerTest {

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
        private ReviewService reviewService;

        @MockitoBean
        private CharacterSheetRepository characterSheetRepository;

        @MockitoBean
        private UtilsCalls utilsCalls;

        @MockitoBean
        private CampaignPredicateBuilder campaignPredicateBuilder;

        private Authentication authentication() {
                return new UsernamePasswordAuthenticationToken(
                                "test@test.com",
                                "password");
        }

        private Profile owner(String name) {
                Profile p = new Profile();
                p.setId(100L);
                p.setProfilename(name);
                return p;
        }

        // ---------- GET FILTERED ----------
        @Test
        @DisplayName("GET /campaigns - should return campaigns")
        void shouldReturnCampaigns() throws Exception {

                // Arrange: entidad real (no mock)
                Campaign campaign = new Campaign();
                campaign.setId(1L);
                campaign.setName("Test Campaign");
                campaign.setDescription("Desc");
                campaign.setSystem("DND");
                campaign.setThemes(List.of("fantasy"));
                campaign.setStatus(CampaignStatus.OPEN);

                List<Campaign> campaigns = List.of(campaign);

                // IMPORTANTÍSIMO: filter vacío para evitar null en predicate builder
                CampaignFilter filter = new CampaignFilter(
                                ProfileType.TABLETOP,
                                "DND",
                                null,
                                null,
                                null,
                                null,
                                null,
                                null,
                                null,
                                null,
                                null);
                CampaignPredicateBuilder predicateBuilder = new CampaignPredicateBuilder();
                BooleanExpression predicate = predicateBuilder.build(filter);

                // Mock repository directamente con ANY predicate
                when(campaignRepository.findAll(predicate))
                                .thenReturn(campaigns);
                when(reviewService.getSummary(any(), anyLong()))
                                .thenReturn(new ReviewSummaryDTO(0.0, 0L));

                mockMvc.perform(get("/campaigns?=type=TABLETOP&system=DND")
                                .with(user("test@test.com")))
                                .andExpect(status().isOk());

                verify(campaignRepository).findAll(predicate);
        }

        // ---------- GET /me ----------
        @Test
        @DisplayName("GET /campaigns/me - should return user campaigns")
        void shouldReturnMyCampaigns() throws Exception {

                Campaign campaign = mock(Campaign.class);

                when(campaign.getStatus()).thenReturn(CampaignStatus.OPEN);
                when(campaign.getId()).thenReturn(1L);
                when(campaign.getName()).thenReturn("Campaign");
                when(campaign.getImage()).thenReturn("img");
                when(campaign.getSystem()).thenReturn("DND");
                when(campaign.getOwner()).thenReturn(owner("testProfile"));

                when(profileRepository.findByProfilename("testProfile")).thenReturn(Optional.of(owner("testProfile")));
                when(campaignRepository.findByOwner(owner("testProfile")))
                                .thenReturn(List.of(campaign));
                when(utilsCalls.checkAuthAndProfile(any(), eq("testProfile")))
                                .thenReturn(true);
                when(campaignRepository.findByMember("testProfile"))
                                .thenReturn(List.of(campaign));

                when(reviewService.getSummary(any(), anyLong()))
                                .thenReturn(new ReviewSummaryDTO(0.0, 0L));

                when(campaignRequestRepository.countPendingRequestsByCampaignId(anyLong()))
                                .thenReturn(0L);

                mockMvc.perform(get("/campaigns/me")
                                .header("X-Profile-Name", "testProfile")
                                .with(user("test@test.com"))
                                .principal(authentication()))
                                .andExpect(status().isOk());

                verify(campaignRepository).findByOwner(owner("testProfile"));
                verify(campaignRepository).findByMember("testProfile");
        }

        // ---------- POST CREATE ----------
        @Test
        @DisplayName("POST /campaigns - should create campaign")
        void shouldCreateCampaign() throws Exception {

                CampaignPostInDTO dto = new CampaignPostInDTO();
                dto.setName("Test");
                dto.setImage("img");
                dto.setDescription("desc");
                dto.setSystem("DND");
                dto.setThemes(new String[] { "fantasy" });
                dto.setMaxPlayers(5);
                dto.setCommunication("discord");
                dto.setLanguage("es");
                dto.setDayWeek("friday");
                dto.setFrequency("weekly");
                dto.setDuration("3h");
                dto.setLocation("online");
                dto.setTimeZone("UTC");
                dto.setType("TABLETOP");
                Profile profile = new Profile();
                profile.setProfilename("testProfile");

                when(profileRepository.findByProfilename("testProfile"))
                                .thenReturn(Optional.of(profile));

                mockMvc.perform(post("/campaigns")
                                .with(user("test@test.com"))
                                .with(csrf())
                                .header("X-Profile-Name", "testProfile")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(dto))
                                .principal(authentication()))
                                .andExpect(status().isOk())
                                .andExpect(content().string("Campaign created"));

                verify(campaignRepository).save(any(Campaign.class));
        }

        // ---------- PUT UPDATE ----------
        @Test
        @DisplayName("PUT /campaigns/{id} - should update campaign")
        void shouldUpdateCampaign() throws Exception {

                Campaign campaign = new Campaign();
                CampaignPutInDTO dto = mock(CampaignPutInDTO.class);
                when(dto.getThemes()).thenReturn(new String[] { "fantasy" });
                when(dto.getStatus()).thenReturn("OPEN");
                when(dto.getName()).thenReturn("name");
                when(dto.getImage()).thenReturn("img");
                when(dto.getDescription()).thenReturn("desc");
                when(dto.getSystem()).thenReturn("system");
                when(dto.getMaxPlayers()).thenReturn(5);
                when(dto.getCommunication()).thenReturn("discord");
                when(dto.getLanguage()).thenReturn("es");
                when(dto.getDayWeek()).thenReturn("friday");
                when(dto.getFrequency()).thenReturn("weekly");
                when(dto.getDuration()).thenReturn("3h");
                when(dto.getLocation()).thenReturn("online");
                when(dto.getTimeZone()).thenReturn("UTC");

                when(utilsCalls.checkAuthAndProfile(any(), eq("testProfile")))
                                .thenReturn(true);

                when(campaignRepository.findById(1L))
                                .thenReturn(Optional.of(campaign));

                mockMvc.perform(put("/campaigns/1")
                                .with(user("test@test.com"))
                                .with(csrf())
                                .header("X-Profile-Name", "testProfile")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(dto))
                                .principal(authentication()))
                                .andExpect(status().isOk())
                                .andExpect(content().string("Campaign updated"));

                verify(campaignRepository).save(any(Campaign.class));
        }

        // ---------- GET BY ID ----------
        @Test
        @DisplayName("GET /campaigns/{id} - should return campaign detail")
        void shouldReturnCampaignDetail() throws Exception {

                Campaign campaign = mock(Campaign.class);

                when(campaign.getStatus()).thenReturn(CampaignStatus.OPEN);
                when(campaign.getId()).thenReturn(1L);
                when(campaign.getMembers()).thenReturn(List.of("testProfile"));
                when(campaign.getOwner()).thenReturn(owner("owner"));
                when(campaign.getCampaignType()).thenReturn(ProfileType.TABLETOP);

                when(utilsCalls.checkAuthAndProfile(any(), eq("testProfile")))
                                .thenReturn(true);

                when(reviewService.getSummary(any(), anyLong()))
                                .thenReturn(new ReviewSummaryDTO(0.0, 0L));

                when(utilsCalls.getProfileRelationToCampaign(anyString(), any()))
                                .thenReturn("MEMBER");

                when(campaignRepository.findById(1L))
                                .thenReturn(Optional.of(campaign));

                mockMvc.perform(get("/campaigns/1")
                                .header("X-Profile-Name", "testProfile")
                                .with(user("test@test.com"))
                                .principal(authentication()))
                                .andExpect(status().isOk());

                verify(campaignRepository).findById(1L);
        }

        // ---------- DELETE ----------
        @Test
        @DisplayName("DELETE /campaigns/{id} - should delete campaign")
        void shouldDeleteCampaign() throws Exception {

                Campaign campaign = new Campaign();
                campaign.setOwner(owner("testProfile"));

                when(utilsCalls.checkAuthAndProfile(any(), eq("testProfile")))
                                .thenReturn(true);

                when(campaignRepository.findById(1L))
                                .thenReturn(Optional.of(campaign));

                mockMvc.perform(delete("/campaigns/1")
                                .with(user("test@test.com"))
                                .with(csrf())
                                .header("X-Profile-Name", "testProfile")
                                .principal(authentication()))
                                .andExpect(status().isOk())
                                .andExpect(content().string("Campaign deleted"));

                verify(campaignRepository).save(any(Campaign.class));
        }

        // ---------- APPLY TO CAMPAIGN ----------
        @Test
        @DisplayName("POST /campaigns/{id}/join - should apply to campaign")
        void shouldApplyToCampaign() throws Exception {

                Campaign campaign = new Campaign();
                campaign.setId(1L);
                campaign.setStatus(CampaignStatus.OPEN);
                campaign.setOwner(owner("otherUser"));
                campaign.setMembers(List.of());
                campaign.setMaxPlayers(1);

                when(campaignRequestRepository.findLastRequestByProfileAndCampaign(any(), any()))
                                .thenReturn(Optional.empty());
                when(utilsCalls.checkAuthAndProfile(any(), eq("testProfile")))
                                .thenReturn(true);

                when(campaignRepository.findById(1L))
                                .thenReturn(Optional.of(campaign));

                when(profileRepository.findByProfilename("testProfile"))
                                .thenReturn(Optional.of(new Profile()));

                mockMvc.perform(post("/campaigns/1/join")
                                .with(user("test@test.com"))
                                .with(csrf())
                                .header("X-Profile-Name", "testProfile")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content("{}")
                                .principal(authentication()))
                                .andExpect(status().isOk())
                                .andExpect(content().string("Campaign request submitted"));

                verify(campaignRequestRepository).save(any());
        }
}
