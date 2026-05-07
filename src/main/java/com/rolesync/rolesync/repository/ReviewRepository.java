package com.rolesync.rolesync.repository;

import com.rolesync.rolesync.dto.reviwercontroller.ReviewSummaryDTO;
import com.rolesync.rolesync.model.Review;
import com.rolesync.rolesync.model.ReviewTargetType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ReviewRepository extends JpaRepository<Review, Long> {

    List<Review> findByTargetTypeAndTargetId(ReviewTargetType type, Long targetId);

    Optional<Review> findByReviewerIdAndTargetTypeAndTargetId(
            Long reviewerId,
            ReviewTargetType type,
            Long targetId
    );

    Double getAverageRatingByTargetTypeAndTargetId(
            ReviewTargetType type,
            Long targetId
    );

    Long countByTargetTypeAndTargetId(
            ReviewTargetType type,
            Long targetId
    );

    @Query("""
        SELECT new com.rolesync.rolesync.dto.reviwercontroller.ReviewSummaryDTO(
                COALESCE(AVG(r.rating), 0),
                COUNT(r)
        )
        FROM Review r
        WHERE r.targetType = :type
        AND r.targetId = :targetId
        """)
        ReviewSummaryDTO getSummary(
                @Param("type") ReviewTargetType type,
                @Param("targetId") Long targetId
        );
}
