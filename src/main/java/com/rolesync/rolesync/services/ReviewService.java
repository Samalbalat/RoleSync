package com.rolesync.rolesync.services;

import com.rolesync.rolesync.dto.reviwercontroller.CreateReviewDTO;
import com.rolesync.rolesync.dto.reviwercontroller.ReviewDTO;
import com.rolesync.rolesync.dto.reviwercontroller.ReviewSummaryDTO;
import com.rolesync.rolesync.model.*;
import com.rolesync.rolesync.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;

    @Transactional
    public ReviewDTO createReview(Profile author, CreateReviewDTO dto) {

        // Evitar duplicados
        reviewRepository.findByReviewerIdAndTargetTypeAndTargetId(
                author.getId(),
                dto.targetType(),
                dto.targetId()
        ).ifPresent(r -> {
            throw new IllegalStateException("Ya has reseñado este elemento");
        });

        Review review = Review.builder()
                .reviewer(author)
                .targetType(dto.targetType())
                .targetId(dto.targetId())
                .rating(dto.rating())
                .comment(dto.comment())
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();

        reviewRepository.save(review);

        return map(review);
    }

    public List<ReviewDTO> getReviews(ReviewTargetType type, Long targetId) {
        return reviewRepository
                .findByTargetTypeAndTargetId(type, targetId)
                .stream()
                .map(this::map)
                .toList();
    }

    public ReviewSummaryDTO getSummary(ReviewTargetType type,Long targetId) {
        ReviewSummaryDTO summary =
                reviewRepository.getSummary(type, targetId);

        return new ReviewSummaryDTO(
                Math.round(summary.average() * 100.0) / 100.0,
                summary.count()
        );
    }

    private ReviewDTO map(Review r) {
        return new ReviewDTO(
                r.getId(),
                r.getReviewer().getId(),
                r.getReviewer().getProfilename(),
                r.getRating(),
                r.getComment(),
                r.getCreatedAt()
        );
    }
}
