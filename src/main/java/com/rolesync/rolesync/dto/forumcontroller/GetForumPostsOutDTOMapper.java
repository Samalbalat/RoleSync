package com.rolesync.rolesync.dto.forumcontroller;

import com.rolesync.rolesync.model.Post;

public class GetForumPostsOutDTOMapper {

    public static GetForumPostsOutItemDTO toDTO(Post post) {
        GetForumPostsOutItemDTO dto = new GetForumPostsOutItemDTO();

        dto.setId(post.getId());
        dto.setType(post.getType().name());
        dto.setTitle(post.getTitle());
        dto.setTags(post.getTags());
        dto.setContent(post.getContent());

        dto.setCreatedAt(post.getCreatedAt());
        dto.setUpdatedAt(post.getUpdatedAt());

        dto.setEdited(post.isEdited());
        dto.setLocked(post.isLocked());

        dto.setMediaUrls(post.getMediaUrls());
        return dto;
    }

    public static GetForumPostsOutItemDTO toDTO(Post post, String profileName, String image) {
        GetForumPostsOutItemDTO dto = new GetForumPostsOutItemDTO();

        dto.setId(post.getId());
        dto.setType(post.getType().name());
        dto.setTitle(post.getTitle());
        dto.setTags(post.getTags());
        dto.setContent(post.getContent());

        dto.setCreatedAt(post.getCreatedAt());
        dto.setUpdatedAt(post.getUpdatedAt());

        dto.setEdited(post.isEdited());
        dto.setLocked(post.isLocked());

        dto.setMediaUrls(post.getMediaUrls());
        dto.setAuthor(new GetForumPostsOutItemAuthorDTO(profileName, image));
        return dto;
    }
    
}
