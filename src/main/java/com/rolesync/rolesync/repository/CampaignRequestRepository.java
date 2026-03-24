package com.rolesync.rolesync.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.querydsl.QuerydslPredicateExecutor;

import com.rolesync.rolesync.model.Campaign;
import com.rolesync.rolesync.model.CampaignRequest;
import com.rolesync.rolesync.model.CampaignRequestStatus;
import com.rolesync.rolesync.model.Profile;

public interface CampaignRequestRepository extends JpaRepository<CampaignRequest, Long>, QuerydslPredicateExecutor<CampaignRequest>{
  
    List<CampaignRequest> findAllByCampaignAndStatus(Campaign campaign, CampaignRequestStatus status);

    List<CampaignRequest> findAllByCampaignAndProfile(Campaign campaign, Profile profile);

    @Query(value = """
        SELECT COUNT(r)
        FROM CampaignRequest r
        WHERE r.campaign.id = :campaignId
        AND r.status = 'PENDING'
        """, nativeQuery = true)
    long countPendingRequestsByCampaignId(Long campaignId);
}
