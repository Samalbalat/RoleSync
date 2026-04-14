package com.rolesync.rolesync.dto.campaigncontroller.mappers;

import com.rolesync.rolesync.dto.campaigncontroller.CampaignGetByFilterDTO;
import com.rolesync.rolesync.model.Campaign;

public class CampaignMapper {

    public static CampaignGetByFilterDTO toGetByFilterDTO(Campaign campaign) {
        if (campaign == null) {
            return null;
        }

        CampaignGetByFilterDTO dto = new CampaignGetByFilterDTO();

        dto.setId(campaign.getId() != null ? String.valueOf(campaign.getId()) : null);
        dto.setName(campaign.getName());
        dto.setCommunication(campaign.getCommunication());
        dto.setThemes(campaign.getThemes());
        dto.setImage(campaign.getImage());
        dto.setSystem(campaign.getSystem());

        // Enum → String (safe)
        dto.setStatus(
            campaign.getStatus() != null ? campaign.getStatus().name() : null
        );

        // Safe player count (no lazy loading involved)
        dto.setCurrentPlayers(
            campaign.getMembers() != null ? campaign.getMembers().size() : 0
        );

        dto.setMaxPlayers(
            campaign.getMaxPlayers() != null ? campaign.getMaxPlayers() : 0
        );

        return dto;
    }
}
