package com.rolesync.rolesync.controllers;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.rolesync.rolesync.controller.ReviewController;
import com.rolesync.rolesync.dto.reviewercontroller.CreateReviewDTO;
import com.rolesync.rolesync.dto.reviewercontroller.ReviewDTO;
import com.rolesync.rolesync.dto.reviewercontroller.ReviewSummaryDTO;
import com.rolesync.rolesync.model.Profile;
import com.rolesync.rolesync.model.ReviewTargetType;
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

import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;

import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;

@WebMvcTest(ReviewController.class)
class ReviewControllerUnitTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private ReviewService reviewService;

    @MockitoBean
    private ProfileRepository profileRepository;

    @MockitoBean
    private UtilsCalls utilsCalls;

    private Authentication authentication() {
        return new UsernamePasswordAuthenticationToken(
                "test@test.com",
                "password"
        );
    }

    @Test
    @DisplayName("POST /rolesync/reviews - should create review successfully")
    void shouldCreateReviewSuccessfully() throws Exception {

        CreateReviewDTO dto = new CreateReviewDTO(
                ReviewTargetType.CAMPAIGN,
                1L,
                5,
                "Excellent DM"
        );

        Profile reviewer = new Profile();

        ReviewDTO response = mock(ReviewDTO.class);

        when(utilsCalls.checkAuthAndProfile(any(), eq("testProfile")))
                .thenReturn(true);

        when(profileRepository.findByProfilename("testProfile"))
                .thenReturn(Optional.of(reviewer));

        when(reviewService.createReview(eq(reviewer), eq(dto)))
                .thenReturn(response);

        mockMvc.perform(post("/rolesync/reviews")
                .with(user("test@test.com"))
                .with(csrf())
                .header("X-Profile-Name", "testProfile")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)))
        .andExpect(status().isOk());

        verify(reviewService).createReview(eq(reviewer), eq(dto));
    }

    @Test
    @DisplayName("POST /rolesync/reviews - should return 403 if auth fails")
    void shouldReturn403WhenAuthFails() throws Exception {

        CreateReviewDTO dto = new CreateReviewDTO(
                ReviewTargetType.CAMPAIGN,
                1L,
                5,
                "Excellent DM"
        );

        when(utilsCalls.checkAuthAndProfile(any(), eq("testProfile")))
                .thenReturn(false);

        mockMvc.perform(post("/rolesync/reviews")
                        .with(user("test@test.com"))
                        .with(csrf())
                        .header("X-Profile-Name", "testProfile")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto))
                        .principal(authentication()))
                .andExpect(status().isForbidden())
                .andExpect(content().string(
                        "Not correctly authenticated or profile does not exist"
                ));

        verify(reviewService, never()).createReview(any(), any());
    }

    @Test
    @DisplayName("POST /rolesync/reviews - should return 400 when service throws IllegalStateException")
    void shouldReturn400WhenServiceThrowsIllegalStateException() throws Exception {

        CreateReviewDTO dto = new CreateReviewDTO(
                ReviewTargetType.CAMPAIGN,
                1L,
                5,
                "Excellent DM"
        );
        Profile reviewer = new Profile();

        when(utilsCalls.checkAuthAndProfile(any(), eq("testProfile")))
                .thenReturn(true);

        when(profileRepository.findByProfilename("testProfile"))
                .thenReturn(Optional.of(reviewer));

        when(reviewService.createReview(eq(reviewer), any(CreateReviewDTO.class)))
                .thenThrow(new IllegalStateException("Review already exists"));

        mockMvc.perform(post("/rolesync/reviews")
                        .with(user("test@test.com"))
                        .with(csrf())
                        .header("X-Profile-Name", "testProfile")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto))
                        .principal(authentication()))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("Review already exists"));
                verify(reviewService, times(1)).createReview(any(), any());
    }

    @Test
    @DisplayName("GET /rolesync/reviews - should return reviews")
    void shouldReturnReviews() throws Exception {

        List<ReviewDTO> reviews = List.of(
                mock(ReviewDTO.class),
                mock(ReviewDTO.class)
        );

        when(utilsCalls.checkAuthAndProfile(any(), eq("testProfile")))
                .thenReturn(true);

        when(reviewService.getReviews(
                ReviewTargetType.CAMPAIGN,
                1L
        )).thenReturn(reviews);

        mockMvc.perform(get("/rolesync/reviews")
                        .with(user("test@test.com"))
                        .header("X-Profile-Name", "testProfile")
                        .param("type", "CAMPAIGN")
                        .param("targetId", "1")
                        .principal(authentication()))
                .andExpect(status().isOk());

        verify(reviewService).getReviews(
                ReviewTargetType.CAMPAIGN,
                1L
        );
    }

    @Test
    @DisplayName("GET /rolesync/reviews - should return 403 if auth fails")
    void shouldReturn403OnGetReviewsWhenAuthFails() throws Exception {

        when(utilsCalls.checkAuthAndProfile(any(), eq("testProfile")))
                .thenReturn(false);

        mockMvc.perform(get("/rolesync/reviews")
                        .header("X-Profile-Name", "testProfile")
                        .with(user("test@test.com"))
                        .param("type", "CAMPAIGN")
                        .param("targetId", "1")
                        .principal(authentication()))
                .andExpect(status().isForbidden());

        verify(reviewService, never()).getReviews(any(), anyLong());
    }

    @Test
    @DisplayName("GET /rolesync/reviews/summary - should return summary")
    void shouldReturnSummary() throws Exception {

        ReviewSummaryDTO summary = mock(ReviewSummaryDTO.class);

        when(utilsCalls.checkAuthAndProfile(any(), eq("testProfile")))
                .thenReturn(true);

        when(reviewService.getSummary(
                ReviewTargetType.CAMPAIGN,
                1L
        )).thenReturn(summary);

        mockMvc.perform(get("/rolesync/reviews/summary")
                        .header("X-Profile-Name", "testProfile")
                        .with(user("test@test.com"))
                        .param("type", "CAMPAIGN")
                        .param("targetId", "1")
                        .principal(authentication()))
                .andExpect(status().isOk());

        verify(reviewService).getSummary(
                ReviewTargetType.CAMPAIGN,
                1L
        );
    }

    @Test
    @DisplayName("GET /rolesync/reviews/summary - should return 403 if auth fails")
    void shouldReturn403OnSummaryWhenAuthFails() throws Exception {

        when(utilsCalls.checkAuthAndProfile(any(), eq("testProfile")))
                .thenReturn(false);

        mockMvc.perform(get("/rolesync/reviews/summary")
                        .header("X-Profile-Name", "testProfile")
                        .with(user("test@test.com"))
                        .param("type", "CAMPAIGN")
                        .param("targetId", "1")
                        .principal(authentication()))
                .andExpect(status().isForbidden());

        verify(reviewService, never()).getSummary(any(), anyLong());
    }
}
