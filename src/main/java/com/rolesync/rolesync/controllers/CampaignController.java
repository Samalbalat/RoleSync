package com.rolesync.rolesync.controllers;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.rolesync.rolesync.dto.CampaignDTO;
import com.rolesync.rolesync.entities.Campaign;
import com.rolesync.rolesync.services.CampaignService;
import com.rolesync.rolesync.services.ProfileService;

@RequestMapping("/campaigns")
@RestController
public class CampaignController {

    @Autowired
    private CampaignService campaignService;

    @Autowired
    private ProfileService profileService; // Assuming a ProfileService exists to handle profiles

    // This method can be used to get all campaigns
    @GetMapping
    public List<CampaignDTO> getAllCampaigns() {
        return campaignService.getAllCampaigns();
    }

    // This method can be used to get a campaign by its ID
    @GetMapping("/search/{id}")
    public Campaign getCampaign(@PathVariable String id) {
        // Convert the ID to Long and retrieve the campaign
        Long campaignId;
        try {
            campaignId = Long.parseLong(id);
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException("Invalid campaign ID: " + id);
        }
        return campaignService.getCampaignById(campaignId);
    }

    // This method can be used to search campaigns based on a query parameter
    @GetMapping("/search")
    public List<CampaignDTO> searchCampaigns() {
        // This method can be implemented to search campaigns based on the query
        // For now, we will return all campaigns
        return campaignService.getAllCampaigns();
    }

    // This method can be used to create a new campaign
    @PostMapping("/create")
    public Campaign createCampaign(@RequestParam String name, @RequestParam String description) {
        // This method can be implemented to create a new campaign
        // For now, we will return a dummy campaign that uses a default peofile
        Campaign campaign = new Campaign();
        Long id = 1L; // Assuming a default profile ID for demonstration
        campaign.setOwner(profileService.getProfileById(id)); // Assuming a method to get a default profile
        campaign.setName(name);
        campaign.setDescription(description);
        campaignService.saveCampaign(campaign);
        return campaign;
    }

    // This method can be used to delete a campaign
    @GetMapping("/delete/{id}")
    public String deleteCampaign(@PathVariable Long id) {
        campaignService.deleteCampaign(id);
        return "Campaign with ID " + id + " deleted successfully.";
    }

    // This method can be used to update a campaign
    @PutMapping("/update/{id}")
    public Campaign updateCampaign(@PathVariable Long id, @RequestParam String name, @RequestParam String description) {
        Campaign campaign = campaignService.getCampaignById(id);
        campaign.setName(name);
        campaign.setDescription(description);
        campaignService.saveCampaign(campaign);
        return campaign;
    }

}
