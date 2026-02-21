package com.rolesync.rolesync.controller;

import java.util.Arrays;
import java.util.Optional;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.core.Authentication;

import com.rolesync.rolesync.dto.characterSheetController.CharacterTemplateInPostDTO;
import com.rolesync.rolesync.dto.characterSheetController.CharacterTemplateOutPostDTO;
import com.rolesync.rolesync.model.Campaign;
import com.rolesync.rolesync.model.CharacterSheet;
import com.rolesync.rolesync.model.Profile;
import com.rolesync.rolesync.repository.CampaignRepository;
import com.rolesync.rolesync.repository.CharacterSheetRepository;
import com.rolesync.rolesync.repository.ProfileRepository;
import com.rolesync.rolesync.utils.UtilsCalls;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;


@RestController
@RequestMapping("/rolesync")
public class CharacterSheetController {

    private final CampaignRepository campaignRepository;
    private final CharacterSheetRepository characterSheetRepository;
    private final UtilsCalls utilsCalls;

    public CharacterSheetController(
            CampaignRepository campaignRepository,
            UtilsCalls utilsCalls,
            ProfileRepository profileRepository,
            CharacterSheetRepository characterSheetRepository) 
    {
        this.campaignRepository = campaignRepository;
        this.characterSheetRepository = characterSheetRepository;
        this.utilsCalls = utilsCalls;
    }

    // ---------- POST ----------
    @PostMapping("/campaigns/{campaignId}/templates")
    public ResponseEntity<?> createTemplate(
            Authentication authentication,
            @PathVariable Long campaignId,
            @RequestBody CharacterTemplateInPostDTO dto) 
    {
        Optional<Campaign> campaignOpt = campaignRepository.findById(campaignId);
        if (campaignOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Campaign campaign = campaignOpt.get();
        Profile activeProfile = utilsCalls
                .getProfileFromAuthentication(authentication, campaign.getCampaignType().name())
                .orElseThrow(() -> new IllegalStateException("Active profile not found"));
        if (!campaign.getOwnerName().equals(activeProfile.getProfilename())) {
            return ResponseEntity.status(403).body("User is not the campaign owner");
        }
        
        CharacterSheet characterSheet = new CharacterSheet();
        characterSheet.setName(null);
        characterSheet.setSchema(dto.getSchema_definition());
        characterSheet.setImage(null);
        characterSheet.setIsTemplate(true);
        characterSheet.setCampaignId(campaignId);
        characterSheetRepository.save(characterSheet);
        CharacterTemplateOutPostDTO response = new CharacterTemplateOutPostDTO();
        response.setId(characterSheet.getId());
        response.setCampaign_id(campaignId.toString());
        response.setSchema_definition(characterSheet.getSchema());
        return ResponseEntity.ok(response);
    }

    // ---------- GET ----------
    @GetMapping("/campaigns/{campaignId}/templates")
    public ResponseEntity<?> getTemplates(
            Authentication authentication,
            @PathVariable Long campaignId) 
    {
        Optional<Campaign> campaignOpt = campaignRepository.findById(campaignId);
        if (campaignOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Campaign campaign = campaignOpt.get();
        Profile activeProfile = utilsCalls
                .getProfileFromAuthentication(authentication, campaign.getCampaignType().name())
                .orElseThrow(() -> new IllegalStateException("Active profile not found"));
        if (!campaign.getOwnerName().equals(activeProfile.getProfilename()) &&
            (campaign.getMembers() == null || !Arrays.asList(campaign.getMembers()).contains(activeProfile.getProfilename()))) {
            return ResponseEntity.status(403).body("User is not a member of the campaign");
        }
        return ResponseEntity.ok().build();
    }
}
