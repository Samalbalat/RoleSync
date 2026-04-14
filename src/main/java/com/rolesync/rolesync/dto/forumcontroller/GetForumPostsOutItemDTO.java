package com.rolesync.rolesync.dto.forumcontroller;

import java.time.Instant;
import java.util.List;

import com.rolesync.rolesync.model.PostType;

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

    public GetForumPostsOutItemDTO(
        Long id,
        PostType type,
        String title,
        List<String> tags,
        String content,
        Instant createdAt,
        Instant updatedAt,
        Boolean isEdited,
        Boolean isLocked,
        String profilename,
        String image,
        List<String> mediaUrls) {

    this.id = id;
    this.type = type.toString();
    this.title = title;
    this.tags = tags;
    this.content = content;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.isEdited = isEdited;
    this.isLocked = isLocked;
    this.mediaUrls = mediaUrls;

    this.author = new GetForumPostsOutItemAuthorDTO(profilename, image);
}

    public GetForumPostsOutItemDTO(Long long1, PostType valueOf, String string, List<String> list, String string2,
            GetForumPostsOutItemAuthorDTO getForumPostsOutItemAuthorDTO, Instant instant, Instant instant2,
            Boolean boolean1, boolean b, List<String> list2) {
                this.id = long1;
                this.type = valueOf.toString();
                this.title = string;
                this.tags = list;
                this.content = string2;
                this.author = getForumPostsOutItemAuthorDTO;
                this.createdAt = instant;
                this.updatedAt = instant2;
                this.isEdited = boolean1;
                this.isLocked = b;
                this.mediaUrls = list2;
    }
    
}
