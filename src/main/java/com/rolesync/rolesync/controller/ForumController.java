package com.rolesync.rolesync.controller;

import java.time.Instant;
import java.util.HashSet;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.security.core.Authentication;
import com.rolesync.rolesync.dto.forumcontroller.GetCampaignPostsOutMapper;
import com.rolesync.rolesync.dto.forumcontroller.GetCampaignPostsOutResponseDTO;
import com.rolesync.rolesync.dto.forumcontroller.GetCampaignPostsOutResponseItemDTO;
import com.rolesync.rolesync.dto.forumcontroller.PostCampaignPostsIn;
import com.rolesync.rolesync.model.Campaign;
import com.rolesync.rolesync.model.CharacterSheet;
import com.rolesync.rolesync.model.Post;
import com.rolesync.rolesync.model.PostType;
import com.rolesync.rolesync.model.Profile;
import com.rolesync.rolesync.repository.CampaignRepository;
import com.rolesync.rolesync.repository.CampaignRequestRepository;
import com.rolesync.rolesync.repository.CharacterSheetRepository;
import com.rolesync.rolesync.repository.PostRepository;
import com.rolesync.rolesync.repository.ProfileRepository;
import com.rolesync.rolesync.utils.UtilsCalls;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;


@RestController
public class ForumController {

    private final CampaignRepository campaignRepository;
    private final UtilsCalls utilsCalls;
    private final PostRepository postRepository;
    private final CharacterSheetRepository characterRepository;
    private final ProfileRepository profileRepository;

    public ForumController(
            CampaignRepository campaignRepository,
            UtilsCalls utilsCalls,
            ProfileRepository profileRepository,
            CampaignRequestRepository campaignRequestRepository,
            CharacterSheetRepository characterSheetRepository,
            PostRepository postRepository,CharacterSheetRepository characterRepository) {
        this.campaignRepository = campaignRepository;
        this.utilsCalls = utilsCalls;
        this.postRepository = postRepository;
        this.profileRepository = profileRepository;
        this.characterRepository = characterRepository;
    }

    @GetMapping("campaigns/{id}/posts")
    public ResponseEntity<GetCampaignPostsOutResponseDTO> getCampaignPosts(
            @PathVariable Long id,
            Authentication authentication,
            @RequestHeader("X-Profile-Name") String profileName,
            @RequestParam(required = false) Integer limit,
            @RequestParam(required = false) Instant cursor) {
                //Security checks
                if(!utilsCalls.checkAuthAndProfile(authentication, profileName)) {
                    return ResponseEntity.status(403).build();
                }
                Campaign campaign = campaignRepository.findById(id).orElse(null);
                String relation = utilsCalls.getProfileRelationToCampaign(profileName, campaign);
                if("NONE".equals(relation) || "PENDING".equals(relation)) {
                    return ResponseEntity.status(403).build();
                }

                // Fetch posts with pagination
                int effectiveLimit = Math.min((limit != null && limit > 0) ? limit : 20, 100); // Default to 20 if not provided or invalid
                List<Post> page = postRepository.findCampaignPosts(id, cursor, effectiveLimit);

                // Prepare response additional info for pagination
                Instant nextCursor = null;
                Boolean hasMore = false;
                if (page.size() > effectiveLimit) {
                    nextCursor = page.get(effectiveLimit - 1).getCreatedAt();
                    hasMore = true;
                    page = page.subList(0, effectiveLimit);
                }

                List<GetCampaignPostsOutResponseItemDTO> dtoList = page.stream().map(GetCampaignPostsOutMapper::toDTO).toList();
                return ResponseEntity.ok().body(new GetCampaignPostsOutResponseDTO(dtoList, nextCursor, hasMore));
            }
        
    @PostMapping("campaigns/{id}/posts")
    public ResponseEntity<?> postMethodName(
            @PathVariable Long id,
            @RequestHeader("X-Profile-Name") String profileName,
            Authentication authentication,
            @RequestBody PostCampaignPostsIn request) {
                //Security checks
                Profile profile = profileRepository.findByProfilename(profileName).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
                if(!utilsCalls.checkAuthAndProfile(authentication, profileName)) {
                    return ResponseEntity.status(403).build();
                }
                Campaign campaign = campaignRepository.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
                String relation = utilsCalls.getProfileRelationToCampaign(profileName, campaign);
                if("NONE".equals(relation) || "PENDING".equals(relation)) {
                    return ResponseEntity.status(403).build();
                }
                CharacterSheet character = characterRepository.findById(request.getAuthorCharacterId()).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
                // Ensure character belongs to profile
                if (!character.getOwner().getId().equals(profile.getId())) {
                    return ResponseEntity.status(403).build();
                }
                Post post = new Post();
                createPostFromRequest(request, post, profile, character, campaign, relation);
                return ResponseEntity.ok().build();
    }

    private Post createPostFromRequest(PostCampaignPostsIn request, Post post, Profile profile, CharacterSheet character, Campaign campaign, String relation) {
        post.setType(PostType.valueOf(request.getType()));
        post.setContent(request.getContent());

        post.setAuthorProfileId(profile.getId());
        post.setAuthorCharacterId(character.getId());

        post.setAuthorCharacterName(character.getName());
        post.setAuthorCharacterImage(character.getImage());

        post.setCampaign(campaign);

        post.setParentPost(
            request.getParentPostId() != null
                ? postRepository.findById(request.getParentPostId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND))
                : null
        );

        post.setCreatedAt(Instant.now());

        post.setOoc(Boolean.TRUE.equals(request.getIsOoc()));
        post.setDm("DM".equals(relation)); // depends on your relation model

        post.setMediaUrls(request.getMediaUrls() != null ? request.getMediaUrls() : List.of());

        post.setEdited(false);
        post.setUpdatedAt(null);

        post.setPinned(false);
        post.setLocked(false);

        // Visibility (optional)
        if (request.getVisibleToCharacterIds() != null && !request.getVisibleToCharacterIds().isEmpty()) {
            List<CharacterSheet> visibleCharacters =
                characterRepository.findAllById(request.getVisibleToCharacterIds());
            post.setVisibleToCharacterIds((new HashSet<>(visibleCharacters.stream().map(CharacterSheet::getId).toList())));
        }
        postRepository.save(post);
        return post;
    }
    
    }
