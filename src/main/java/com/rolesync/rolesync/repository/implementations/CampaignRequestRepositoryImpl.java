package com.rolesync.rolesync.repository.implementations;

import java.util.Optional;

import com.querydsl.core.BooleanBuilder;
import com.querydsl.jpa.impl.JPAQueryFactory;
import com.rolesync.rolesync.model.CampaignRequest;
import com.rolesync.rolesync.model.CampaignRequestStatus;
import com.rolesync.rolesync.model.QCampaignRequest;
import com.rolesync.rolesync.repository.custominterfaces.CampaignRequestRepositoryCustom;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public class CampaignRequestRepositoryImpl implements CampaignRequestRepositoryCustom {

    private final JPAQueryFactory queryFactory;

    @Override
    public Long countPendingRequestsByCampaignId(Long campaignId) {
        QCampaignRequest campaignRequest = QCampaignRequest.campaignRequest;

        BooleanBuilder builder = new BooleanBuilder();

        builder.and(campaignRequest.campaign.id.eq(campaignId));
        builder.and(campaignRequest.status.eq(CampaignRequestStatus.PENDING));

        return queryFactory
        .select(campaignRequest.count())
        .from(campaignRequest)
        .where(builder)
        .fetchOne();
    }

    @Override
    public Optional<CampaignRequest> findLastRequestByProfileAndCampaign(Long profileId, Long campaignId) {
        QCampaignRequest campaignRequest = QCampaignRequest.campaignRequest;

        BooleanBuilder builder = new BooleanBuilder();

        builder.and(campaignRequest.profile.id.eq(profileId));
        builder.and(campaignRequest.campaign.id.eq(campaignId));

        return Optional.ofNullable(queryFactory
        .selectFrom(campaignRequest)
        .where(builder)
        .orderBy(campaignRequest.id.desc())
        .fetchFirst());
    }
}
