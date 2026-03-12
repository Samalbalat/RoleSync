package com.rolesync.rolesync.dto.campaigncontroller;

import lombok.Data;

@Data
public class CampaignRequestsByIdOutDTO {
    Long id;
    String profileName;
    String profileImage;
    String message;
}
