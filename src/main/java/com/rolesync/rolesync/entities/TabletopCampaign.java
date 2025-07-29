package com.rolesync.rolesync.entities;

import java.util.Set;

import com.rolesync.rolesync.enums.Communication;
import com.rolesync.rolesync.enums.WeekDay;
import com.rolesync.rolesync.enums.TimeZone;
import com.rolesync.rolesync.enums.Language;
import com.rolesync.rolesync.enums.RPGSystem;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;

// TabletopCampaign is a specific type of Campaign that represents campaigns that are usually played in person, typically around a table.
@Entity
@DiscriminatorValue("T")
public class TabletopCampaign extends Campaign {

    public TabletopCampaign() {
        // Default constructor for JPA
    }

    public TabletopCampaign(String name, String theme, String description, Profile owner, Set<Profile> members,
            Set<Communication> communications, Set<Language> languages, TimeZone timeZone, String image,
            RPGSystem RPGSystem,
            WeekDay WeekDay, String frecuency, Double duration) {
        super(name, theme, description, owner, members, communications, languages, timeZone, image);
        this.RPGSystem = RPGSystem;
        this.weekDay = WeekDay;
        this.frecuency = frecuency;
        this.duration = duration;

    }

    // This field represents the RPG system used in the tabletop campaign
    @Enumerated(EnumType.STRING)
    private RPGSystem RPGSystem;

    // This field represents the day of the week when the campaign sessions are held
    @Enumerated(EnumType.STRING)
    private WeekDay weekDay;

    // This field represents the frequency of the campaign sessions (e.g., weekly,
    // bi-weekly)
    private String frecuency;

    // This field represents the duration of each campaign session in hours
    private Double duration;

    public RPGSystem getRPGSystem() {
        return RPGSystem;
    }

    public void setRPGSystem(RPGSystem RPGSystem) {
        this.RPGSystem = RPGSystem;
    }

    public WeekDay getWeekDay() {
        return weekDay;
    }

    public void setWeekDay(WeekDay WeekDay) {
        this.weekDay = WeekDay;
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

}