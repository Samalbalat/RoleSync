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

    @Query("""
    SELECT c
    FROM Campaign c
    WHERE :profileName = ANY(c.members)
      AND c.status <> 'DELETED'""")
    List<Campaign> findByMember(String profileName);
}
