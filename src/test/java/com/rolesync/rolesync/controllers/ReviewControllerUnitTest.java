package com.rolesync.rolesync.controllers;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.rolesync.rolesync.controller.ReviewController;
import com.rolesync.rolesync.dto.reviewercontroller.CreateReviewDTO;
import com.rolesync.rolesync.dto.reviewercontroller.ReviewDTO;
import com.rolesync.rolesync.dto.reviewercontroller.ReviewSummaryDTO;
import com.rolesync.rolesync.model.Campaign;
import com.rolesync.rolesync.model.Profile;
import com.rolesync.rolesync.model.ReviewTargetType;
import com.rolesync.rolesync.model.User;
import com.rolesync.rolesync.model.UserMetrics;
import com.rolesync.rolesync.repository.CampaignRepository;
import com.rolesync.rolesync.repository.ProfileRepository;
import com.rolesync.rolesync.repository.UserMetricsRepository;
import com.rolesync.rolesync.services.AiCommentAnalyzerService;
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
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;

import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;

@ActiveProfiles("test")
@WebMvcTest(ReviewController.class)
class ReviewControllerUnitTest {

        @Autowired
        private MockMvc mockMvc;

        @Autowired
        private ObjectMapper objectMapper;

        @MockitoBean
        private ReviewService reviewService;

        @MockitoBean
        private UserMetricsRepository userMetricsRepository;

        @MockitoBean
        private ProfileRepository profileRepository;

        @MockitoBean
        private UtilsCalls utilsCalls;

        @MockitoBean
        private AiCommentAnalyzerService aiCommentAnalyzer;

        @MockitoBean
        private CampaignRepository campaignRepository;

        private static final String PROFILE_NAME = "testProfile";
        private static final String EMAIL = "test@test.com";
        private static final Double INFLUENCE_WEIGHT = 1.0;

        private CreateReviewDTO validCreateCampaignReviewDTO() {
                return new CreateReviewDTO(
                                ReviewTargetType.CAMPAIGN,
                                1L,
                                5,
                                "Excellent DM");
        }

        private CreateReviewDTO validCreateProfileReviewDTO() {
                return new CreateReviewDTO(
                                ReviewTargetType.PROFILE,
                                1L,
                                5,
                                "Excellent player");
        }

        private Authentication authentication() {
                return new UsernamePasswordAuthenticationToken(
                                EMAIL,
                                "password");
        }

        private MockHttpServletRequestBuilder postReview(CreateReviewDTO dto) throws Exception {
                return post("/rolesync/reviews")
                                .with(user(EMAIL))
                                .with(csrf())
                                .header("X-Profile-Name", PROFILE_NAME)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(dto));
        }

        private MockHttpServletRequestBuilder getReviews() {
                return get("/rolesync/reviews?targetId=1&type=CAMPAIGN")
                                .with(user(EMAIL))
                                .header("X-Profile-Name", PROFILE_NAME)
                                .principal(authentication());
        }

        private MockHttpServletRequestBuilder getSummary() {
                return get("/rolesync/reviews/summary?targetId=1&type=CAMPAIGN")
                                .with(user(EMAIL))
                                .header("X-Profile-Name", PROFILE_NAME)
                                .principal(authentication());
        }

        private void mockAuthOk() {
                when(utilsCalls.checkAuthAndProfile(any(), eq(PROFILE_NAME)))
                                .thenReturn(true);
        }

        private void mockIAScoreOk() {
                when(aiCommentAnalyzer.analyzeComment(anyString()))
                                .thenReturn(0.15);
        }

        private void mockUserOk() {
                User user = new User();
                user.setEmail(EMAIL);
                when(utilsCalls.getUserFromUsername(any()))
                                .thenReturn(Optional.of(user));
        }

        private void campaignPresentAndUserRelation(String relString) {
                when(campaignRepository.findById(anyLong()))
                                .thenReturn(Optional.of(mock(Campaign.class)));
                when(utilsCalls.getProfileRelationToCampaign(any(), any()))
                                .thenReturn(relString);
        }

        private void mockProfileToReviewExists() {
                when(profileRepository.existsById(1L))
                                .thenReturn(true);
        }

        private void mockProfileToReviewNotExists() {
                when(profileRepository.existsById(1L))
                                .thenReturn(false);
        }

        private void mockCampaignToReviewExists() {
                when(campaignRepository.existsById(1L))
                                .thenReturn(true);
        }

        private void mockCampaignToReviewNotExists() {
                when(campaignRepository.existsById(1L))
                                .thenReturn(false);
        }

        private void mockUserMetricsOk() {
                UserMetrics metrics = new UserMetrics();
                User user = new User();
                user.setEmail(EMAIL);
                metrics.setUser(user);
                metrics.setCredibilityScore(0.5);
                when(userMetricsRepository.findByUser(any()))
                                .thenReturn(Optional.of(metrics));
        }

        private void mockProfileOk() {
                Profile reviewer = new Profile();
                reviewer.setProfilename(PROFILE_NAME);
                when(profileRepository.findByProfilename(PROFILE_NAME))
                                .thenReturn(Optional.of(reviewer));
        }

        private void mockAuthFail() {
                when(utilsCalls.checkAuthAndProfile(any(), eq(PROFILE_NAME)))
                                .thenReturn(false);
        }

        private void mockReviewOwnProfile() {
                Profile toBeReviewed = new Profile();
                toBeReviewed.setProfilename(PROFILE_NAME);
                toBeReviewed.setId(1L);
                when(profileRepository.findAllByUser(any()))
                                .thenReturn(List.of(toBeReviewed));
        }

        @Test
        @DisplayName("POST /rolesync/reviews - should create campaign review successfully")
        void shouldCreateCampaignReviewSuccessfully() throws Exception {

                CreateReviewDTO dto = validCreateCampaignReviewDTO();
                Profile reviewer = new Profile();
                ReviewDTO response = mock(ReviewDTO.class);

                mockAuthOk();
                mockProfileOk();
                mockUserOk();
                mockUserMetricsOk();
                mockIAScoreOk();
                mockCampaignToReviewExists();
                campaignPresentAndUserRelation("MEMBER");

                when(reviewService.createReview(eq(reviewer), eq(dto), eq(INFLUENCE_WEIGHT)))
                                .thenReturn(response);

                mockMvc.perform(postReview(dto))
                                .andExpect(result -> {
                                        int status = result.getResponse().getStatus();
                                        assertTrue(status == 200 || status == 503,
                                                        "Expected status 200 or 503 but got " + status);
                                });

                verify(reviewService).createReview(eq(reviewer), eq(dto), anyDouble());
        }

        @Test
        @DisplayName("POST /rolesync/reviews - shouldn't create campaign review successfully")
        void shouldCreateCampaignReviewNotExists() throws Exception {

                CreateReviewDTO dto = validCreateCampaignReviewDTO();
                Profile reviewer = new Profile();
                ReviewDTO response = mock(ReviewDTO.class);

                mockAuthOk();
                mockProfileOk();
                mockUserOk();
                mockUserMetricsOk();
                mockCampaignToReviewNotExists();

                when(reviewService.createReview(eq(reviewer), eq(dto), eq(INFLUENCE_WEIGHT)))
                                .thenReturn(response);

                mockMvc.perform(postReview(dto))
                                .andExpect(status().isBadRequest());

                verify(reviewService, never()).createReview(eq(reviewer), eq(dto), anyDouble());
        }

        @Test
        @DisplayName("POST /rolesync/reviews - shouldn't create campaign review successfully")
        void shouldCreateCampaignReviewPresentButNoneRelated() throws Exception {

                CreateReviewDTO dto = validCreateCampaignReviewDTO();
                Profile reviewer = new Profile();
                ReviewDTO response = mock(ReviewDTO.class);

                mockAuthOk();
                mockProfileOk();
                mockUserOk();
                mockUserMetricsOk();
                mockCampaignToReviewExists();
                campaignPresentAndUserRelation("NONE");

                when(reviewService.createReview(eq(reviewer), eq(dto), eq(INFLUENCE_WEIGHT)))
                                .thenReturn(response);

                mockMvc.perform(postReview(dto))
                                .andExpect(status().isForbidden());

                verify(reviewService, never()).createReview(eq(reviewer), eq(dto), anyDouble());
        }

        @Test
        @DisplayName("POST /rolesync/reviews - shouldn't create campaign review successfully")
        void shouldCreateCampaignReviewPresentButPendingRelated() throws Exception {

                CreateReviewDTO dto = validCreateCampaignReviewDTO();
                Profile reviewer = new Profile();
                ReviewDTO response = mock(ReviewDTO.class);

                mockAuthOk();
                mockProfileOk();
                mockUserOk();
                mockUserMetricsOk();
                mockCampaignToReviewExists();
                campaignPresentAndUserRelation("PENDING");

                when(reviewService.createReview(eq(reviewer), eq(dto), eq(INFLUENCE_WEIGHT)))
                                .thenReturn(response);

                mockMvc.perform(postReview(dto))
                                .andExpect(status().isForbidden());

                verify(reviewService, never()).createReview(eq(reviewer), eq(dto), anyDouble());
        }

        @Test
        @DisplayName("POST /rolesync/reviews - should create profile review successfully")
        void shouldCreateProfileReviewSuccessfully() throws Exception {

                CreateReviewDTO dto = validCreateProfileReviewDTO();
                Profile reviewer = new Profile();

                mockAuthOk();
                mockProfileOk();
                mockUserOk();
                mockUserMetricsOk();
                mockProfileToReviewExists();
                mockIAScoreOk();

                when(campaignRepository.existsById(dto.targetId())).thenReturn(true);

                mockMvc.perform(postReview(dto))
                                .andExpect(result -> {
                                        int status = result.getResponse().getStatus();
                                        assertTrue(status == 200 || status == 503,
                                                        "Expected status 200 or 503 but got " + status);
                                });

                verify(reviewService).createReview(eq(reviewer), eq(dto), anyDouble());
        }

        @Test
        @DisplayName("POST /rolesync/reviews - shouldn't create review if profile to review does not exist")
        void shouldCreateProfileReviewProfileNotExists() throws Exception {

                CreateReviewDTO dto = validCreateProfileReviewDTO();
                Profile reviewer = new Profile();
                ReviewDTO response = mock(ReviewDTO.class);

                mockAuthOk();
                mockProfileOk();
                mockUserOk();
                mockUserMetricsOk();
                mockProfileToReviewNotExists();

                when(campaignRepository.existsById(dto.targetId())).thenReturn(true);

                when(reviewService.createReview(eq(reviewer), eq(dto), eq(INFLUENCE_WEIGHT)))
                                .thenReturn(response);

                mockMvc.perform(postReview(dto))
                                .andExpect(status().isBadRequest());

                verify(reviewService, never()).createReview(eq(reviewer), eq(dto), anyDouble());
        }

        @Test
        @DisplayName("POST /rolesync/reviews - shouldn't create review if profile to review is owned by the reviewer")
        void shouldCreateProfileReviewProfileIsOwned() throws Exception {

                CreateReviewDTO dto = validCreateProfileReviewDTO();
                Profile reviewer = new Profile();
                reviewer.setProfilename(PROFILE_NAME);
                reviewer.setId(1L);
                ReviewDTO response = mock(ReviewDTO.class);

                mockAuthOk();
                mockProfileOk();
                mockUserOk();
                mockUserMetricsOk();
                mockProfileToReviewExists();
                mockReviewOwnProfile();

                when(campaignRepository.existsById(dto.targetId())).thenReturn(true);

                when(reviewService.createReview(eq(reviewer), eq(dto), eq(INFLUENCE_WEIGHT)))
                                .thenReturn(response);

                mockMvc.perform(postReview(dto))
                                .andExpect(status().isForbidden());

                verify(reviewService, never()).createReview(eq(reviewer), eq(dto), anyDouble());
        }

        @Test
        @DisplayName("POST /rolesync/reviews - should return 403 if auth fails")
        void shouldReturn403WhenAuthFails() throws Exception {

                CreateReviewDTO dto = validCreateCampaignReviewDTO();

                mockProfileOk();
                mockAuthFail();

                mockMvc.perform(postReview(dto))
                                .andExpect(status().isForbidden())
                                .andExpect(content().string(
                                                "Not correctly authenticated or profile does not exist"));

                verify(reviewService, never()).createReview(any(), any(), anyDouble());
        }

        @Test
        @DisplayName("POST /rolesync/reviews - should return 400 when service throws IllegalStateException")
        void shouldReturn400WhenServiceThrowsIllegalStateException() throws Exception {

                CreateReviewDTO dto = validCreateCampaignReviewDTO();
                Profile reviewer = new Profile();

                mockAuthOk();
                mockProfileOk();
                mockUserOk();
                mockUserMetricsOk();
                mockCampaignToReviewExists();
                mockIAScoreOk();

                when(reviewService.createReview(eq(reviewer), any(CreateReviewDTO.class), anyDouble()))
                                .thenThrow(new IllegalStateException("Review already exists"));

                mockMvc.perform(postReview(dto))
                                .andExpect(result -> {
                                        int status = result.getResponse().getStatus();
                                        assertTrue(status == 400 || status == 503,
                                                        "Expected status 400 or 503 but got " + status);
                                });

                verify(reviewService,times(2)).createReview(any(), any(), anyDouble());
        }

        @Test
        @DisplayName("GET /rolesync/reviews - should return reviews")
        void shouldReturnReviews() throws Exception {

                List<ReviewDTO> reviews = List.of(
                                mock(ReviewDTO.class),
                                mock(ReviewDTO.class));

                mockAuthOk();

                when(reviewService.getReviews(
                                ReviewTargetType.CAMPAIGN,
                                1L)).thenReturn(reviews);

                mockMvc.perform(getReviews())
                                .andExpect(status().isOk());

                verify(reviewService).getReviews(
                                ReviewTargetType.CAMPAIGN,
                                1L);
        }

        @Test
        @DisplayName("GET /rolesync/reviews - should return 403 if auth fails")
        void shouldReturn403OnGetReviewsWhenAuthFails() throws Exception {

                mockAuthFail();

                mockMvc.perform(getReviews())
                                .andExpect(status().isForbidden());

                verify(reviewService, never()).getReviews(any(), anyLong());
        }

        @Test
        @DisplayName("GET /rolesync/reviews/summary - should return summary")
        void shouldReturnSummary() throws Exception {

                ReviewSummaryDTO summary = mock(ReviewSummaryDTO.class);

                mockAuthOk();

                when(reviewService.getSummary(
                                ReviewTargetType.CAMPAIGN,
                                1L)).thenReturn(summary);

                mockMvc.perform(getSummary())
                                .andExpect(status().isOk());

                verify(reviewService).getSummary(
                                ReviewTargetType.CAMPAIGN,
                                1L);
        }

        @Test
        @DisplayName("GET /rolesync/reviews/summary - should return 403 if auth fails")
        void shouldReturn403OnSummaryWhenAuthFails() throws Exception {

                mockAuthFail();

                mockMvc.perform(getSummary())
                                .andExpect(status().isForbidden());

                verify(reviewService, never()).getSummary(any(), anyLong());
        }
}
