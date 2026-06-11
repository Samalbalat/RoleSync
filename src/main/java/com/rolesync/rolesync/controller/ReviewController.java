package com.rolesync.rolesync.controller;

import com.rolesync.rolesync.dto.reviewercontroller.CreateReviewDTO;
import com.rolesync.rolesync.dto.reviewercontroller.ReviewDTO;
import com.rolesync.rolesync.model.Profile;
import com.rolesync.rolesync.model.ReviewTargetType;
import com.rolesync.rolesync.model.User;
import com.rolesync.rolesync.repository.CampaignRepository;
import com.rolesync.rolesync.repository.ProfileRepository;
import com.rolesync.rolesync.repository.UserMetricsRepository;
import com.rolesync.rolesync.services.AiCommentAnalyzerService;
import com.rolesync.rolesync.services.ReviewService;
import com.rolesync.rolesync.utils.UtilsCalls;

import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/rolesync/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;
    private final AiCommentAnalyzerService aiCommentAnalyzer;
    private final ProfileRepository profileRepository;
    private final UserMetricsRepository userMetricsRepository;
    private final UtilsCalls utilsCalls;
    private final CampaignRepository campaignRepository;

    private static final String ERR_NOT_AUTHORIZED = "Not correctly authenticated or profile does not exist";

    @PostMapping
    public ResponseEntity<?> createReview(
            @RequestBody @Valid CreateReviewDTO dto,
            @RequestHeader("X-Profile-Name") String profileName,
            Authentication authentication) {
        Profile reviewer = profileRepository.findByProfilename(profileName)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN));
        if (!utilsCalls.checkAuthAndProfile(authentication, profileName)) {
            return ResponseEntity.status(403).body(ERR_NOT_AUTHORIZED);
        }
        try {
            validateReviewTarget(dto.targetType(), dto.targetId(), reviewer);
        } catch (ResponseStatusException e) {
            return ResponseEntity.status(e.getStatusCode()).body(e.getReason());
        }

        try {
            // Introducimos un factor de calidad de la reseña basado en IA para ajustar el
            // peso de su influencia en la credibilidad del usuario
            User user = utilsCalls.getUserFromUsername(authentication)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN));
            Double userCredibility = userMetricsRepository
                    .findByUser(user).get().getCredibilityScore();
            try {
                double aiScore = aiCommentAnalyzer.analyzeComment(dto.comment());
                Double finalScore = 0.2 + 1.8 * (userCredibility + aiScore);
                ReviewDTO result = reviewService.createReview(reviewer, dto, finalScore);
                return ResponseEntity.ok(result);
            } catch (IllegalStateException e) {
                Double finalScore = 0.2 + 1.8 * (userCredibility / 0.7);
                ReviewDTO result = reviewService.createReview(reviewer, dto, finalScore);
                return ResponseEntity.ok(result);
            }
        } catch (IllegalStateException e) {
            return ResponseEntity.status(400).body(e.getMessage());
        }
    }

    private void validateReviewTarget(ReviewTargetType targetType, Long targetId, Profile reviewer) {
        switch (targetType) {
            case CAMPAIGN -> {
                if (!campaignRepository.existsById(targetId)) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Campaign with given ID does not exist");
                }
                campaignRepository.findById(targetId).ifPresent(campaign -> {
                    if (!utilsCalls.getProfileRelationToCampaign(reviewer.getProfilename(), campaign).equals("OWNER")
                            && !utilsCalls.getProfileRelationToCampaign(reviewer.getProfilename(), campaign)
                                    .equals("MEMBER")) {
                        throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                                "You can only review campaigns you are related to");
                    }
                });
            }
            case PROFILE -> {
                if (!profileRepository.existsById(targetId)) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Profile with given ID does not exist");
                }
                if (profileRepository.findAllByUser(reviewer.getUser()).stream()
                        .anyMatch(p -> p.getId().equals(targetId))) {
                    throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You cannot review your own profiles");
                }
            }
            default -> throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid review target type");
        }

    }

    @GetMapping
    public ResponseEntity<?> getReviews(
            @RequestParam ReviewTargetType type,
            @RequestParam Long targetId,
            @RequestHeader("X-Profile-Name") String profileName,
            Authentication authentication) {
        if (!utilsCalls.checkAuthAndProfile(authentication, profileName)) {
            return ResponseEntity.status(403).body(ERR_NOT_AUTHORIZED);
        }
        return ResponseEntity.ok(
                reviewService.getReviews(type, targetId));
    }

    @GetMapping("/summary")
    public ResponseEntity<?> getSummary(
            @RequestParam ReviewTargetType type,
            @RequestParam Long targetId,
            @RequestHeader("X-Profile-Name") String profileName,
            Authentication authentication) {
        if (!utilsCalls.checkAuthAndProfile(authentication, profileName)) {
            return ResponseEntity.status(403).body(ERR_NOT_AUTHORIZED);
        }
        return ResponseEntity.ok(
                reviewService.getSummary(type, targetId));
    }
}
