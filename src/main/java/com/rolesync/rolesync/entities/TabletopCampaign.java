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
    }

    public TabletopCampaign(String name, String theme, String description, Profile owner, Set<Profile> members,
            Set<Communication> communications, Set<Language> languages, TimeZone timeZone, String image, RPGSystem RPGSystem,
            WeekDay WeekDay, String frecuency, Double duration) {
        super(name, theme, description, owner, members, communications, languages, timeZone, image);
        this.RPGSystem = RPGSystem;
        this.weekDay = WeekDay;
        this.frecuency = frecuency;
        this.duration = duration;

    }

    // Atributos específicos de TabletopCampaign
    // RPGSystem de la mesa (DnD, Pathfinder, etc.)
    @Enumerated(EnumType.STRING)
    private RPGSystem RPGSystem;
    // Día de la semana en que se juega
    @Enumerated(EnumType.STRING)
    private WeekDay weekDay;
    // Frecuency de las sesiones (semanal, quincenal, mensual, etc.)
    private String frecuency;
    // Duración de cada sesión en horas
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