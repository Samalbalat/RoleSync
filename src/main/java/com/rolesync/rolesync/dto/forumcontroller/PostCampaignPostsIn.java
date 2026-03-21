package com.rolesync.rolesync.dto.forumcontroller;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PostCampaignPostsIn {
    private String type;
    private String content;
    private Long authorCharacterId;
    private Long parentPostId; // nullable
    private Boolean isOoc;
    private List<String> mediaUrls;
    private List<Long> visibleToCharacterIds;

    // getters & setters
}
