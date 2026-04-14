package com.rolesync.rolesync.dto.forumcontroller;

import lombok.Data;

import java.util.List;

import java.time.Instant;

import com.rolesync.rolesync.model.Post;
import com.rolesync.rolesync.model.PostType;

import lombok.AllArgsConstructor;

@Data
@AllArgsConstructor
public class CampaignPostDTO {

    private Long id;
    private PostType type;
    private String content;

    private Long authorProfileId;
    private Long authorCharacterId;
    private String authorCharacterName;
    private String authorCharacterImage;

    private Long campaignId;
    private Long parentPostId;

    private Instant createdAt;

    private boolean isOoc;
    private boolean isDm;

    private List<String> mediaUrls;

    private boolean isEdited;
    private Instant updatedAt;

    private boolean isPinned;
    private boolean isLocked;

    private List<Long> visibleToCharacterIds;

    public CampaignPostDTO (Post post) {
        this.id = post.getId();
        this.type = post.getType();
        this.content = post.getContent();

        this.authorProfileId = post.getAuthorProfileId();
        this.authorCharacterId = post.getAuthorCharacterId();
        this.authorCharacterName = post.getAuthorCharacterName();
        this.authorCharacterImage = post.getAuthorCharacterImage();

        this.campaignId = post.getCampaign().getId();
        this.parentPostId = post.getParentPost() != null ? post.getParentPost().getId() : null;

        this.createdAt = post.getCreatedAt();

        this.isOoc = post.isOoc();
        this.isDm = post.isDm();

        this.mediaUrls = post.getMediaUrls();

        this.isEdited = post.isEdited();
        this.updatedAt = post.getUpdatedAt();

        this.isPinned = post.isPinned();
        this.isLocked = post.isLocked();

        this.visibleToCharacterIds = post.getVisibleToCharacterIds().stream().map(Long::valueOf).toList();
    }
}