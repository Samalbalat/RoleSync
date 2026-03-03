package com.rolesync.rolesync.controller;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.core.Authentication;
import com.querydsl.core.types.dsl.Expressions;
import com.querydsl.core.types.dsl.BooleanExpression;
import com.rolesync.rolesync.dto.campaigncontroller.CampaignGetByIdOutDTO;
import com.rolesync.rolesync.dto.campaigncontroller.CampaignPostInDTO;
import com.rolesync.rolesync.dto.campaigncontroller.CampaignPutInDTO;
import com.rolesync.rolesync.dto.campaigncontroller.OwnerProfileDTO;
import com.rolesync.rolesync.model.Campaign;
import com.rolesync.rolesync.model.CampaignStatus;
import com.rolesync.rolesync.model.Profile;
import com.rolesync.rolesync.model.ProfileType;
import com.rolesync.rolesync.model.QCampaign;
import com.rolesync.rolesync.repository.CampaignRepository;
import com.rolesync.rolesync.repository.ProfileRepository;
import com.rolesync.rolesync.utils.UtilsCalls;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.PathVariable;

@RestController
@RequestMapping("/campaigns")
public class CampaignController {

    private final CampaignRepository campaignRepository;
    private final ProfileRepository profileRepository;
    private final UtilsCalls utilsCalls;
    private static final QCampaign Q = QCampaign.campaign;

    public CampaignController(
            CampaignRepository campaignRepository,
            UtilsCalls utilsCalls,
            ProfileRepository profileRepository) {
        this.campaignRepository = campaignRepository;
        this.utilsCalls = utilsCalls;
        this.profileRepository = profileRepository;
    }

    // ---------- FILTERED GET ----------

    @GetMapping
    public ResponseEntity<List<Campaign>> getCampaigns(
            @RequestParam ProfileType type,
            @RequestParam(required = false) String system,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String language,
            @RequestParam(required = false) String timeZone,
            @RequestParam(required = false) String dayWeek,
            @RequestParam(required = false) String communication,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String page,
            @RequestParam(required = false) String themes,
            @RequestParam(required = false) String duration) {
        BooleanExpression predicate = Q.campaignType.eq(type);

        if (system != null && !system.isBlank()) {
            predicate = predicate.and(Q.system.containsIgnoreCase(system));
        }

        if (location != null && !location.isBlank()) {
            predicate = predicate.and(Q.location.containsIgnoreCase(location));
        }

        if (language != null && !language.isBlank()) {
            predicate = predicate.and(Q.language.containsIgnoreCase(language));
        }

        if (timeZone != null && !timeZone.isBlank()) {
            predicate = predicate.and(Q.timeZone.containsIgnoreCase(timeZone));
        }

        if (dayWeek != null && !dayWeek.isBlank()) {
            predicate = predicate.and(Q.dayWeek.containsIgnoreCase(dayWeek));
        }

        if (communication != null && !communication.isBlank()) {
            predicate = predicate.and(Q.communication.containsIgnoreCase(communication));
        }

        if (status != null && !status.isBlank()) {
            predicate = predicate.and(Q.status.eq(CampaignStatus.valueOf(status.toUpperCase())));
        }
        if (themes != null && !themes.isBlank()) {
            predicate = predicate.and(
                    Expressions.booleanTemplate("CAST({0} AS text) ilike {1}", Q.themes, "%" + themes + "%"));
        }
        if (duration != null && !duration.isBlank()) {
            predicate = predicate.and(Q.duration.containsIgnoreCase(duration));
        }

        if (search != null && !search.isBlank()) {
            search = search.trim();
            String[] keywords = search.split(" ");
            BooleanExpression searchPredicate = Q.name.containsIgnoreCase(keywords[0]);
            for (int i = 1; i < keywords.length; i++) {
                searchPredicate = searchPredicate.and(Q.name.containsIgnoreCase(keywords[i]));
            }
            predicate = predicate.and(searchPredicate);
        }

        return ResponseEntity.ok(
                (List<Campaign>) campaignRepository.findAll(predicate));
    }

    // ---------- DETAIL ----------
    @GetMapping("/{id}")
    public ResponseEntity<CampaignGetByIdOutDTO> getCampaign(
            Authentication authentication,
            @PathVariable Long id,
            @RequestHeader("X-Profile-Name") String profileName) {
        if (id == null) {
            return ResponseEntity.badRequest().build();
        }
        Campaign campaign = campaignRepository.findById(id).get();
        if (campaign != null) {
            CampaignGetByIdOutDTO response = new CampaignGetByIdOutDTO();
            formFindByIdResponse(campaign, response);
            response.setUserRelation(utilsCalls.getProfileRelationToCampaign(profileName, campaign));
            return ResponseEntity.ok(response);
        }
        return ResponseEntity.notFound().build();
    }

    // ---------- POST ----------

    @PostMapping
    public ResponseEntity<String> createCampaign(
            Authentication authentication,
            @RequestBody CampaignPostInDTO dto,
            @RequestHeader("X-Profile-Name") String profileName) {
        Campaign campaign = new Campaign();
        Profile activeProfile = profileRepository.findByProfilename(profileName)
                .orElseThrow(() -> new IllegalStateException("Active profile not found"));
        campaign.setOwnerName(activeProfile.getProfilename());
        createCampaignFromPostInDto(dto, campaign);
        campaignRepository.save(campaign);
        return ResponseEntity.ok("Campaign created");
    }

    // ---------- PUT ----------

    @PutMapping("/{id}")
    public ResponseEntity<String> updateCampaign(
            Authentication authentication,
            @PathVariable Long id,
            @RequestBody CampaignPutInDTO dto,
            @RequestHeader("X-Profile-Name") String profileName) {
        Profile activeProfile = profileRepository.findByProfilename(profileName)
                .orElseThrow(() -> new IllegalStateException("Active profile not found"));
        if (id == null) {
            return ResponseEntity.badRequest().build();
        }
        Optional<Campaign> campaignOpt = campaignRepository.findById(id);
        if (campaignOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Campaign campaign = campaignOpt.get();
        if (!campaign.getOwnerName().equals(activeProfile.getProfilename())) {
            return ResponseEntity.status(403).body("User is not the campaign owner");
        }

        applyUpdates(campaign, dto);
        campaignRepository.save(campaign);

        return ResponseEntity.ok("Campaign updated");
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteCampaign(
            Authentication authentication,
            @PathVariable Long id,
            @RequestHeader("X-Profile-Name") String profileName) {
        Optional<Campaign> campaignOpt = campaignRepository.findById(id);
        if (campaignOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Campaign campaign = campaignOpt.get();

        Profile activeProfile = profileRepository.findByProfilename(profileName)
                .orElseThrow(() -> new IllegalStateException("Active profile not found"));

        if (!campaign.getOwnerName().equals(activeProfile.getProfilename())) {
            return ResponseEntity.status(403).body("User is not the campaign owner");
        }

        campaignRepository.delete(campaign);
        return ResponseEntity.ok("Campaign deleted");
    }

    // ---------- Helpers ----------

    private void applyUpdates(Campaign campaign, CampaignPutInDTO dto) {
        campaign.setName(dto.getName());
        campaign.setImage(dto.getImage());
        campaign.setDescription(dto.getDescription());
        campaign.setSystem(dto.getSystem());
        campaign.setThemes(Arrays.asList(dto.getThemes()));
        campaign.setMaxPlayers(dto.getMaxPlayers());
        campaign.setCommunication(dto.getCommunication());
        campaign.setLanguage(dto.getLanguage());
        campaign.setDayWeek(dto.getDayWeek());
        campaign.setFrequency(dto.getFrequency());
        campaign.setDuration(dto.getDuration());
        campaign.setLocation(dto.getLocation());
        campaign.setTimeZone(dto.getTimeZone());
        campaign.setStatus(CampaignStatus.valueOf(dto.getStatus().toUpperCase()));
    }

    private void formFindByIdResponse(Campaign campaign, CampaignGetByIdOutDTO dto) {
        dto.setId(campaign.getId().toString());
        dto.setName(campaign.getName());
        dto.setDescription(campaign.getDescription());
        dto.setSystem(campaign.getSystem());
        dto.setThemes(campaign.getThemes());
        dto.setLanguage(campaign.getLanguage());
        dto.setTimeZone(campaign.getTimeZone());
        dto.setDayWeek(campaign.getDayWeek());
        dto.setDuration(campaign.getDuration());
        dto.setLocation(campaign.getLocation());
        dto.setFrequency(campaign.getFrequency());
        dto.setCommunication(campaign.getCommunication());
        dto.setImage(campaign.getImage());
        dto.setStatus(campaign.getStatus().name());
        dto.setType(campaign.getCampaignType().name());
        dto.setCurrentPlayers(campaign.getMembers() != null ? Arrays.asList(campaign.getMembers()).size() : 0);
        dto.setMaxPlayers(campaign.getMaxPlayers());

        OwnerProfileDTO owner = new OwnerProfileDTO();
        profileRepository.findByProfilename(campaign.getOwnerName()).ifPresent(p -> {
            owner.setProfileName(p.getProfilename());
            owner.setProfileImage(p.getImage());
        });

        dto.setOwner(owner);
    }

    private void createCampaignFromPostInDto(CampaignPostInDTO dto, Campaign campaign) {
        campaign.setName(dto.getName());
        campaign.setImage(dto.getImage());
        campaign.setDescription(dto.getDescription());
        campaign.setSystem(dto.getSystem());
        campaign.setThemes(Arrays.asList(dto.getThemes()));
        campaign.setMaxPlayers(dto.getMaxPlayers());
        campaign.setCommunication(dto.getCommunication());
        campaign.setLanguage(dto.getLanguage());
        campaign.setDayWeek(dto.getDayWeek());
        campaign.setFrequency(dto.getFrequency());
        campaign.setDuration(dto.getDuration());
        campaign.setLocation(dto.getLocation());
        campaign.setTimeZone(dto.getTimeZone());
        campaign.setMembers(List.of());
        campaign.setCampaignType(ProfileType.valueOf(dto.getType()));
        campaign.setStatus(CampaignStatus.OPEN);
    }
}
