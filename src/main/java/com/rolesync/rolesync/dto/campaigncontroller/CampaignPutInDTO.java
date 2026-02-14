package com.rolesync.rolesync.dto.campaigncontroller;

import com.rolesync.rolesync.model.ProfileType;

import lombok.Data;

@Data
public class CampaignPutInDTO {
    private String name;
    private String image;
    private String description;
    private String system;
    private String[] themes;
    private ProfileType type;
    private Integer maxPlayers;
    private String communication;
    private String timeZone;
    private String language;
    private String dayWeek;
    private String frequency;
    private String duration;
    private String location;
    private String status;
}
