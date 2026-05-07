package com.rolesync.rolesync.dto.reviwercontroller;

import java.time.Instant;

public record ReviewDTO(
        Long id,
        Long authorId,
        String authorName,
        int rating,
        String comment,
        Instant createdAt
) {}
