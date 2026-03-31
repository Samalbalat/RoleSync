package com.rolesync.rolesync.repository.custominterfaces;

import java.time.Instant;
import java.util.List;

import com.rolesync.rolesync.model.Post;

public interface PostRepositoryCustom {
    List<Post> findCampaignPosts(Long campaignId, Instant cursor, int limit);

    List<Post> findForumPosts();

    List<Post> findPostReplies(Long postId, Instant cursor, int limit);

    List<Post> findPostsByTags(List<String> tags, long limit, long offset);

    List<Post> findPostsByAuthorId(Long authorId, long limit, long offset);

    Long countForumPostsByAuthorId(Long authorId);

    Long countForumPostsByTags(List<String> tags);
}
