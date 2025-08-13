package com.rolesync.rolesync.services;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.rolesync.rolesync.dto.CampaignDTO;
import com.rolesync.rolesync.entities.Campaign;
import com.rolesync.rolesync.repositories.CampaignRepository;

@Service
public class CampaignService {
    // This service will handle campaign-related operations
    @Autowired
    private CampaignRepository campaignRepository;

    // This method retrieves all campaigns
    public List<CampaignDTO> getAllCampaigns() {
        List<CampaignDTO> campaignDTOs = new ArrayList<>();
        // Convert each Campaign entity to CampaignDTO
        campaignRepository.findAll().forEach(campaign -> {
            CampaignDTO campaignDTO = new CampaignDTO(campaign);
            campaignDTOs.add(campaignDTO);
        });
        return campaignDTOs;
    }

    // This method retrieves a campaign by its ID
    public Campaign getCampaignById(Long id) {
        return campaignRepository.findById(id).orElse(null);
    }

    // This method saves a campaign
    public Campaign saveCampaign(Campaign campaign) {
        return campaignRepository.save(campaign);
    }

    // This method deletes a campaign by its ID
    public void deleteCampaign(Long id) {
        campaignRepository.deleteById(id);
    }

}
