package com.rolesync.rolesync.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.querydsl.QuerydslPredicateExecutor;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import com.rolesync.rolesync.model.Post;
import com.rolesync.rolesync.repository.custominterfaces.PostRepositoryCustom;

@Repository
public interface PostRepository
        extends JpaRepository<Post, Long>, QuerydslPredicateExecutor<Post>, PostRepositoryCustom {

    List<Post> findByCampaignId(Long campaignId);

    Optional<Post> findById(Long id);

    @Query(value = """
                SELECT
                    p.id,
                    p.type,
                    p.title,
                    p.tags,
                    p.content,
                    p.created_at,
                    p.updated_at,
                    p.is_edited,
                    p.is_locked,
                    pr.profilename,
                    pr.image,
                    p.media_urls
                FROM posts p
                JOIN profiles pr ON pr.id = p.author_profile_id
                WHERE p.campaign_id IS NULL
                  AND p.type = 'THREAD_START'
                  AND (
                        CAST(:tags AS text[]) IS NULL
                        OR p.tags && CAST(:tags AS text[])
                  )
                ORDER BY p.created_at DESC
                LIMIT :limit OFFSET :offset
            """, nativeQuery = true)
    List<Object[]> findForumPosts(
            @Param("tags") String[] tags,
            @Param("limit") int limit,
            @Param("offset") long offset);

    @Query(value = """
        SELECT COUNT(*)
        FROM posts p
        WHERE p.campaign_id IS NULL
        AND p.type = 'THREAD_START'
        AND (
                CAST(:tags AS text[]) IS NULL
                OR p.tags && CAST(:tags AS text[])
        )
    """, nativeQuery = true)
    long countForumPosts(@Param("tags") String[] tags);

}
