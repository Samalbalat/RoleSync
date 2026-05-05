package com.rolesync.rolesync.repository.projections;

import java.time.Instant;

public interface ForumPostView {

    Long getId();
    String getType();
    String getTitle();
    String[] getTags();
    String getContent();

    Instant getCreatedAt();
    Instant getUpdatedAt();

    Boolean getIsEdited();
    Boolean getIsLocked();

    String getProfilename();
    String getImage();

    String[] getMediaUrls();

    Long getReplyCount();
}
