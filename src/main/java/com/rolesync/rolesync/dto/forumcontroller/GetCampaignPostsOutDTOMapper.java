package com.rolesync.rolesync.dto.forumcontroller;

import com.rolesync.rolesync.model.Post;

public class GetCampaignPostsOutDTOMapper {

    public static GetCampaignPostsOutItemDTO toDTO(Post post) {
        GetCampaignPostsOutItemDTO dto = new GetCampaignPostsOutItemDTO();

        dto.setId(post.getId());
        dto.setType(post.getType().name());

        dto.setTitle(post.getTitle());
        dto.setTags(post.getTags());

        dto.setContent(post.getContent());

        dto.setAuthorProfileId(post.getAuthorProfileId());
        dto.setAuthorCharacterId(post.getAuthorCharacterId());
        dto.setAuthorCharacterName(post.getAuthorCharacterName());
        dto.setAuthorCharacterImage(post.getAuthorCharacterImage());

        dto.setCampaignId(post.getCampaign().getId() != null ? post.getCampaign().getId() : null);


        dto.setParentPostId(
            post.getParentPost() != null ? post.getParentPost().getId() : null
        );

        dto.setCreatedAt(post.getCreatedAt());

        dto.setOoc(post.isOoc());
        dto.setDm(post.isDm());

        dto.setMediaUrls(post.getMediaUrls());

        dto.setEdited(post.isEdited());
        dto.setUpdatedAt(post.getUpdatedAt());

        dto.setPinned(post.isPinned());
        dto.setLocked(post.isLocked());

        dto.setVisibleToCharacterIds(post.getVisibleToCharacterIds());

        return dto;
    }
    
}
