package com.rolesync.rolesync.dto.campaigncontroller;

import lombok.Data;

@Data
public class CampaignPostInDTO {
    private String name;
    private String image;
    private String description;
    private String system;
    private String[] themes;
    private String type;
    private Integer maxPlayers;
    private String communication;
    private String timeZone;
    private String language;
    private String dayWeek;
    private String frequency;
    private String duration;
    private String location;
}
