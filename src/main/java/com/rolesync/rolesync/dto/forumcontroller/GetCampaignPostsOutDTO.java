package com.rolesync.rolesync.dto.forumcontroller;

import java.time.Instant;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class GetCampaignPostsOutDTO {
    private List<GetCampaignPostsOutItemDTO> data;
    private Instant nextCursor;
    private boolean hasMore;

}
