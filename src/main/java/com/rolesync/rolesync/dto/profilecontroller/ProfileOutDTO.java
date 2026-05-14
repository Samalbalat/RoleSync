package com.rolesync.rolesync.dto.profilecontroller;

import com.rolesync.rolesync.dto.reviewercontroller.ReviewSummaryDTO;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ProfileOutDTO {
    Long id;
    String profileName;
    String image;
    String description;
    ReviewSummaryDTO reviewSummary;
    
}
