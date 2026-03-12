package com.rolesync.rolesync.dto.campaigncontroller;

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
}
