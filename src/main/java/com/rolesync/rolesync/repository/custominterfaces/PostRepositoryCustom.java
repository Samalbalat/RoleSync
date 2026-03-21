package com.rolesync.rolesync.repository.custominterfaces;

import java.time.Instant;
import java.util.List;

import com.rolesync.rolesync.model.Post;

public interface PostRepositoryCustom {
    List<Post> findCampaignPosts(Long campaignId, Instant cursor, int limit);
}
