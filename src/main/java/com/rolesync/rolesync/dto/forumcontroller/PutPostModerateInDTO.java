package com.rolesync.rolesync.dto.forumcontroller;

import lombok.Data;

@Data
public class PutPostModerateInDTO {
    private String isLocked;
    private String isPinned;
}
