package com.rolesync.rolesync.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.querydsl.QuerydslPredicateExecutor;
import org.springframework.stereotype.Repository;

import com.rolesync.rolesync.model.Post;

@Repository
public interface PostRepository extends JpaRepository<Post, Long>, QuerydslPredicateExecutor<Post>{

    List<Post> findByCampaignId(Long campaignId);
    
}
