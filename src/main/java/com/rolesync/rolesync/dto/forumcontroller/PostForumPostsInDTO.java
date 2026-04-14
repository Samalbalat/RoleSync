package com.rolesync.rolesync.dto.forumcontroller;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PostForumPostsInDTO {
    private String type;
    private String title;
    private Long parentPostId; // nullable
    private String content;
    private List<String> mediaUrls;
    private List<String> tags;
}
