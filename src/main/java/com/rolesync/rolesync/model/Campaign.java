package com.rolesync.rolesync.model;

import java.util.List;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
public class Campaign {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // We store the owner name for easy access, but we don't want to rely on it for logic, we will always check the members list for permissions
    private String ownerName;

    // We store the members as an array of profile names for easy access, 
    // but we will always check the profiles service to get the actual profiles and their types when needed
    @Column(name = "members", columnDefinition = "text[]")
    private List<String> members;

    // We store the characters as an array of character ids for easy access
    @Column(name = "characters", columnDefinition = "integer[]")
    private List<Integer> characters;

    private String name;
    private String image;
    private String description;
    private String system;
    
    @Column(name = "themes", columnDefinition = "text[]")
    private String[] themes;

    @Enumerated(EnumType.STRING)
    private ProfileType campaignType;
    
    @Enumerated(EnumType.STRING)
    private CampaignStatus status;

    private Integer maxPlayers;
    private String communication;
    private String language;
    private String dayWeek;
    private String timeZone;
    private String frequency;
    private String duration;
    private String location;

    public Campaign(String ownerName, List<String> members, String name, String image, String description, String system, String[] themes, String campaignType, String status, Integer maxPlayers, String communication, String language, String dayWeek, String timeZone, String frequency, String duration, String location) {
        this.ownerName = ownerName;
        this.members = members;
        this.name = name;
        this.image = image;
        this.description = description;
        this.system = system;
        this.themes = themes;
        this.campaignType = ProfileType.valueOf(campaignType);
        this.status = CampaignStatus.valueOf(status);
        this.maxPlayers = maxPlayers;
        this.communication = communication;
        this.language = language;
        this.timeZone = timeZone;
        this.dayWeek = dayWeek;
        this.frequency = frequency;
        this.duration = duration;
        this.location = location;
    }
}
