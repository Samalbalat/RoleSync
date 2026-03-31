package com.rolesync.rolesync.dto.forumcontroller;

import java.time.Instant;
import java.util.List;
import java.util.Set;

import lombok.Data;
@Data
public class GetCampaignPostsOutItemDTO {
    
    private Long id;

    private String type;

    private String title;
    private List<String> tags;

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

    private Set<Long> visibleToCharacterIds;
}