package com.rolesync.rolesync.controller;

import com.rolesync.rolesync.dto.reviwercontroller.CreateReviewDTO;
import com.rolesync.rolesync.model.Profile;
import com.rolesync.rolesync.model.ReviewTargetType;
import com.rolesync.rolesync.repository.ProfileRepository;
import com.rolesync.rolesync.services.ReviewService;
import com.rolesync.rolesync.utils.UtilsCalls;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/rolesync/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;
    private final ProfileRepository profileRepository;
    private final UtilsCalls utilsCalls;

    private static final String ERR_NOT_AUTHORIZED = "Not correctly authenticated or profile does not exist";
    @PostMapping
    public ResponseEntity<?> createReview(
            @RequestBody @Valid CreateReviewDTO dto,
            @RequestHeader("X-Profile-Name") String profileName,
            Authentication authentication
    ) {
        Profile reviewer = profileRepository.findByProfilename(profileName)
                .orElse(null);
        if (!utilsCalls.checkAuthAndProfile(authentication, profileName)) {
            return ResponseEntity.status(403).body(ERR_NOT_AUTHORIZED);
        }
        try {
            return ResponseEntity.ok(reviewService.createReview(reviewer, dto));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(400).body(e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<?> getReviews(
            @RequestParam ReviewTargetType type,
            @RequestParam Long targetId,
            @RequestHeader("X-Profile-Name") String profileName,
            Authentication authentication
    ) {
        if (!utilsCalls.checkAuthAndProfile(authentication, profileName)) {
            return ResponseEntity.status(403).body(ERR_NOT_AUTHORIZED);
        }
        return ResponseEntity.ok(
                reviewService.getReviews(type, targetId)
        );
    }

    @GetMapping("/summary")
    public ResponseEntity<?> getSummary(
            @RequestParam ReviewTargetType type,
            @RequestParam Long targetId,
            @RequestHeader("X-Profile-Name") String profileName,
            Authentication authentication
    ) {
        if (!utilsCalls.checkAuthAndProfile(authentication, profileName)) {
            return ResponseEntity.status(403).body(ERR_NOT_AUTHORIZED);
        }
        return ResponseEntity.ok(
                reviewService.getSummary(type, targetId)
        );
    }
}
