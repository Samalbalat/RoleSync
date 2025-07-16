package com.rolesync.rolesync.entities;

import java.util.Set;

import com.rolesync.rolesync.enums.Communication;
import com.rolesync.rolesync.enums.TimeZone;
import com.rolesync.rolesync.enums.Language;

import jakarta.persistence.DiscriminatorColumn;
import jakarta.persistence.DiscriminatorType;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Inheritance;
import jakarta.persistence.InheritanceType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;

// This class represents a Campaign in the RoleSync application.
// It serves as a base class for different types of campaigns, such as tabletop and written campaigns
@Entity(name="campaign")
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
@DiscriminatorColumn(name="campaignType", 
  discriminatorType = DiscriminatorType.STRING)
public class Campaign {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    //This field represents the name of the campaign
    private String name;

    //This field represents the theme of the campaign
    private String theme;

    //This field represents the description of the campaign
    private String description;

    //This field represents the owner of the campaign
    @ManyToOne
    @JoinColumn(name="profileId", nullable=false)
    private Profile owner;
    
    //This field represents the members of the campaign
    @ManyToMany
    @JoinTable(name = "campaignMembers", 
    joinColumns = @JoinColumn(name = "campaignId"), 
    inverseJoinColumns = @JoinColumn(name = "profileId"))
    private Set<Profile> members;
    
    //This field represents the communications available for the campaign
    private Set<Communication> communications;

    //this field represents the languages available for the campaign
    private Set<Language> languages;

    //this field represents the time zone of the campaign
    private TimeZone timeZone;

    //this field represents the image associated with the campaign
    private String image;

    public Campaign() {
    }

    public Campaign(String name, String theme, String description, Profile owner, Set<Profile> members,
            Set<Communication> communications, Set<Language> languages, TimeZone timeZone, String image) {
        this.name = name;
        this.theme = theme;
        this.description = description;
        this.owner = owner;
        this.members = members;
        this.communications = communications;
        this.languages = languages;
        this.timeZone = timeZone;
        this.image = image;
    }

    public Long getId() {
        return id;
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

    public Profile getOwner() {
        return owner;
    }

    public void setOwner(Profile owner) {
        this.owner = owner;
    }

    public Set<Profile> getMembers() {
        return members;
    }

    public void setMembers(Set<Profile> members) {
        this.members = members;
    }

    public Set<Communication> getCommunications() {
        return communications;
    }

    public void setCommunications(Set<Communication> communications) {
        this.communications = communications;
    }

    public Set<Language> getLanguages() {
        return languages;
    }

    public void setLanguages(Set<Language> languages) {
        this.languages = languages;
    }

    public TimeZone getTimeZone() {
        return timeZone;
    }

    public void setTimeZone(TimeZone timeZone) {
        this.timeZone = timeZone;
    }

    public String getImage() {
        return image;
    }

    public void setImage(String image) {
        this.image = image;
    }

}
