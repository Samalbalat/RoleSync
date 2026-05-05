package com.rolesync.rolesync.dto.forumcontroller;

import lombok.Data;

@Data
public class PutPostModerateInDTO {
    private Boolean isLocked;
    private Boolean isPinned;
}
