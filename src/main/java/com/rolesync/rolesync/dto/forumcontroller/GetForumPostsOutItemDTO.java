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
    
}
