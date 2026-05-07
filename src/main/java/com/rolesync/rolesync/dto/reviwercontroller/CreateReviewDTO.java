package com.rolesync.rolesync.dto.reviwercontroller;

import com.rolesync.rolesync.model.ReviewTargetType;
import jakarta.validation.constraints.*;

public record CreateReviewDTO(

        @NotNull
        ReviewTargetType targetType,

        @NotNull
        Long targetId,

        @Min(1)
        @Max(5)
        int rating,

        @Size(max = 2000)
        String comment
) {}