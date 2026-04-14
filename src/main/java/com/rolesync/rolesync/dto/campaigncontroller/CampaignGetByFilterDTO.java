package com.rolesync.rolesync.dto.campaigncontroller;

import java.util.List;

import lombok.Data;

@Data
public class CampaignGetByFilterDTO {

    private String id;
    private String name;
    private String communication;
    private List<String> themes;
    private String image;
    private String status;
    private int currentPlayers;
    private int maxPlayers;
    private String system;
}
