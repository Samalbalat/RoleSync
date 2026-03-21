package com.rolesync.rolesync.dto.forumcontroller;

import java.time.Instant;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class GetCampaignPostsOutResponseDTO {
    private List<GetCampaignPostsOutResponseItemDTO> data;
    private Instant nextCursor;
    private boolean hasMore;

}
