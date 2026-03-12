package com.rolesync.rolesync.dto.campaigncontroller;

import java.util.List;
import lombok.Data;

@Data
public class CampaignGetMeOutDTO {

    private List<CampaignGetMeOutItemDTO> asMaster;
    private List<CampaignGetMeOutItemDTO> asPlayer;
    
}
