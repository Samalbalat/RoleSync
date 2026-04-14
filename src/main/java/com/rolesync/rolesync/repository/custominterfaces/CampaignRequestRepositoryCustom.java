package com.rolesync.rolesync.repository.custominterfaces;

import java.util.Optional;

import com.rolesync.rolesync.model.CampaignRequest;

public interface CampaignRequestRepositoryCustom {

    Long countPendingRequestsByCampaignId(Long campaignId);

    Optional<CampaignRequest> findLastRequestByProfileAndCampaign(Long profileId, Long campaignId);
    
}
