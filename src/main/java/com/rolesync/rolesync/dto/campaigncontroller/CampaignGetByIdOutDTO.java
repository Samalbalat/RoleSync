package com.rolesync.rolesync.dto.campaigncontroller;

import java.util.List;

import lombok.Data;

@Data
public class CampaignGetByIdOutDTO {

    private String id;
    private String name;
    private String type;

    private OwnerProfileDTO owner;

    // Campaign details
    private String status;
    private String communication;
    private String description;
    private List<String> themes;
    private String language;
    private String timeZone;
    private String image;
    private String system;
    private String frequency;
    private String location;
    private String dayWeek;
    private String duration;

    // Character info for the requesting user, if they have one in the campaign
    private String characterName;
    private Long characterId;
    private String characterImage;

    // Player count info
    private int currentPlayers;
    private int maxPlayers;

    private String userRelation;
    
}
