package com.rolesync.rolesync.repositories;

import java.util.Set;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;

import com.rolesync.rolesync.entities.Profile;

public interface ProfileRepository extends CrudRepository<Profile, Long>{

    // This method retrieves all profiles that are members of a specific campaign
    @Query("SELECT p FROM Profile p JOIN p.memberOf c WHERE c.id = :campaignId")
    Set<Profile> findAllMembersByCampaignId(@Param("campaignId") Long campaignId);
}
