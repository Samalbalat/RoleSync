package com.rolesync.rolesync.dto.reviewercontroller;

import java.time.Instant;

public record ReviewDTO(
        Long id,
        Long authorId,
        String authorImage,
        String authorName,
        int rating,
        String comment,
        Instant createdAt
) {}
