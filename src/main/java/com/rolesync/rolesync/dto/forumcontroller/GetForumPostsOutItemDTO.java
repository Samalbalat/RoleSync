package com.rolesync.rolesync.dto.forumcontroller;

import java.time.Instant;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class GetForumPostsOutItemDTO {
    private Long id;
    private String type;
    private String title;
    private List<String> tags;
    private String content;
    private GetForumPostsOutItemAuthorDTO author;
    private Instant createdAt;
    private Instant updatedAt;
    private boolean isEdited;
    private boolean isLocked;
    private List<String> mediaUrls;
    private Long replyCount;

    public GetForumPostsOutItemDTO(GetForumPostItemOutBasicData basicData, GetForumPostsOutItemAuthorDTO getForumPostsOutItemAuthorDTO, List<String> mediaUrls, List<String> tags, Long replyCount) {
        this.id = basicData.getId();
        this.type = basicData.getType();
        this.title = basicData.getTitle();
        this.content = basicData.getContent();
        this.createdAt = basicData.getCreatedAt();
        this.updatedAt = basicData.getUpdatedAt();
        this.isEdited = basicData.isEdited();
        this.isLocked = basicData.isLocked();
        this.author = getForumPostsOutItemAuthorDTO;
        this.mediaUrls = mediaUrls;
        this.tags = tags;
        this.replyCount = replyCount;
    }
}
