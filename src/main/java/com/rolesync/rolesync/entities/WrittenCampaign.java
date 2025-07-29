package com.rolesync.rolesync.entities;

import java.util.Set;

import com.rolesync.rolesync.enums.Communication;
import com.rolesync.rolesync.enums.TimeZone;
import com.rolesync.rolesync.enums.Language;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;

// WrittenCampaign is a specific type of Campaign that represents campaigns that are primarily written or text-based.
@Entity
@DiscriminatorValue("W")
public class WrittenCampaign extends Campaign {

    public WrittenCampaign() {
        // Default constructor for JPA
    }

    public WrittenCampaign(String name, String theme, String description, Profile owner, Set<Profile> members,
            Set<Communication> communications, Set<Language> languages, TimeZone timeZone, String image) {

        super(name, theme, description, owner, members, communications, languages, timeZone, image);
    }

}