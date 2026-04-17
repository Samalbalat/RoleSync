package com.rolesync.rolesync.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import com.rolesync.rolesync.model.Profile;
import com.rolesync.rolesync.model.ProfileMetrics;

public interface ProfileMetricsRepository extends JpaRepository<ProfileMetrics, Long>{


    Optional<ProfileMetrics> findByProfile(Profile profile);
    
    @Modifying(clearAutomatically = true)
    @Query("""
        UPDATE ProfileMetrics m
        SET m.postsCount = m.postsCount + 1,
            m.lastUpdated = CURRENT_TIMESTAMP
        WHERE m.profile = :profile
    """)
    void incrementPosts(Profile profile);

    @Modifying(clearAutomatically = true)
    @Query("""
        UPDATE ProfileMetrics m
        SET m.campaignsCount = m.campaignsCount + 1,
            m.lastUpdated = CURRENT_TIMESTAMP
        WHERE m.profile = :profile
    """)
    void incrementCampaigns(Profile profile);

    @Modifying(clearAutomatically = true)
    @Query("""
        UPDATE ProfileMetrics m
        SET m.repliesCount = m.repliesCount + 1,
            m.lastUpdated = CURRENT_TIMESTAMP
        WHERE m.profile = :profile
    """)
    void incrementReplies(Profile profile);
    
}
