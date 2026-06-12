package com.rolesync.rolesync.repository.custominterfaces;

import java.time.Instant;
import java.util.List;

import com.rolesync.rolesync.model.Post;
import com.rolesync.rolesync.model.Profile;

public interface PostRepositoryCustom {
    List<Post> findCampaignPosts(Long campaignId, Instant cursor, int limit, Long accessingCharacterId);

    List<Post> findForumPosts();

    List<Post> findPostReplies(Long postId, Instant cursor, int limit);

    List<Post> findPostsByTags(List<String> tags, long limit, long offset);

    List<Post> findPostsByAuthor(Profile author, long limit, long offset);

    Long countForumPostsByAuthor(Profile author);

    Long countForumPostsByTags(List<String> tags);
}
