package com.rolesync.rolesync.controller;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;
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
import com.rolesync.rolesync.dto.campaigncontroller.predicates.CampaignPredicateBuilder;
import com.rolesync.rolesync.model.Campaign;
import com.rolesync.rolesync.model.CampaignRequest;
import com.rolesync.rolesync.model.CampaignRequestStatus;
import com.rolesync.rolesync.model.CampaignStatus;
import com.rolesync.rolesync.model.Profile;
import com.rolesync.rolesync.model.ProfileType;
import com.rolesync.rolesync.model.ReviewTargetType;
import com.rolesync.rolesync.repository.CampaignRepository;
import com.rolesync.rolesync.repository.CampaignRequestRepository;
import com.rolesync.rolesync.repository.CharacterSheetRepository;
import com.rolesync.rolesync.repository.ProfileRepository;
import com.rolesync.rolesync.services.ReviewService;
import com.rolesync.rolesync.utils.UtilsCalls;

import jakarta.transaction.Transactional;

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

    private static final String ERR_UNAUTHORIZED = "Usuario no está autorizado para realizar esta acción";
    private static final String ERR_UNAUTHORIZED_UPDATE_REQUEST = "Usuario no está autorizado para actualizar esta solicitud";

    private final CampaignRepository campaignRepository;
    private final ProfileRepository profileRepository;
    private final CampaignRequestRepository campaignRequestRepository;
    private final CharacterSheetRepository characterSheetRepository;
    private final UtilsCalls utilsCalls;
    private final ReviewService reviewService;

    public CampaignController(
            CampaignRepository campaignRepository,
            UtilsCalls utilsCalls,
            ProfileRepository profileRepository,
            CampaignRequestRepository campaignRequestRepository,
            CharacterSheetRepository characterSheetRepository,
            ReviewService reviewService) {
        this.campaignRepository = campaignRepository;
        this.utilsCalls = utilsCalls;
        this.profileRepository = profileRepository;
        this.campaignRequestRepository = campaignRequestRepository;
        this.characterSheetRepository = characterSheetRepository;
        this.reviewService = reviewService;
    }

    // ---------- FILTERED GET ----------

    @GetMapping
    public ResponseEntity<List<CampaignGetByFilterDTO>> getCampaigns(@ModelAttribute CampaignFilter filter) {
        CampaignPredicateBuilder predicateBuilder = new CampaignPredicateBuilder();

        BooleanExpression predicate = predicateBuilder.build(filter);

        List<Campaign> campaigns = (List<Campaign>) campaignRepository.findAll(predicate);
        List<CampaignGetByFilterDTO> response = new ArrayList<>();
        for (Campaign campaign : campaigns) {
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
                    campaign.getStatus() != null ? campaign.getStatus().name() : null);

            // Safe player count (no lazy loading involved)
            dto.setCurrentPlayers(
                    campaign.getMembers() != null ? campaign.getMembers().size() : 0);

            dto.setMaxPlayers(
                    campaign.getMaxPlayers() != null ? campaign.getMaxPlayers() : 0);
            dto.setReviewSummary(reviewService.getSummary(ReviewTargetType.CAMPAIGN, Long.valueOf(campaign.getId())));
            response.add(dto);
        }
        return ResponseEntity.ok(response);
    }

    // ---------- MINE GET ----------
    @GetMapping("/me")
    @Transactional
    public ResponseEntity<?> getMyCampaigns(Authentication authentication,
            @RequestHeader("X-Profile-Name") String profileName) {

        CampaignGetMeOutDTO response = new CampaignGetMeOutDTO();
        Optional<Profile> owner = profileRepository.findByProfilename(profileName);
        if (owner.isEmpty() || !utilsCalls.checkAuthAndProfile(authentication, profileName)) {
            return ResponseEntity.status(403).body(ERR_UNAUTHORIZED);
        }
        // AS MASTER
        List<CampaignGetMeOutItemDTO> asMaster = campaignRepository.findByOwner(owner.get()).stream()
                .filter(c -> c.getStatus() != CampaignStatus.DELETED)
                .map(c -> {
                    CampaignGetMeOutItemDTO item = new CampaignGetMeOutItemDTO();
                    item.setId(c.getId());
                    item.setName(c.getName());
                    item.setImage(c.getImage());
                    item.setSystem(c.getSystem());
                    item.setStatus(c.getStatus().name());
                    item.setReviewSummary(reviewService.getSummary(ReviewTargetType.CAMPAIGN, Long.valueOf(c.getId())));
                    Integer pendingRequests = Integer
                            .valueOf(campaignRequestRepository.countPendingRequestsByCampaignId(c.getId()).toString());
                    item.setPendingRequests(pendingRequests);

                    return item;
                }).toList();

        response.setAsMaster(asMaster);

        // AS PLAYER
        List<CampaignGetMeOutItemDTO> asPlayer = campaignRepository.findByMember(profileName).stream()
                .filter(c -> c.getStatus() != CampaignStatus.DELETED)
                .map(c -> {
                    CampaignGetMeOutItemDTO item = new CampaignGetMeOutItemDTO();
                    item.setId(c.getId());
                    item.setName(c.getName());
                    item.setImage(c.getImage());
                    item.setSystem(c.getSystem());
                    item.setStatus(c.getStatus().name());
                    item.setOwnerName(c.getOwner().getProfilename());
                    item.setReviewSummary(reviewService.getSummary(ReviewTargetType.CAMPAIGN, Long.valueOf(c.getId())));
                    return item;
                }).toList();

        response.setAsPlayer(asPlayer);

        return ResponseEntity.ok(response);
    }

    // ---------- GET REQUESTS ----------
    @GetMapping("/{id}/requests")
    @Transactional
    public ResponseEntity<?> getCampaignRequests(
            @RequestHeader("X-Profile-Name") String profileName,
            Authentication authentication,
            @PathVariable Long id) {
        Campaign campaign = getAuthorizedCampaignOrThrow(id, authentication, profileName);
        if (!campaign.getOwner().getProfilename().equals(profileName)) {
            return ResponseEntity.status(403).body(ERR_UNAUTHORIZED);
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
    @Transactional
    public ResponseEntity<?> getCampaignParticipants(
            @RequestHeader("X-Profile-Name") String profileName,
            Authentication authentication,
            @PathVariable Long id) {
        Campaign campaign = getAuthorizedCampaignOrThrow(id, authentication, profileName);
        if (!campaign.getOwner().getProfilename().equals(profileName)
                && (campaign.getMembers() == null || !campaign.getMembers().contains(profileName))) {
            return ResponseEntity.status(403).body(ERR_UNAUTHORIZED);
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
        Campaign campaign = getAuthorizedCampaignOrThrow(id, authentication, profileName);
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
        if (activeProfileOpt.isEmpty()) {
            return ResponseEntity.status(403).body(ERR_UNAUTHORIZED);
        }
        campaign.setOwner(activeProfileOpt.get());
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
        Campaign campaign = getAuthorizedCampaignOrThrow(id, authentication, profileName);
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
        Campaign campaign = getAuthorizedCampaignOrThrow(id, authentication, profileName);
        campaign.setStatus(CampaignStatus.valueOf(dto.getStatus().toUpperCase()));
        campaignRepository.save(campaign);

        return ResponseEntity.ok("Campaign updated");
    }

    // ---------- ACCEPT REJECT REQUEST----------
    @PutMapping("/{campaignId}/requests")
    @Transactional
    public ResponseEntity<?> updateRequest(
            Authentication authentication,
            @PathVariable Long campaignId,
            @RequestBody CampaignRequestPutInDTO dto,
            @RequestHeader("X-Profile-Name") String profileName) {
        Campaign campaign = getAuthorizedCampaignOrThrow(campaignId, authentication, profileName);
        Profile profileOfRequest = profileRepository.findByProfilename(dto.getProfileName()).orElse(null);
        ResponseEntity<?> viabilityCheck = checkChangeRequestStatusViability(campaign, profileOfRequest, profileName);
        if (viabilityCheck != null && dto.getStatus().equalsIgnoreCase("ACCEPT")) {
            return viabilityCheck;
        }
        List<CampaignRequest> requestOpt = campaignRequestRepository.findAllByCampaignAndProfile(campaign,
                profileOfRequest);
        CampaignRequest pendingRequest = requestOpt.stream().filter(r -> r.getStatus() == CampaignRequestStatus.PENDING)
                .findFirst().orElse(null);
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
        if (pendingRequest == null) {
            return ResponseEntity.badRequest().body("No pending request found for this profile in this campaign");
        }
        pendingRequest.setStatus(CampaignRequestStatus.valueOf(dto.getStatus().toUpperCase()));
        campaignRequestRepository.save(pendingRequest);
        return ResponseEntity.ok("Campaign updated");
    }

    private ResponseEntity<?> checkChangeRequestStatusViability(Campaign campaignOpt,
            Profile profile, String profileName) {
        if (!campaignOpt.getOwner().getProfilename().equals(profileName)) {
            return ResponseEntity.status(403).body(ERR_UNAUTHORIZED_UPDATE_REQUEST);
        }
        if (profile == null) {
            return ResponseEntity.badRequest().body("Profile of request not found");
        }
        String requestProfileName = profile.getProfilename();
        if (campaignOpt.getMembers() != null && campaignOpt.getMembers().contains(requestProfileName)) {
            return ResponseEntity.badRequest().body("User is already a member of this campaign");
        }
        if (campaignOpt.getMembers().size() == campaignOpt.getMaxPlayers()) {
            return ResponseEntity.badRequest().body("Campaign is already at max capacity");
        }
        return null;
    }

    @PutMapping("/{id}/kick")
    @Transactional
    public ResponseEntity<?> kickMember(
            Authentication authentication,
            @PathVariable Long id,
            @RequestBody CampaignRequestPutInDTO dto,
            @RequestHeader("X-Profile-Name") String profileName) {
        Campaign campaign = getAuthorizedCampaignOrThrow(id, authentication, profileName);
        if (!campaign.getOwner().getProfilename().equals(profileName)) {
            return ResponseEntity.status(403).body("User is not authorized to kick members from this campaign");
        }
        List<String> members = campaign.getMembers();
        if (members != null && members.contains(dto.getProfileName())) {
            members.remove(dto.getProfileName());
            campaign.setMembers(members);
            campaignRepository.save(campaign);
        }
        Profile profileToKick = profileRepository.findByProfilename(dto.getProfileName()).orElse(null);
        if (profileToKick == null) {
            return ResponseEntity.badRequest().body("Profile not found");
        }
        CampaignRequest request = campaignRequestRepository.findLastRequestByProfileAndCampaign(
                profileToKick.getId(),
                campaign.getId()).orElse(null);
        if (request != null) {
            request.setStatus(CampaignRequestStatus.KICKED);
            request.setMessage(request.getMessage() + " (Kicked from campaign)");
            campaignRequestRepository.save(request);
        }
        return ResponseEntity.ok("Member kicked");
    }

    @PutMapping("/{id}/block")
    @Transactional
    public ResponseEntity<?> blockMember(
            Authentication authentication,
            @PathVariable Long id,
            @RequestBody CampaignRequestPutInDTO dto,
            @RequestHeader("X-Profile-Name") String profileName) {
        Campaign campaign = getAuthorizedCampaignOrThrow(id, authentication, profileName);
        if (!campaign.getOwner().getProfilename().equals(profileName)) {
            return ResponseEntity.status(403).body("User is not authorized to block members from this campaign");
        }
        List<String> members = campaign.getMembers();
        if (members != null && members.contains(dto.getProfileName())) {
            members.remove(dto.getProfileName());
            campaign.setMembers(members);
            campaignRepository.save(campaign);
        }
        CampaignRequest request = campaignRequestRepository.findLastRequestByProfileAndCampaign(
                profileRepository.findByProfilename(dto.getProfileName()).orElse(null).getId(),
                campaign.getId()).orElse(null);
        if (request != null) {
            request.setStatus(CampaignRequestStatus.BLOCKED);
            request.setMessage(request.getMessage() + " (Blocked from campaign)");
            campaignRequestRepository.save(request);
        }
        return ResponseEntity.ok("Member blocked");
    }

    // ---------- GREY OUT ----------
    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<String> deleteCampaign(
            Authentication authentication,
            @PathVariable Long id,
            @RequestHeader("X-Profile-Name") String profileName) {
        Campaign campaign = getAuthorizedCampaignOrThrow(id, authentication, profileName);
        if (!campaign.getOwner().getProfilename().equals(profileName)) {
            return ResponseEntity.status(403).body("User is not authorized to delete this campaign");
        }
        campaign.setStatus(CampaignStatus.DELETED);
        campaignRepository.save(campaign);
        return ResponseEntity.ok("Campaign deleted");
    }

    // ---------- APPLY TO CAMPAIGN ----------
    @PostMapping("/{id}/join")
    @Transactional
    public ResponseEntity<String> applyToCampaign(
            Authentication authentication,
            @PathVariable Long id,
            @RequestBody CampaignRequestInDTO dto,
            @RequestHeader("X-Profile-Name") String profileName) {
        boolean isAuthorized = utilsCalls.checkAuthAndProfile(authentication, profileName);
        if (!isAuthorized) {
            return ResponseEntity.status(403).body("User is not properly authorized to join this campaign");
        }
        Optional<Campaign> campaignOpt = campaignRepository.findById(id);
        if (campaignOpt.get().getMembers() != null && campaignOpt.get().getMembers().contains(profileName)
                || campaignOpt.get().getOwner().getProfilename().equals(profileName)) {
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
        Campaign campaign = campaignOpt.get();
        if (campaign.getMembers() != null && campaign.getMembers().size() == campaign.getMaxPlayers()) {
            return ResponseEntity.badRequest().body("Campaign is already at max capacity");
        }
        Optional<CampaignRequest> lastRequest = campaignRequestRepository.findLastRequestByProfileAndCampaign(
                profileRepository.findByProfilename(profileName).orElse(null).getId(),
                campaign.getId());
        if (lastRequest.isPresent()) {
            return viabilityResponse(lastRequest.get().getStatus());
        } else {
            return null;
        }
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
        dto.setCurrentPlayers(campaign.getMembers() != null ? campaign.getMembers().size() : 0);

        dto.setMaxPlayers(campaign.getMaxPlayers());
        dto.setReviewSummary(reviewService.getSummary(ReviewTargetType.CAMPAIGN, Long.valueOf(campaign.getId())));

        OwnerProfileDTO owner = new OwnerProfileDTO();
        profileRepository.findByProfilename(campaign.getOwner().getProfilename()).ifPresent(p -> {
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

    private Campaign getAuthorizedCampaignOrThrow(Long id, Authentication auth, String profileName) {
        if (!utilsCalls.checkAuthAndProfile(auth, profileName)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "User is not authorized");
        }

        return campaignRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
    }

    private ResponseEntity<String> viabilityResponse(CampaignRequestStatus status) {
        switch (status) {
            case PENDING:
                return ResponseEntity.badRequest().body("Already pending request on the fly");
            case ACCEPT:
                return ResponseEntity.badRequest().body("Already a member of this campaign");
            case REJECT:
                return null;
            case KICKED:
                return null;
            case BLOCKED:
                return ResponseEntity.badRequest().body("User is blocked from this campaign");
            default:
                throw new IllegalArgumentException(
                        "Estado no soportado: " + status);
        }
    }
}
