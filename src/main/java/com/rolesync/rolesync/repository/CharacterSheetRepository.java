package com.rolesync.rolesync.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.querydsl.QuerydslPredicateExecutor;
import org.springframework.stereotype.Repository;

import com.rolesync.rolesync.model.Campaign;
import com.rolesync.rolesync.model.CharacterSheet;
import com.rolesync.rolesync.model.Profile;

@Repository
public interface CharacterSheetRepository
        extends JpaRepository<CharacterSheet, Long>, QuerydslPredicateExecutor<CharacterSheet> {

    List<CharacterSheet> findByCampaignAndIsTemplate(Campaign campaign, Boolean isTemplate);

    List<CharacterSheet> findByIsTemplateAndIsPublic(Boolean isTemplate, Boolean isPublic);

    List<CharacterSheet> findByOwnerAndIsTemplate(Profile owner, Boolean isTemplate);

    List<CharacterSheet> findByCampaignAndOwnerAndIsTemplate(Campaign campaign, Profile profileName,
            Boolean isTemplate);
}
