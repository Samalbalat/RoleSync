package com.rolesync.rolesync.dto.forumcontroller;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class GetForumPostsOutDTO {
    private List<GetForumPostsOutItemDTO> data;
    private GetForumPostsOutMetaDTO meta;
}
