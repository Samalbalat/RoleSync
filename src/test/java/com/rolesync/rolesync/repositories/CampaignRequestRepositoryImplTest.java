package com.rolesync.rolesync.repositories;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import java.util.Optional;

import com.querydsl.jpa.impl.JPAQuery;
import com.querydsl.jpa.impl.JPAQueryFactory;
import com.rolesync.rolesync.model.CampaignRequest;
import com.rolesync.rolesync.model.QCampaignRequest;
import com.rolesync.rolesync.repository.implementations.CampaignRequestRepositoryImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import com.querydsl.core.types.Predicate;

@ExtendWith(MockitoExtension.class)
class CampaignRequestRepositoryImplTest {

    @Mock
    private JPAQueryFactory queryFactory;

    @Mock
    private JPAQuery<Long> longQuery;

    @Mock
    private JPAQuery<CampaignRequest> entityQuery;

    private CampaignRequestRepositoryImpl repository;

    @BeforeEach
    void setUp() {
        repository = new CampaignRequestRepositoryImpl(queryFactory);
    }

    @Test
    void countPendingRequestsByCampaignId_shouldReturnCount() {
        Long campaignId = 10L;

        when(queryFactory.select(QCampaignRequest.campaignRequest.count()))
                .thenReturn(longQuery);

        when(longQuery.from(QCampaignRequest.campaignRequest)).thenReturn(longQuery);
        when(longQuery.where(any(Predicate.class))).thenReturn(longQuery);
        when(longQuery.fetchOne()).thenReturn(5L);

        Long result = repository.countPendingRequestsByCampaignId(campaignId);

        assertEquals(5L, result);

        verify(queryFactory).select(QCampaignRequest.campaignRequest.count());
        verify(longQuery).from(QCampaignRequest.campaignRequest);
        verify(longQuery).where(any(Predicate.class));
        verify(longQuery).fetchOne();
    }

    @Test
    void findLastRequestByProfileAndCampaign_shouldReturnOptionalValue() {
        Long profileId = 1L;
        Long campaignId = 2L;

        CampaignRequest expected = mock(CampaignRequest.class);

        when(queryFactory.selectFrom(QCampaignRequest.campaignRequest))
                .thenReturn(entityQuery);

        when(entityQuery.where(any(Predicate.class))).thenReturn(entityQuery);
        when(entityQuery.orderBy(QCampaignRequest.campaignRequest.id.desc()))
                .thenReturn(entityQuery);
        when(entityQuery.fetchFirst()).thenReturn(expected);

        Optional<CampaignRequest> result =
                repository.findLastRequestByProfileAndCampaign(profileId, campaignId);

        assertTrue(result.isPresent());
        assertEquals(expected, result.get());

        verify(queryFactory).selectFrom(QCampaignRequest.campaignRequest);
        verify(entityQuery).where(any(Predicate.class));
        verify(entityQuery).orderBy(QCampaignRequest.campaignRequest.id.desc());
        verify(entityQuery).fetchFirst();
    }

    @Test
    void findLastRequestByProfileAndCampaign_shouldReturnEmptyOptional() {
        when(queryFactory.selectFrom(QCampaignRequest.campaignRequest))
                .thenReturn(entityQuery);

        when(entityQuery.where(any(Predicate.class))).thenReturn(entityQuery);
        when(entityQuery.orderBy(QCampaignRequest.campaignRequest.id.desc()))
                .thenReturn(entityQuery);
        when(entityQuery.fetchFirst()).thenReturn(null);

        Optional<CampaignRequest> result =
                repository.findLastRequestByProfileAndCampaign(1L, 2L);

        assertTrue(result.isEmpty());
    }
}