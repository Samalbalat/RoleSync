package com.rolesync.rolesync.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.querydsl.QuerydslPredicateExecutor;

import com.rolesync.rolesync.model.CampaignRequest;
import com.rolesync.rolesync.model.CampaignRequestStatus;

public interface CampaignRequestRepository extends JpaRepository<CampaignRequest, Long>, QuerydslPredicateExecutor<CampaignRequest>{
  
    List<CampaignRequest> findAllByCampaignIdAndStatus(Long campaignId, CampaignRequestStatus status);
}
