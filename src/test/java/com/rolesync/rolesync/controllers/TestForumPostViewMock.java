package com.rolesync.rolesync.controllers;

import java.time.Instant;

public class TestForumPostViewMock{
    public Long getId() { return 1L; }
    public String getType() { return "POST"; }
    public String getTitle() { return "title"; }
    public String getContent() { return "content"; }
    public Instant getCreatedAt() { return Instant.now(); }
    public Instant getUpdatedAt() { return Instant.now(); }
    public Boolean getIsEdited() { return false; }
    public Boolean getIsLocked() { return false; }
    public String getProfilename() { return "user"; }
    public String getImage() { return "img"; }
    public String[] getMediaUrls() { return new String[]{"m1"}; }
    public String[] getTags() { return new String[]{"t1"}; }
    public Integer getReplyCount() { return 5; }
}
