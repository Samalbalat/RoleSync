package com.rolesync.rolesync.dto.campaigncontroller;

import com.rolesync.rolesync.dto.reviewercontroller.ReviewSummaryDTO;

import lombok.Data;

@Data
public class CampaignGetMeOutItemDTO {
    Long id;
    String name;
    String image;
    String system;
    String status;
    Integer pendingRequests;
    String ownerName;
    ReviewSummaryDTO reviewSummary;
}
