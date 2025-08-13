package com.rolesync.rolesync.dto;

import java.util.List;
import java.util.Set;

import org.hibernate.mapping.Table;

import com.rolesync.rolesync.entities.Campaign;
import com.rolesync.rolesync.entities.ImageData;
import com.rolesync.rolesync.entities.TabletopCampaign;
import com.rolesync.rolesync.enums.RPGSystem;
import com.rolesync.rolesync.enums.WeekDay;

import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;

public class CampaignDTO {

    private Long id;

    // This field represents the name of the campaign
    private String name;

    // This field represents the theme of the campaign
    private String theme;

    // This field represents the description of the campaign
    private String description;

    private String ownerName;

    private List<String> memberNames;

    private Integer maxNumberOfMembers;

    private Integer currentNumberOfMembers;

    private List<String> communications;

    private List<String> languages;

    private String timeZone;

    private ImageData image;

    private String RPGSystem;

    // This field represents the day of the week when the campaign sessions are held
    private String weekDay;

    // This field represents the frequency of the campaign sessions (e.g., weekly,
    // bi-weekly)
    private String frecuency;

    // This field represents the duration of each campaign session in hours
    private Double duration;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getTheme() {
        return theme;
    }

    public void setTheme(String theme) {
        this.theme = theme;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getOwnerName() {
        return ownerName;
    }

    public void setOwnerName(String ownerName) {
        this.ownerName = ownerName;
    }

    public List<String> getMemberNames() {
        return memberNames;
    }

    public void setMemberNames(List<String> memberNames) {
        this.memberNames = memberNames;
    }

    public List<String> getCommunications() {
        return communications;
    }

    public void setCommunications(List<String> communications) {
        this.communications = communications;
    }

    public List<String> getLanguages() {
        return languages;
    }

    public void setLanguages(List<String> languages) {
        this.languages = languages;
    }

    public String getTimeZone() {
        return timeZone;
    }

    public void setTimeZone(String timeZone) {
        this.timeZone = timeZone;
    }

    public ImageData getImage() {
        return image;
    }

    public void setImage(ImageData image) {
        this.image = image;
    }

    public String getRPGSystem() {
        return RPGSystem;
    }

    public void setRPGSystem(String rPGSystem) {
        RPGSystem = rPGSystem;
    }

    public String getWeekDay() {
        return weekDay;
    }

    public void setWeekDay(String weekDay) {
        this.weekDay = weekDay;
    }

    public String getFrecuency() {
        return frecuency;
    }

    public void setFrecuency(String frecuency) {
        this.frecuency = frecuency;
    }

    public Double getDuration() {
        return duration;
    }

    public void setDuration(Double duration) {
        this.duration = duration;
    }

    public Integer getMaxNumberOfMembers() {
        return maxNumberOfMembers;
    }

    public void setMaxNumberOfMembers(Integer maxNumberOfMembers) {
        this.maxNumberOfMembers = maxNumberOfMembers;
    }

    public Integer getCurrentNumberOfMembers() {
        return currentNumberOfMembers;
    }

    public void setCurrentNumberOfMembers(Integer currentNumberOfMembers) {
        this.currentNumberOfMembers = currentNumberOfMembers;
    }

    public CampaignDTO(Campaign campaign) {
        this.id = campaign.getId();
        this.name = campaign.getName();
        this.theme = campaign.getTheme();
        this.description = campaign.getDescription();
        this.ownerName = campaign.getOwner().getName();
        this.memberNames = campaign.getMembers().stream().map(member -> member.getName()).toList();
        this.maxNumberOfMembers = campaign.getMaxNumberOfMembers();
        this.currentNumberOfMembers = campaign.getMembers().size();
        this.communications = campaign.getCommunications().stream().map(communication -> communication.getCode())
                .toList();
        this.languages = campaign.getLanguages().stream().map(language -> language.getCode()).toList();
        this.timeZone = campaign.getTimeZone().toString();
        this.image = campaign.getImage();
        if (campaign instanceof TabletopCampaign) {
            TabletopCampaign tabletopCampaign = (TabletopCampaign) campaign;
            this.RPGSystem = tabletopCampaign.getRPGSystem().getCode();
            this.weekDay = tabletopCampaign.getWeekDay().toString();
            this.frecuency = tabletopCampaign.getFrecuency();
            this.duration = tabletopCampaign.getDuration();
        } else {
            this.RPGSystem = null;
            this.weekDay = null;
            this.frecuency = null;
            this.duration = null;
        }
    }
}
