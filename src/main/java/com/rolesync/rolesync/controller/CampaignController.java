package com.rolesync.rolesync.controller;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.core.Authentication;
import com.querydsl.core.types.dsl.BooleanExpression;
import com.rolesync.rolesync.dto.campaigncontroller.CampaignFilter;
import com.rolesync.rolesync.dto.campaigncontroller.CampaignGetByFilterDTO;
import com.rolesync.rolesync.dto.campaigncontroller.CampaignGetByIdOutDTO;
import com.rolesync.rolesync.dto.campaigncontroller.CampaignGetMeOutDTO;
import com.rolesync.rolesync.dto.campaigncontroller.CampaignGetMeOutItemDTO;
import com.rolesync.rolesync.dto.campaigncontroller.CampaignParticipantsDTO;
import com.rolesync.rolesync.dto.campaigncontroller.CampaignParticipantsItemDTO;
import com.rolesync.rolesync.dto.campaigncontroller.CampaignPostInDTO;
import com.rolesync.rolesync.dto.campaigncontroller.CampaignPutInDTO;
import com.rolesync.rolesync.dto.campaigncontroller.CampaignRequestInDTO;
import com.rolesync.rolesync.dto.campaigncontroller.CampaignRequestPutInDTO;
import com.rolesync.rolesync.dto.campaigncontroller.CampaignRequestsByIdOutDTO;
import com.rolesync.rolesync.dto.campaigncontroller.OwnerProfileDTO;
import com.rolesync.rolesync.dto.campaigncontroller.mappers.CampaignMapper;
import com.rolesync.rolesync.dto.campaigncontroller.predicates.CampaignPredicateBuilder;
import com.rolesync.rolesync.model.Campaign;
import com.rolesync.rolesync.model.CampaignRequest;
import com.rolesync.rolesync.model.CampaignRequestStatus;
import com.rolesync.rolesync.model.CampaignStatus;
import com.rolesync.rolesync.model.Profile;
import com.rolesync.rolesync.model.ProfileType;
import com.rolesync.rolesync.repository.CampaignRepository;
import com.rolesync.rolesync.repository.CampaignRequestRepository;
import com.rolesync.rolesync.repository.CharacterSheetRepository;
import com.rolesync.rolesync.repository.ProfileRepository;
import com.rolesync.rolesync.utils.UtilsCalls;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.PathVariable;

@RestController
@RequestMapping("/campaigns")
public class CampaignController {

    private final CampaignRepository campaignRepository;
    private final ProfileRepository profileRepository;
    private final CampaignRequestRepository campaignRequestRepository;
    private final CharacterSheetRepository characterSheetRepository;
    private final UtilsCalls utilsCalls;

    public CampaignController(
            CampaignRepository campaignRepository,
            UtilsCalls utilsCalls,
            ProfileRepository profileRepository,
            CampaignRequestRepository campaignRequestRepository,
            CharacterSheetRepository characterSheetRepository) {
        this.campaignRepository = campaignRepository;
        this.utilsCalls = utilsCalls;
        this.profileRepository = profileRepository;
        this.campaignRequestRepository = campaignRequestRepository;
        this.characterSheetRepository = characterSheetRepository;
    }

    // ---------- FILTERED GET ----------

    @GetMapping
    public ResponseEntity<List<CampaignGetByFilterDTO>> getCampaigns(@ModelAttribute CampaignFilter filter) {
        CampaignPredicateBuilder predicateBuilder = new CampaignPredicateBuilder();
        
        BooleanExpression predicate = predicateBuilder.build(filter);

        List<Campaign> campaigns = (List<Campaign>) campaignRepository.findAll(predicate);
        List<CampaignGetByFilterDTO> response = campaigns.stream().map(CampaignMapper::toGetByFilterDTO).toList();
        return ResponseEntity.ok(response);
    }

    // ---------- MINE GET ----------
    @GetMapping("/me")
    public ResponseEntity<CampaignGetMeOutDTO> getMyCampaigns(
            @RequestHeader("X-Profile-Name") String profileName) {

        CampaignGetMeOutDTO response = new CampaignGetMeOutDTO();

        // AS MASTER
        List<CampaignGetMeOutItemDTO> asMaster =
                campaignRepository.findByOwnerName(profileName).stream()
                        .filter(c -> c.getStatus() != CampaignStatus.DELETED)
                        .map(c -> {
                            CampaignGetMeOutItemDTO item = new CampaignGetMeOutItemDTO();
                            item.setId(c.getId());
                            item.setName(c.getName());
                            item.setImage(c.getImage());
                            item.setSystem(c.getSystem());
                            item.setStatus(c.getStatus().name());
                            Integer pendingRequests = Integer.valueOf(campaignRequestRepository.countPendingRequestsByCampaignId(c.getId()).toString());
                            item.setPendingRequests(pendingRequests);

                            return item;
                        }).toList();

        response.setAsMaster(asMaster);

        // AS PLAYER
        List<CampaignGetMeOutItemDTO> asPlayer =
                campaignRepository.findByMember(profileName).stream()
                        .filter(c -> c.getStatus() != CampaignStatus.DELETED)
                        .map(c -> {
                            CampaignGetMeOutItemDTO item = new CampaignGetMeOutItemDTO();
                            item.setId(c.getId());
                            item.setName(c.getName());
                            item.setImage(c.getImage());
                            item.setSystem(c.getSystem());
                            item.setStatus(c.getStatus().name());
                            item.setOwnerName(c.getOwnerName());
                            return item;
                        }).toList();

        response.setAsPlayer(asPlayer);

        return ResponseEntity.ok(response);
    }

    // ---------- GET REQUESTS ----------
    @GetMapping("/{id}/requests")
    public ResponseEntity<?> getCampaignRequests(
            @RequestHeader("X-Profile-Name") String profileName,
            Authentication authentication,
            @PathVariable Long id) {
        boolean isAuthorized = utilsCalls.checkAuthAndProfile(authentication, profileName);
        if (!isAuthorized) {
            return ResponseEntity.status(403).body("User is not authorized");
        }
        Optional<Campaign> campaignOpt = campaignRepository.findById(id);
        if (campaignOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Campaign campaign = campaignOpt.get();
        if (!campaign.getOwnerName().equals(profileName)) {
            return ResponseEntity.status(403).body("User is not authorized");
        }
        List<CampaignRequest> requests = campaignRequestRepository.findAllByCampaignAndStatus(campaign,
                CampaignRequestStatus.PENDING);
        List<CampaignRequestsByIdOutDTO> response = requests.stream().map(r -> {
            CampaignRequestsByIdOutDTO dto = new CampaignRequestsByIdOutDTO();
            dto.setId(r.getId());
            dto.setMessage(r.getMessage());
            Profile p = r.getProfile();
            if (p != null) {
                dto.setProfileImage(p.getImage());
                dto.setProfileName(p.getProfilename());
            }
            return dto;
        }).toList();
        return ResponseEntity.ok(response);
    }

    // ---------- GET PARTICIPANTS ----------
    @GetMapping("/{id}/participants")
    public ResponseEntity<?> getCampaignParticipants(
            @RequestHeader("X-Profile-Name") String profileName,
            Authentication authentication,
            @PathVariable Long id) {
        boolean isAuthorized = utilsCalls.checkAuthAndProfile(authentication, profileName);
        if (!isAuthorized) {
            return ResponseEntity.status(403).body("User is not authorized");
        }
        Optional<Campaign> campaignOpt = campaignRepository.findById(id);
        if (campaignOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Campaign campaign = campaignOpt.get();
        if (!campaign.getOwnerName().equals(profileName)
                && (campaign.getMembers() == null || !campaign.getMembers().contains(profileName))) {
            return ResponseEntity.status(403).body("User is not authorized");
        }
        List<CampaignParticipantsDTO> participants = campaign.getMembers() != null
                ? campaign.getMembers().stream().map(m -> {
                    CampaignParticipantsDTO dto = new CampaignParticipantsDTO();
                    Profile p = profileRepository.findByProfilename(m).orElse(null);
                    if (p != null) {
                        CampaignParticipantsItemDTO item = new CampaignParticipantsItemDTO();
                        item.setProfileId(p.getId());
                        item.setProfileName(p.getProfilename());
                        item.setProfileImage(p.getImage());
                        dto.setParticipants(item);
                    }
                    return dto;
                }).toList()
                : List.of();

        return ResponseEntity.ok(participants);
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
        if (campaign != null && campaign.getStatus() != CampaignStatus.DELETED) {
            CampaignGetByIdOutDTO response = new CampaignGetByIdOutDTO();
            formFindByIdResponse(campaign, response);
            String relation = utilsCalls.getProfileRelationToCampaign(profileName, campaign);
            response.setUserRelation(relation);
            if (relation.equals("MEMBER")) {
                profileRepository.findByProfilename(profileName).ifPresent(profile -> {
                    characterSheetRepository.findByCampaignAndOwnerAndIsTemplate(campaign, profile, false).stream()
                            .findFirst().ifPresent(sheet -> {
                                response.setCharacterId(sheet.getId());
                                response.setCharacterName(sheet.getName());
                                response.setCharacterImage(sheet.getImage());
                            });
                });
            }
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
        Optional<Profile> activeProfileOpt = profileRepository.findByProfilename(profileName);
        if(activeProfileOpt.isEmpty()) {
            return ResponseEntity.status(403).body("User is not authorized");
        }
        campaign.setOwnerName(activeProfileOpt.get().getProfilename());
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
        boolean isAuthorized = utilsCalls.checkAuthAndProfile(authentication, profileName);
        if (!isAuthorized) {
            return ResponseEntity.status(403).body("User is not authorized to update this campaign");
        }
        Optional<Campaign> campaignOpt = campaignRepository.findById(id);
        if (campaignOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Campaign campaign = campaignOpt.get();
        applyUpdates(campaign, dto);
        campaignRepository.save(campaign);

        return ResponseEntity.ok("Campaign updated");
    }

    // ---------- CHANGE STATUS CAMPAIGN ----------
    @PutMapping("/{id}/status")
    public ResponseEntity<String> changeCampaignStatus(
            Authentication authentication,
            @PathVariable Long id,
            @RequestBody CampaignPutInDTO dto,
            @RequestHeader("X-Profile-Name") String profileName) {
        boolean isAuthorized = utilsCalls.checkAuthAndProfile(authentication, profileName);
        if (!isAuthorized) {
            return ResponseEntity.status(403).body("User is not authorized to update this campaign");
        }
        Optional<Campaign> campaignOpt = campaignRepository.findById(id);
        if (campaignOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Campaign campaign = campaignOpt.get();
        campaign.setStatus(CampaignStatus.valueOf(dto.getStatus().toUpperCase()));
        campaignRepository.save(campaign);

        return ResponseEntity.ok("Campaign updated");
    }

    // ---------- ACCEPT REJECT REQUEST----------
    @PutMapping("/{campaignId}/requests")
    public ResponseEntity<?> updateRequest(
            Authentication authentication,
            @PathVariable Long campaignId,
            @RequestBody CampaignRequestPutInDTO dto,
            @RequestHeader("X-Profile-Name") String profileName) {
        Optional<Campaign> campaignOpt = campaignRepository.findById(campaignId);
        boolean isAuthorized = utilsCalls.checkAuthAndProfile(authentication, profileName);
        Profile profile = profileRepository.findByProfilename(dto.getProfileName()).orElse(null);
        ResponseEntity<?> viabilityCheck = checkChangeRequestStatusViability(isAuthorized, campaignOpt, profile, profileName);
        if (viabilityCheck != null) {
            return viabilityCheck;
        }
        Campaign campaign = campaignOpt.get();
        List<CampaignRequest> requestOpt = campaignRequestRepository.findAllByCampaignAndProfile(campaign, profile);
        CampaignRequest pendingRequest = requestOpt.stream().filter(r -> r.getStatus() == CampaignRequestStatus.PENDING).findFirst().orElse(null);
        if (requestOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        } else if (dto.getStatus().equalsIgnoreCase("ACCEPT") && pendingRequest != null) {
            List<String> members = campaign.getMembers();
            if (members == null) {
                members = List.of(dto.getProfileName());
            } else if (!members.contains(dto.getProfileName())) {
                members.add(dto.getProfileName());
            }
            campaign.setMembers(members);
            campaignRepository.save(campaign);
        }
        pendingRequest.setStatus(CampaignRequestStatus.valueOf(dto.getStatus().toUpperCase()));
        campaignRequestRepository.save(pendingRequest);
        return ResponseEntity.ok("Campaign updated");
    }

    private ResponseEntity<?> checkChangeRequestStatusViability(boolean isAuthorized, Optional<Campaign> campaignOpt,
            Profile profile, String profileName) {
        if (!isAuthorized || !campaignOpt.get().getOwnerName().equals(profileName)) {
            return ResponseEntity.status(403).body("User is not authorized to update this request");
        }        if (profile == null) {
            return ResponseEntity.badRequest().body("Profile not found");
        }
        if (campaignOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        return null;
    }

    @PutMapping("/{id}/kick")
    public ResponseEntity<?> kickMember(
            Authentication authentication,
            @PathVariable Long id,
            @RequestBody CampaignRequestPutInDTO dto,
            @RequestHeader("X-Profile-Name") String profileName) {
        boolean isAuthorized = utilsCalls.checkAuthAndProfile(authentication, profileName);
        if (!isAuthorized) {
            return ResponseEntity.status(403).body("User is not authorized to update this request");
        }
        Optional<Campaign> campaignOpt = campaignRepository.findById(id);
        if (campaignOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        } else if (!campaignOpt.get().getOwnerName().equals(profileName)) {
            return ResponseEntity.status(403).body("User is not authorized to kick members from this campaign");
        }
        Campaign campaign = campaignOpt.get();
        List<String> members = campaign.getMembers();
        if (members != null && members.contains(dto.getProfileName())) {
            members.remove(dto.getProfileName());
            campaign.setMembers(members);
            campaignRepository.save(campaign);
        }
        CampaignRequest request = campaignRequestRepository.findLastRequestByProfileAndCampaign(
            profileRepository.findByProfilename(dto.getProfileName()).orElse(null).getId(),
            campaign.getId()
        ).orElse(null);
        if(request != null) {
            request.setStatus(CampaignRequestStatus.KICKED);
            request.setMessage(request.getMessage() + " (Kicked from campaign)");
            campaignRequestRepository.save(request);
        }
        return ResponseEntity.ok("Member kicked");
    }

    @PutMapping("/{id}/block")
    public ResponseEntity<?> blockMember(
            Authentication authentication,
            @PathVariable Long id,
            @RequestBody CampaignRequestPutInDTO dto,
            @RequestHeader("X-Profile-Name") String profileName) {
        boolean isAuthorized = utilsCalls.checkAuthAndProfile(authentication, profileName);
        if (!isAuthorized) {
            return ResponseEntity.status(403).body("User is not authorized to update this request");
        }
        Optional<Campaign> campaignOpt = campaignRepository.findById(id);
        if (campaignOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        } else if (!campaignOpt.get().getOwnerName().equals(profileName)) {
            return ResponseEntity.status(403).body("User is not authorized to block members from this campaign");
        }
        Campaign campaign = campaignOpt.get();
        List<String> members = campaign.getMembers();
        if (members != null && members.contains(dto.getProfileName())) {
            members.remove(dto.getProfileName());
            campaign.setMembers(members);
            campaignRepository.save(campaign);
        }
        CampaignRequest request = campaignRequestRepository.findLastRequestByProfileAndCampaign(
            profileRepository.findByProfilename(dto.getProfileName()).orElse(null).getId(),
            campaign.getId()
        ).orElse(null);
        if(request != null) {
            request.setStatus(CampaignRequestStatus.BLOCKED);
            request.setMessage(request.getMessage() + " (Blocked from campaign)");
            campaignRequestRepository.save(request);
        }
        return ResponseEntity.ok("Member blocked");
    }

    // ---------- GREY OUT ----------
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteCampaign(
            Authentication authentication,
            @PathVariable Long id,
            @RequestHeader("X-Profile-Name") String profileName) {
        boolean isAuthorized = utilsCalls.checkAuthAndProfile(authentication, profileName);
        if (!isAuthorized) {
            return ResponseEntity.status(403).body("User is not authorized to delete this campaign");
        }
        Optional<Campaign> campaignOpt = campaignRepository.findById(id);
        if (campaignOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Campaign campaign = campaignOpt.get();
        campaign.setStatus(CampaignStatus.DELETED);
        campaignRepository.save(campaign);
        return ResponseEntity.ok("Campaign deleted");
    }


    // ---------- APPLY TO CAMPAIGN ----------
    @PostMapping("/{id}/join")
    public ResponseEntity<String> applyToCampaign(
            Authentication authentication,
            @PathVariable Long id,
            @RequestBody CampaignRequestInDTO dto,
            @RequestHeader("X-Profile-Name") String profileName) {
        boolean isAuthorized = utilsCalls.checkAuthAndProfile(authentication, profileName);
        if (!isAuthorized) {
            return ResponseEntity.status(403).body("User is not properly authorized to join this campaign");
        }
        CampaignRequest lastRequest = campaignRequestRepository.findLastRequestByProfileAndCampaign(
            profileRepository.findByProfilename(profileName).orElse(null).getId(),
            id
        ).orElse(null);
        if(lastRequest != null && lastRequest.getStatus() == CampaignRequestStatus.BLOCKED) {
            return ResponseEntity.status(403).body("User is blocked from joining this campaign");
        }
        Optional<Campaign> campaignOpt = campaignRepository.findById(id);
        if(campaignOpt.get().getMembers() != null && campaignOpt.get().getMembers().contains(profileName) || campaignOpt.get().getOwnerName().equals(profileName)) {
            return ResponseEntity.badRequest().body("User is already a member/owner of this campaign");
        }
        ResponseEntity<String> viabilityCheck = checkApplyViability(campaignOpt, profileName);
        if (viabilityCheck != null) {
            return viabilityCheck;
        }
        CampaignRequest request = new CampaignRequest();
        request.setCampaign(campaignOpt.get());
        request.setProfile(profileRepository.findByProfilename(profileName).orElse(null));
        request.setStatus(CampaignRequestStatus.PENDING);
        request.setMessage(dto.getMessage());

        campaignRequestRepository.save(request);

        return ResponseEntity.ok("Campaign request submitted");
    }

    // ---------- Helpers ----------

    private ResponseEntity<String> checkApplyViability(Optional<Campaign> campaignOpt, String profileName) {
        if (campaignOpt.isEmpty() || campaignOpt.get().getStatus() == CampaignStatus.DELETED) {
            return ResponseEntity.notFound().build();
        }
        Optional<CampaignRequest> existingRequest = campaignRequestRepository.findAll().stream().filter(r -> r.getCampaign().getId().equals(campaignOpt.get().getId()) && r.getProfile().getProfilename().equals(profileName)).findFirst();
        if(existingRequest.isPresent() && existingRequest.get().getStatus() == CampaignRequestStatus.PENDING) {
                return ResponseEntity.badRequest().body("There is already a pending request for this user in this campaign");
        }
        return null;
    }

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
