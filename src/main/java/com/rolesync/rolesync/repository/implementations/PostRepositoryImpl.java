package com.rolesync.rolesync.repository.implementations;

import java.time.Instant;
import java.util.List;

import com.querydsl.core.BooleanBuilder;
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

    @Override
    public List<Post> findForumPosts() {
        QPost post = QPost.post;

        
        return queryFactory
                .selectFrom(post)
                .where(
                        post.campaign.isNull() // forum posts have no campaign
                )
                .orderBy(
                    post.createdAt.desc(),
                    post.id.desc()) // 👈 REQUIRED for consistency)
                .fetch();
    }

    @Override
    public List<Post> findPostReplies(Long postId, Instant cursor, int limit) {
        QPost post = QPost.post;

        
        return queryFactory
                .selectFrom(post)
                .where(
                        post.parentPost.id.eq(postId),
                        cursor != null ? post.createdAt.lt(cursor) : null
                )
                .orderBy(
                    post.createdAt.desc(),
                    post.id.desc()) // 👈 REQUIRED for consistency)
                .limit(limit + 1) // key for hasMore
                .fetch();
    }

    @Override
    public List<Post> findPostsByTags(List<String> tags, long limit, long offset) {
    QPost post = QPost.post;

    BooleanBuilder builder = new BooleanBuilder();

    if (tags != null && !tags.isEmpty()) {
        for (String tag : tags) {
            builder.and(post.tags.contains(tag)); // 👈 ALL tags must match
        }
        
    }

    builder.and(post.campaign.isNull()); // Only forum posts

    return queryFactory
            .selectFrom(post)
            .where(builder)
            .orderBy(post.createdAt.desc(), post.id.desc())
            .offset(offset)
            .limit(limit)
            .fetch();
    }

    @Override
    public List<Post> findPostsByAuthorId(Long authorId, long limit, long offset) {
        QPost post = QPost.post;

    BooleanBuilder builder = new BooleanBuilder();

        builder.and(post.authorProfileId.eq(authorId));
        builder.and(post.campaign.isNull()); // Only forum posts

    return queryFactory
            .selectFrom(post)
            .where(builder)
            .orderBy(post.createdAt.desc(), post.id.desc())
            .offset(offset)
            .limit(limit)
            .fetch();
    }

    @Override
    public Long countForumPostsByAuthorId(Long authorId) {
        QPost post = QPost.post;
        
        BooleanBuilder builder = new BooleanBuilder();

            builder.and(post.authorProfileId.eq(authorId));
            builder.and(post.campaign.isNull()); // Only forum posts

            return queryFactory
                    .select(post.count())
                    .from(post)
                    .where(builder)
                    .fetchOne();
    }

    @Override
    public Long countForumPostsByTags(List<String> tags) {
       QPost post = QPost.post;

        BooleanBuilder builder = new BooleanBuilder();

        if (tags != null && !tags.isEmpty()) {
            for (String tag : tags) {
                builder.and(post.tags.contains(tag)); // 👈 ALL tags must match
            }
            
        }

        builder.and(post.campaign.isNull()); // Only forum posts

        return queryFactory
                .select(post.count())
                .from(post)
                .where(builder)
                .fetchOne();
        }

}