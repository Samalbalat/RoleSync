package com.rolesync.rolesync.repository.implementations;

import java.time.Instant;
import java.util.List;

import com.querydsl.core.BooleanBuilder;
import com.querydsl.core.types.dsl.BooleanExpression;
import com.querydsl.jpa.impl.JPAQueryFactory;
import com.rolesync.rolesync.model.Post;
import com.rolesync.rolesync.model.PostType;
import com.rolesync.rolesync.model.QPost;
import com.rolesync.rolesync.repository.custominterfaces.PostRepositoryCustom;

import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public class PostRepositoryImpl implements PostRepositoryCustom {

    private final JPAQueryFactory queryFactory;

    @Override
    public List<Post> findCampaignPosts(Long campaignId, Instant cursor, int limit, Long accessingCharacterId) {
        QPost post = QPost.post;

        BooleanBuilder builder = new BooleanBuilder();

        // 1. Campaign filter and cursor
        builder.and(post.campaign.id.eq(campaignId));
        builder.and(cursor != null ? post.createdAt.lt(cursor) : null);

        // 2. Only THREAD_START
        builder.and(post.type.eq(PostType.THREAD_START));

        // 3. Visibility condition
        BooleanExpression isPublic = post.visibleToCharacterIds.isEmpty();
        if (accessingCharacterId!=null) {
            BooleanExpression isVisibleToCharacter =
                post.visibleToCharacterIds.any().eq(accessingCharacterId);
                builder.and(isPublic.or(isVisibleToCharacter));
        }else{
            builder.and(isPublic);
        }
        

        return queryFactory
                .selectFrom(post)
                .where(builder)
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