package com.rolesync.rolesync.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.core.Authentication;

import com.rolesync.rolesync.dto.charactersheetcontroller.CharacterSheetGetOutDTO;
import com.rolesync.rolesync.dto.charactersheetcontroller.CharacterSheetInPostDTO;
import com.rolesync.rolesync.dto.charactersheetcontroller.CharacterTemplateOutPostDTO;
import com.rolesync.rolesync.model.Campaign;
import com.rolesync.rolesync.model.CharacterSheet;
import com.rolesync.rolesync.model.Profile;
import com.rolesync.rolesync.repository.CampaignRepository;
import com.rolesync.rolesync.repository.CharacterSheetRepository;
import com.rolesync.rolesync.repository.ProfileRepository;
import com.rolesync.rolesync.utils.UtilsCalls;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;


@RestController
@RequestMapping("/rolesync")
public class CharacterSheetController {

    private final CampaignRepository campaignRepository;
    private final CharacterSheetRepository characterSheetRepository;
    private final UtilsCalls utilsCalls;
    private final ProfileRepository profileRepository;

    public CharacterSheetController(
            CampaignRepository campaignRepository,
            UtilsCalls utilsCalls,
            ProfileRepository profileRepository,
            CharacterSheetRepository characterSheetRepository
        ) 
    {
        this.campaignRepository = campaignRepository;
        this.characterSheetRepository = characterSheetRepository;
        this.utilsCalls = utilsCalls;
        this.profileRepository = profileRepository;
    }

    // ---------- GET TEMPLATES FROM CAMPAIGN ----------
    @GetMapping("/campaigns/{campaignId}/templates")
    public ResponseEntity<?> getTemplatesFromCampaign(
            Authentication authentication,
            @PathVariable Long campaignId,
            @RequestHeader("X-Profile-Name") String profileName) 
    {
        return getSheetsFromCampaign(authentication, campaignId, true, profileName);
    }

    // ---------- GET CHARACTERS FROM CAMPAIGN----------
    @GetMapping("/campaigns/{campaignId}/characters")
    public ResponseEntity<?> getCharactersFromCampaign(
            Authentication authentication,
            @PathVariable Long campaignId,
            @RequestHeader("X-Profile-Name") String profileName) 
    {
        return getSheetsFromCampaign(authentication, campaignId, false, profileName);
    }

    // ---------- POST A CHARACTER ----------
    @PostMapping("/characters")
    public ResponseEntity<?> createFreeCharacter(
            Authentication authentication,
            @RequestBody CharacterSheetInPostDTO dto,
            @RequestHeader("X-Profile-Name") String profileName)  
    {   return postMySheets(authentication, dto, false, profileName);
    }

    @PostMapping("/templates")
    public ResponseEntity<?> createTemplate(
            Authentication authentication,
            @RequestBody CharacterSheetInPostDTO dto,
            @RequestHeader("X-Profile-Name") String profileName) 
    {   return postMySheets(authentication, dto, true, profileName);
    }

    // ---------- GET CHARACTER BY ID ----------
    @GetMapping("/characters/{id}")
    public ResponseEntity<?> getCharacterById(
            Authentication authentication,
            @PathVariable Long id,
            @RequestHeader("X-Profile-Name") String profileName
    ) 
    {   
        return getSheetById(authentication, id, false, profileName);
    }

    @GetMapping("/templates/{id}")
    public ResponseEntity<?> getTemplateById(
            Authentication authentication,
            @PathVariable Long id,
            @RequestHeader("X-Profile-Name") String profileName
    ) 
    {   
        return getSheetById(authentication, id, true, profileName);
    }

    // ---------- PUT CHARACTER BY ID ----------
    @PutMapping("/characters/{id}")
    public ResponseEntity<?> updateCharacter(
            Authentication authentication,
            @PathVariable Long id,
            @RequestBody CharacterSheetInPostDTO dto,
            @RequestHeader("X-Profile-Name") String profileName
    ) 
    {   
        return updateSheet(authentication, id, dto, profileName);
    }

     @PutMapping("/templates/{id}")
    public ResponseEntity<?> updateTemplate(
            Authentication authentication,
            @PathVariable Long id,
            @RequestBody CharacterSheetInPostDTO dto,
            @RequestHeader("X-Profile-Name") String profileName
    ) 
    {   
        return updateSheet(authentication, id, dto, profileName);
    }

    // ---------- GET MY CHARACTERS ----------
    @GetMapping("/characters/me")
    public ResponseEntity<?> getMyCharacters(Authentication authentication, @RequestHeader("X-Profile-Name") String profileName) 
    {   return getMySheets(authentication, false, profileName);
    }

    // ---------- GET CHARACTERS ----------
    @GetMapping("/characters")
    public ResponseEntity<?> getCharacters() 
    {   return getSheets(false);
    }

    // ---------- GET TEMPLATES ----------
    @GetMapping("/templates")
    public ResponseEntity<?> getTemplates() 
    {   return getSheets(true);
    }

    // ---------- GET MY TEMPLATES ----------
    @GetMapping("/templates/me")
    public ResponseEntity<?> getMyTemplates(Authentication authentication, @RequestHeader("X-Profile-Name") String profileName)
    { return getMySheets(authentication, true, profileName);
    }

    private ResponseEntity<?> postMySheets(Authentication authentication, CharacterSheetInPostDTO dto, boolean isTemplate, String profileName) {
        CharacterSheet characterSheet = new CharacterSheet();
        CharacterTemplateOutPostDTO response = new CharacterTemplateOutPostDTO();
        if(!utilsCalls.checkAuthAndProfile(authentication, profileName)){
            return ResponseEntity.status(403).body("User not authenticated or profile not found");
        }

        Optional<Profile> profileOpt = profileRepository.findByProfilename(profileName);
        if(profileOpt.isEmpty()){
            return ResponseEntity.status(403).body("Profile not found");
        }
        characterSheet.setOwner(profileOpt.get());

        if(dto.getCampaign_id()!=null){
            assignCampingToPost(characterSheet, response, dto, profileName);
        }else{
            characterSheet.setCampaign(null);
        }
        characterSheet.setIsPublic(dto.getIsPublic() != null ? dto.getIsPublic() : true);
        characterSheet.setName(dto.getName());
        characterSheet.setSchema(dto.getAttributes());
        characterSheet.setImage(dto.getAvatar_url());
        characterSheet.setIsTemplate(isTemplate);
        characterSheetRepository.save(characterSheet);
        
        response.setId(characterSheet.getId());
        response.setImage(dto.getAvatar_url());
        response.setName(dto.getName());
        response.setSchema_definition(dto.getAttributes());
        return ResponseEntity.ok(response);
    }

    private ResponseEntity<?> assignCampingToPost(CharacterSheet characterSheet, CharacterTemplateOutPostDTO response, CharacterSheetInPostDTO dto, String profileName){
            Optional<Campaign> campaignOpt = campaignRepository.findById(dto.getCampaign_id());
            if (!campaignOpt.isEmpty()) {
                Campaign campaign = campaignOpt.get();
                Profile activeProfile = profileRepository.findByProfilename(profileName)
                    .orElseThrow(() -> new IllegalStateException("Active profile not found"));

                if (!campaign.getOwnerName().equals(activeProfile.getProfilename()) &&
                    (campaign.getMembers() == null || !campaign.getMembers().contains(activeProfile.getProfilename()))) {
                    return ResponseEntity.status(403).body("User is not a member of the campaign");
                }
                characterSheet.setCampaign(campaign);
                response.setCampaign_name(campaign.getName());
                response.setCampaign_id(dto.getCampaign_id().toString());
                return ResponseEntity.ok(response);
            }else{
                return ResponseEntity.status(404).body("Campaign not found");
            }
    }

    private ResponseEntity<?> getSheets(boolean isTemplate) {
        List<CharacterSheet> templates = characterSheetRepository.findByIsTemplateAndIsPublic(isTemplate, true);
        List<CharacterTemplateOutPostDTO> response = templates.stream().map(template -> {
            CharacterTemplateOutPostDTO dto = new CharacterTemplateOutPostDTO();
            dto.setId(template.getId());
            if(template.getCampaign()!=null){
                dto.setCampaign_id(template.getCampaign().getId().toString());
                dto.setCampaign_name(template.getCampaign().getName());
            }else{
                dto.setCampaign_id(null);
                dto.setCampaign_name(null);
            }
            if(template.getImage()!=null){
                    dto.setImage(template.getImage());
                }
            dto.setSchema_definition(template.getSchema());
            return dto;
        }).toList();
        return ResponseEntity.ok(response);
    }

    private ResponseEntity<?> getMySheets
            (Authentication authentication,
            boolean isTemplate,
            @RequestHeader("X-Profile-Name") String profileName)
        {
        if(!utilsCalls.checkAuthAndProfile(authentication, profileName)){
            return ResponseEntity.status(403).body("User not authenticated or profile not found");
        }
        Optional<Profile> profileOpt = profileRepository.findByProfilename(profileName);
        if(profileOpt.isEmpty()){
            return ResponseEntity.status(403).body("Profile not found");
        }
        Profile profile = profileOpt.get();
        List<CharacterSheet> sheets = characterSheetRepository.findByOwnerAndIsTemplate(profile, isTemplate);
        List<CharacterTemplateOutPostDTO> response = sheets.stream().map(sheet -> {
            CharacterTemplateOutPostDTO dto = new CharacterTemplateOutPostDTO();
            dto.setId(sheet.getId());
            if(sheet.getCampaign()!=null){
                dto.setCampaign_id(sheet.getCampaign().getId().toString());
                dto.setCampaign_name(sheet.getCampaign().getName());
            }else{
                dto.setCampaign_id(null);
                dto.setCampaign_name(null);
            }
            if(sheet.getImage()!=null){
                    dto.setImage(sheet.getImage());
                }
            dto.setSchema_definition(sheet.getSchema());
            dto.setName(sheet.getName());
            return dto;
        }).toList();
        return ResponseEntity.ok(response);
    }

    private ResponseEntity<?> getSheetsFromCampaign(Authentication authentication, Long campaignId, boolean isTemplate, String profileName) {
        Optional<Campaign> campaignOpt = campaignRepository.findById(campaignId);
        if (campaignOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        if(!utilsCalls.checkAuthAndProfile(authentication, profileName)){
            return ResponseEntity.status(403).body("User not authenticated or profile not found");
        }
        Campaign campaign = campaignOpt.get();
        if (!profileBelongsToCampaign(profileName, campaign)) {
            return ResponseEntity.status(403).body("User is not a member of the campaign");
        }
        
        List<CharacterSheet> sheets = characterSheetRepository.findByCampaignAndIsTemplate(campaign, isTemplate);
        List<CharacterTemplateOutPostDTO> response = sheets.stream().map(sheet -> {
            CharacterTemplateOutPostDTO dto = new CharacterTemplateOutPostDTO();
            dto.setId(sheet.getId());
            dto.setName(sheet.getName());
            dto.setImage(sheet.getImage());
            dto.setCampaign_id(sheet.getCampaign().getId().toString());
            dto.setCampaign_name(sheet.getCampaign().getName());
            dto.setSchema_definition(sheet.getSchema());
            return dto;
        }).toList();
        return ResponseEntity.ok(response);
    }

    private ResponseEntity<?> getSheetById(Authentication authentication, Long id, boolean isTemplate, @RequestHeader ("X-Profile-Name") String profileName) {
        if(!utilsCalls.checkAuthAndProfile(authentication, profileName)){
            return ResponseEntity.status(403).body("User not authenticated or profile not found");
        }
        Optional<CharacterSheet> character = characterSheetRepository.findByIdAndIsTemplate(id, isTemplate);
        Optional<Profile> userOpt = profileRepository.findByProfilename(profileName);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(403).body("User not found");
        }else{
            return getSheetByIdChecking(character, profileName);
        }
    }

    private ResponseEntity<?> updateSheet(Authentication authentication, Long id, CharacterSheetInPostDTO dto, @RequestHeader ("X-Profile-Name") String profileName) {
        if(!utilsCalls.checkAuthAndProfile(authentication, profileName)){
            return ResponseEntity.status(403).body("User not authenticated or profile not found");
        }
        Optional<Profile> userOpt = profileRepository.findByProfilename(profileName);
        Optional<CharacterSheet> character = characterSheetRepository.findById(id);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(403).body("User not found");
        }else{
            if(character.isEmpty()){
                return ResponseEntity.status(404).body("Character not found");
            }else if(!character.get().getOwner().equals(userOpt.get())){
                return ResponseEntity.status(403).body("User is not the owner of this character");
            }
        }
        CharacterSheet characterSheet = character.get();
        characterSheet.setName(dto.getName());
        characterSheet.setSchema(dto.getAttributes());
        characterSheet.setImage(dto.getAvatar_url());
        characterSheetRepository.save(characterSheet);
        CharacterTemplateOutPostDTO response = new CharacterTemplateOutPostDTO();
        response.setId(characterSheet.getId());
        return ResponseEntity.ok(response);
    }

    private boolean profileBelongsToCampaign(String profilename, Campaign campaign){
        return campaign.getOwnerName().equals(profilename) ||
            (campaign.getMembers() != null && campaign.getMembers().contains(profilename));
    }

    private ResponseEntity<?> getSheetByIdChecking(Optional<CharacterSheet> character, String profileName) {
        if (character.isEmpty()) {
            return ResponseEntity.status(404).body("Character not found");
            }
            CharacterSheet sheet = character.get();
            if (Boolean.TRUE.equals(sheet.getIsPublic())) {
                return ResponseEntity.ok(new CharacterSheetGetOutDTO(sheet));
            }
            if (sheet.getCampaign() != null) {
                if (!profileBelongsToCampaign(profileName, sheet.getCampaign())) {
                    return ResponseEntity.status(403).body("User is not a member of the campaign");
                }
                return ResponseEntity.ok(new CharacterSheetGetOutDTO(sheet));
            }
            if (!sheet.getOwner().getProfilename().equals(profileName)) {
                String type = Boolean.TRUE.equals(sheet.getIsTemplate()) ? "template" : "character";
                return ResponseEntity.status(403)
                        .body("User is not the owner of this " + type);
            }
            return ResponseEntity.ok(new CharacterSheetGetOutDTO(sheet));
        }
}

