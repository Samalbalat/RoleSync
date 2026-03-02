package com.rolesync.rolesync.repository;

import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.querydsl.QuerydslPredicateExecutor;

import com.rolesync.rolesync.model.Campaign;

@Repository
public interface CampaignRepository extends JpaRepository<Campaign, Long>, QuerydslPredicateExecutor<Campaign>{
    
}
