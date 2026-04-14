package com.rolesync.rolesync.dto.forumcontroller;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class GetForumPostsOutItemAuthorDTO {

    private Long id;
    private String profileName;
    private String profileImage;

    public GetForumPostsOutItemAuthorDTO(String profileName, String profileImage) {
        this.profileName = profileName;
        this.profileImage = profileImage;
    }

}
