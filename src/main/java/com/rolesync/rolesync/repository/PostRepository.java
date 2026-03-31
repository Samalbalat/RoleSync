package com.rolesync.rolesync.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.querydsl.QuerydslPredicateExecutor;
import org.springframework.stereotype.Repository;

import com.rolesync.rolesync.model.Post;
import com.rolesync.rolesync.repository.custominterfaces.PostRepositoryCustom;

@Repository
public interface PostRepository extends JpaRepository<Post, Long>, QuerydslPredicateExecutor<Post>, PostRepositoryCustom{

    List<Post> findByCampaignId(Long campaignId);

    Optional<Post> findById(Long id);
    
}
