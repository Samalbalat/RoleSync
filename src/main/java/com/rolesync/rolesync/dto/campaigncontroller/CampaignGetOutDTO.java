package com.rolesync.rolesync.dto.campaigncontroller;

import lombok.Data;

@Data
public class CampaignGetOutDTO {
    Long id;
    String name;
    byte[] image;
    String system;
    String[] theme;
    String status;
    
}