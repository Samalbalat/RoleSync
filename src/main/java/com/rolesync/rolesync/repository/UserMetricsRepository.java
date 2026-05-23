package com.rolesync.rolesync.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import com.rolesync.rolesync.model.User;
import com.rolesync.rolesync.model.UserMetrics;

public interface UserMetricsRepository extends JpaRepository<UserMetrics, Long>{


    Optional<UserMetrics> findByUser(User user);
    
    @Modifying(clearAutomatically = true)
    @Query("""
        UPDATE UserMetrics m
        SET m.postsCount = m.postsCount + 1,
            m.lastUpdated = CURRENT_TIMESTAMP
        WHERE m.user = :user
    """)
    void incrementPosts(User user);
    
}
