package com.rolesync.rolesync.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.core.Authentication;

import com.rolesync.rolesync.dto.charactersheetcontroller.CharacterSheetInPostDTO;
import com.rolesync.rolesync.dto.charactersheetcontroller.CharacterTemplateOutPostDTO;
import com.rolesync.rolesync.model.Campaign;
import com.rolesync.rolesync.model.CharacterSheet;
import com.rolesync.rolesync.model.Profile;
import com.rolesync.rolesync.model.User;
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
            @PathVariable Long id
    ) 
    {   
        return getSheetById(authentication, id);
    }

    @GetMapping("/templates/{id}")
    public ResponseEntity<?> getTemplateById(
            Authentication authentication,
            @PathVariable Long id
    ) 
    {   
        return getSheetById(authentication, id);
    }

    // ---------- PUT CHARACTER BY ID ----------
    @PutMapping("/characters/{id}")
    public ResponseEntity<?> updateCharacter(
            Authentication authentication,
            @PathVariable Long id,
            @RequestBody CharacterSheetInPostDTO dto
    ) 
    {   
        return updateSheet(authentication, id, dto);
    }

     @PutMapping("/templates/{id}")
    public ResponseEntity<?> updateTemplate(
            Authentication authentication,
            @PathVariable Long id,
            @RequestBody CharacterSheetInPostDTO dto
    ) 
    {   
        return updateSheet(authentication, id, dto);
    }

    // ---------- GET MY CHARACTERS ----------
    @GetMapping("/characters/me")
    public ResponseEntity<?> getMyCharacters(Authentication authentication) 
    {   return getMySheets(authentication, false);
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
    public ResponseEntity<?> getMyTemplates(Authentication authentication) 
    { return getMySheets(authentication, true);
    }

    private ResponseEntity<?> postMySheets(Authentication authentication, CharacterSheetInPostDTO dto, boolean isTemplate, String profileName) {
        CharacterSheet characterSheet = new CharacterSheet();
        CharacterTemplateOutPostDTO response = new CharacterTemplateOutPostDTO();

        Optional<User> userOpt = utilsCalls.getUserFromUsername(authentication);
        characterSheet.setOwner(userOpt.get());

        if(dto.getCampaign_id()!=null){
            Optional<Campaign> campaignOpt = campaignRepository.findById(dto.getCampaign_id());

            if (!campaignOpt.isEmpty()) {
                Campaign campaign = campaignOpt.get();
                Profile activeProfile = profileRepository.findByProfilename(profileName)
                    .orElseThrow(() -> new IllegalStateException("Active profile not found"));

                if (!campaign.getOwnerName().equals(activeProfile.getProfilename()) &&
                    (campaign.getMembers() == null || !campaign.getMembers().contains(activeProfile.getProfilename()))) {
                    return ResponseEntity.status(403).body("User is not a member of the campaign");
                }

                characterSheet.setIsPublic(false);
                characterSheet.setCampaign(campaign);
                response.setCampaign_name(campaign.getName());
                response.setCampaign_id(dto.getCampaign_id().toString());

            }else{
                return ResponseEntity.status(404).body("Campaign not found");
            }
        }else{
            characterSheet.setCampaign(null);
        }

        characterSheet.setName(dto.getName());
        characterSheet.setSchema(dto.getAttributes());
        characterSheet.setImage(dto.getAvatar_url());
        characterSheet.setIsTemplate(isTemplate);
        characterSheetRepository.save(characterSheet);
        
        response.setId(characterSheet.getId());
        response.setSchema_definition(dto.getAttributes());
        return ResponseEntity.ok(response);
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
            dto.setSchema_definition(template.getSchema());
            return dto;
        }).toList();
        return ResponseEntity.ok(response);
    }

    private ResponseEntity<?> getMySheets(Authentication authentication, boolean isTemplate) {
        Optional<User> userOpt = utilsCalls.getUserFromUsername(authentication);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(403).body("User not found");
        }
        User user = userOpt.get();
        List<CharacterSheet> sheets = characterSheetRepository.findByOwnerAndIsTemplate(user, isTemplate);
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
        Campaign campaign = campaignOpt.get();
        Profile activeProfile = profileRepository.findByProfilename(profileName)
                .orElseThrow(() -> new IllegalStateException("Active profile not found"));
        if (!campaign.getOwnerName().equals(activeProfile.getProfilename()) &&
            (campaign.getMembers() == null || !campaign.getMembers().contains(activeProfile.getProfilename()))) {
            return ResponseEntity.status(403).body("User is not a member of the campaign");
        }
        
        List<CharacterSheet> sheets = characterSheetRepository.findByCampaignAndIsTemplate(campaign, isTemplate);
        List<CharacterTemplateOutPostDTO> response = sheets.stream().map(sheet -> {
            CharacterTemplateOutPostDTO dto = new CharacterTemplateOutPostDTO();
            dto.setId(sheet.getId());
            dto.setName(sheet.getName());
            dto.setCampaign_id(sheet.getCampaign().getId().toString());
            dto.setCampaign_name(sheet.getCampaign().getName());
            dto.setSchema_definition(sheet.getSchema());
            return dto;
        }).toList();
        return ResponseEntity.ok(response);
    }

    private ResponseEntity<?> getSheetById(Authentication authentication, Long id){
        Optional<User> userOpt = utilsCalls.getUserFromUsername(authentication);
        Optional<CharacterSheet> character = characterSheetRepository.findById(id);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(403).body("User not found");
        }else{
        
            if(character.isEmpty()){
                return ResponseEntity.status(404).body("Character not found");
            }else if(character.get().getIsPublic()==false && !character.get().getOwner().equals(userOpt.get())){
                return ResponseEntity.status(403).body("User is not the owner of this character");
            }
        }
        return ResponseEntity.ok(character.get());
    }

    private ResponseEntity<?> updateSheet(Authentication authentication, Long id, CharacterSheetInPostDTO dto){
        Optional<User> userOpt = utilsCalls.getUserFromUsername(authentication);
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
}

