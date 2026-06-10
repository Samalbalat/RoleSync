package com.rolesync.rolesync.services;

import com.rolesync.rolesync.dto.reviewercontroller.CreateReviewDTO;
import com.rolesync.rolesync.dto.reviewercontroller.ReviewDTO;
import com.rolesync.rolesync.dto.reviewercontroller.ReviewSummaryDTO;
import com.rolesync.rolesync.model.*;
import com.rolesync.rolesync.repository.ReviewRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ReviewServiceTest {

    @Mock
    private ReviewRepository reviewRepository;

    @InjectMocks
    private ReviewService reviewService;

    private Profile author;

    @BeforeEach
    void setUp() {
        author = new Profile();
        author.setId(1L);
        author.setImage("img.png");
        author.setProfilename("tester");
        author.setProfileType(ProfileType.TABLETOP);
    }

    // ----------------------------
    // createReview - success path
    // ----------------------------
    @Test
    void createReviewShouldCreateAndMapReview() {
        CreateReviewDTO dto = mock(CreateReviewDTO.class);
        when(dto.targetType()).thenReturn(ReviewTargetType.CAMPAIGN);
        when(dto.targetId()).thenReturn(10L);
        when(dto.rating()).thenReturn(5);
        when(dto.comment()).thenReturn("Great!");

        when(reviewRepository
                .findByReviewerIdAndTargetTypeAndTargetId(1L, ReviewTargetType.CAMPAIGN, 10L))
                .thenReturn(Optional.empty());

        ArgumentCaptor<Review> captor = ArgumentCaptor.forClass(Review.class);

        when(reviewRepository.save(any(Review.class)))
                .thenAnswer(inv -> inv.getArgument(0));

        ReviewDTO result = reviewService.createReview(author, dto, 1.5);

        verify(reviewRepository).save(captor.capture());

        Review saved = captor.getValue();

        assertEquals(author, saved.getReviewer());
        assertEquals(ReviewTargetType.CAMPAIGN, saved.getTargetType());
        assertEquals(10L, saved.getTargetId());
        assertEquals(5, saved.getRating());
        assertEquals("Great!", saved.getComment());
        assertEquals(1.5, saved.getWeight());

        assertNotNull(result);
        assertEquals(author.getId(), result.authorId());
        assertEquals("tester", result.authorName());
        assertEquals("img.png", result.authorImage());
    }

    // ----------------------------
    // createReview - duplicate path
    // ----------------------------
    @Test
    void createReviewShouldThrowIfDuplicateExists() {
        CreateReviewDTO dto = mock(CreateReviewDTO.class);
        when(dto.targetType()).thenReturn(ReviewTargetType.CAMPAIGN);
        when(dto.targetId()).thenReturn(10L);

        Review existing = mock(Review.class);

        when(reviewRepository
                .findByReviewerIdAndTargetTypeAndTargetId(1L, ReviewTargetType.CAMPAIGN, 10L))
                .thenReturn(Optional.of(existing));

        IllegalStateException ex = assertThrows(
                IllegalStateException.class,
                () -> reviewService.createReview(author, dto, 1.0)
        );

        assertEquals("Ya has reseñado este elemento", ex.getMessage());

        verify(reviewRepository, never()).save(any());
    }

    // ----------------------------
    // getReviews
    // ----------------------------
    @Test
    void getReviewsShouldReturnMappedList() {
        Review review = buildReview(1L);

        when(reviewRepository.findByTargetTypeAndTargetId(ReviewTargetType.CAMPAIGN, 99L))
                .thenReturn(List.of(review));

        List<ReviewDTO> result =
                reviewService.getReviews(ReviewTargetType.CAMPAIGN, 99L);

        assertEquals(1, result.size());

        ReviewDTO dto = result.get(0);
        assertEquals(1L, dto.authorId());
        assertEquals("tester", dto.authorName());
        assertEquals("img.png", dto.authorImage());
        assertEquals(4, dto.rating());
        assertEquals("comment", dto.comment());
        assertNotNull(dto.createdAt());
    }

    // ----------------------------
    // getSummary
    // ----------------------------
    @Test
    void getSummaryShouldRoundAndReturnValues() {
        ReviewSummaryDTO repoResponse = new ReviewSummaryDTO(4.236, 7L);

        when(reviewRepository.getSummary(ReviewTargetType.CAMPAIGN, 50L))
                .thenReturn(repoResponse);

        ReviewSummaryDTO result =
                reviewService.getSummary(ReviewTargetType.CAMPAIGN, 50L);

        assertEquals(4.24, result.average()); // rounding check
        assertEquals(7L, result.count());
    }

    // ----------------------------
    // helper
    // ----------------------------
    private Review buildReview(Long reviewerId) {
        Profile reviewer = new Profile();
        reviewer.setId(reviewerId);
        reviewer.setImage("img.png");
        reviewer.setProfilename("tester");

        Review review = mock(Review.class);

        when(review.getId()).thenReturn(100L);
        when(review.getReviewer()).thenReturn(reviewer);
        when(review.getRating()).thenReturn(4);
        when(review.getComment()).thenReturn("comment");
        when(review.getCreatedAt()).thenReturn(Instant.now());

        return review;
    }
}