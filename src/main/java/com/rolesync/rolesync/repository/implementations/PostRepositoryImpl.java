package com.rolesync.rolesync.repository.implementations;

import java.time.Instant;
import java.util.List;

import com.querydsl.jpa.impl.JPAQueryFactory;
import com.rolesync.rolesync.model.Post;
import com.rolesync.rolesync.model.QPost;
import com.rolesync.rolesync.repository.custominterfaces.PostRepositoryCustom;

import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public class PostRepositoryImpl implements PostRepositoryCustom {

    private final JPAQueryFactory queryFactory;

    @Override
    public List<Post> findCampaignPosts(Long campaignId, Instant cursor, int limit) {
        QPost post = QPost.post;

        
        return queryFactory
                .selectFrom(post)
                .where(
                        post.campaign.id.eq(campaignId),
                        cursor != null ? post.createdAt.lt(cursor) : null
                )
                .orderBy(
                    post.createdAt.desc(),
                    post.id.desc()) // 👈 REQUIRED for consistency)
                .limit(limit + 1) // key for hasMore
                .fetch();
    }
}