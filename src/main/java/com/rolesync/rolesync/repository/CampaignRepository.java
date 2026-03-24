package com.rolesync.rolesync.repository;

import org.springframework.stereotype.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.querydsl.QuerydslPredicateExecutor;

import com.rolesync.rolesync.model.Campaign;

@Repository
public interface CampaignRepository extends JpaRepository<Campaign, Long>, QuerydslPredicateExecutor<Campaign>{

    List<Campaign> findByOwnerName(String owner);

    @Query(value = """
    SELECT *
    FROM campaign c
    WHERE :profileName = ANY(c.members)
      AND c.status <> 4
    """, nativeQuery = true)
    List<Campaign> findByMember(String profileName);
}
