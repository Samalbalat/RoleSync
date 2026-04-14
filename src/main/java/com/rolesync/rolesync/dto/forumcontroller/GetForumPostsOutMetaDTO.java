package com.rolesync.rolesync.dto.forumcontroller;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class GetForumPostsOutMetaDTO {
    private Long currentPage;
    private Long totalPages;
    private Long totalItems;

}
