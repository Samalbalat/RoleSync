package com.rolesync.rolesync.model;

import java.util.List;
import java.util.Set;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Campaign {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // We store the owner name for easy access, but we don't want to rely on it for logic, we will always check the members list for permissions
    private String ownerName;

    // We store the members as an array of profile names for easy access, 
    // but we will always check the profiles service to get the actual profiles and their types when needed
    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(name = "members", columnDefinition = "text[]")
    private List<String> members;

    // We store the characters as an array of character ids for easy access
    @OneToMany(mappedBy="campaign")
    private Set<CharacterSheet> sheets;

    
    @OneToMany(mappedBy="campaign")
    private Set<CampaignRequest> requests;

    private String name;
    private String image;
    private String description;
    private String system;
    
    @Column(name = "themes", columnDefinition = "text[]")
    @JdbcTypeCode(SqlTypes.ARRAY)
    private List<String> themes;

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
}
