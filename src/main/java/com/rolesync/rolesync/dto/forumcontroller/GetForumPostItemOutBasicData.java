package com.rolesync.rolesync.dto.forumcontroller;

import java.time.Instant;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class GetForumPostItemOutBasicData {
    private Long id;
    private String type;
    private String title;
    private String content;
    private Instant createdAt;
    private Instant updatedAt;
    private boolean isEdited;
    private boolean isLocked;
}
