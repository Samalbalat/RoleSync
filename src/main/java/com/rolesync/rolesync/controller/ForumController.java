package com.rolesync.rolesync.controller;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.security.core.Authentication;
import com.rolesync.rolesync.dto.forumcontroller.GetCampaignPostsOutDTOMapper;
import com.rolesync.rolesync.dto.forumcontroller.GetCampaignPostsOutDTO;
import com.rolesync.rolesync.dto.forumcontroller.GetCampaignPostsOutItemDTO;
import com.rolesync.rolesync.dto.forumcontroller.GetForumPostsOutDTO;
import com.rolesync.rolesync.dto.forumcontroller.GetForumPostsOutDTOMapper;
import com.rolesync.rolesync.dto.forumcontroller.GetForumPostsOutItemAuthorDTO;
import com.rolesync.rolesync.dto.forumcontroller.GetForumPostsOutItemDTO;
import com.rolesync.rolesync.dto.forumcontroller.GetForumPostsOutMetaDTO;
import com.rolesync.rolesync.dto.forumcontroller.PostCampaignPostsInDTO;
import com.rolesync.rolesync.dto.forumcontroller.PostForumPostsInDTO;
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
    public ResponseEntity<GetCampaignPostsOutDTO> getCampaignPosts(
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
                    nextCursor = page.get(effectiveLimit).getCreatedAt();
                    hasMore = true;
                    page = page.subList(0, effectiveLimit);
                }

                List<GetCampaignPostsOutItemDTO> dtoList = page.stream().map(GetCampaignPostsOutDTOMapper::toDTO).toList();
                return ResponseEntity.ok().body(new GetCampaignPostsOutDTO(dtoList, nextCursor, hasMore));
            }

    @GetMapping("posts/{id}/replies")
    public ResponseEntity<GetCampaignPostsOutDTO> getPostReplies(
            @PathVariable Long id,
            Authentication authentication,
            @RequestHeader("X-Profile-Name") String profileName,
            @RequestParam(required = false) Integer limit,
            @RequestParam(required = false) Instant cursor) {
                //Security checks
                if(!utilsCalls.checkAuthAndProfile(authentication, profileName)) {
                    return ResponseEntity.status(403).build();
                }
                Post parentPost = postRepository.findById(id).orElse(null);
                Campaign campaign = campaignRepository.findById(parentPost.getCampaign().getId()).orElse(null);
                String relation = utilsCalls.getProfileRelationToCampaign(profileName, campaign);
                if("NONE".equals(relation) || "PENDING".equals(relation)) {
                    return ResponseEntity.status(403).build();
                }

                // Fetch posts with pagination
                int effectiveLimit = Math.min((limit != null && limit > 0) ? limit : 20, 100); // Default to 20 if not provided or invalid
                List<Post> page = postRepository.findPostReplies(id, cursor, effectiveLimit);

                // Prepare response additional info for pagination
                Instant nextCursor = null;
                Boolean hasMore = false;
                if (page.size() > effectiveLimit) {
                    nextCursor = page.get(effectiveLimit).getCreatedAt();
                    hasMore = true;
                    page = page.subList(0, effectiveLimit);
                }

                List<GetCampaignPostsOutItemDTO> dtoList = page.stream().map(GetCampaignPostsOutDTOMapper::toDTO).toList();
                return ResponseEntity.ok().body(new GetCampaignPostsOutDTO(dtoList, nextCursor, hasMore));
            }
    
    @GetMapping("forum/posts")
    public ResponseEntity<GetForumPostsOutDTO> getForumPosts(
            Authentication authentication,
            @RequestHeader("X-Profile-Name") String profileName,
            @RequestParam(required = false) Integer limit,
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) String tags,
            @RequestParam(required = false) String orderBy) {
                //Security checks
                if(!utilsCalls.checkAuthAndProfile(authentication, profileName)) {
                    return ResponseEntity.status(403).build();
                }

                int effectiveLimit = Math.min((limit != null && limit > 0) ? limit : 20, 100); // Default to 20 if not provided or invalid
                int effectivePage = (page != null && page > 0) ? page : 1; // Default to 1 if not provided or invalid
                Integer totalItems = postRepository.countForumPostsByTags(tags != null ? Arrays.asList(tags.split(",")) : List.of()).intValue();
                Integer totalPages = (int) Math.ceil((double) totalItems / effectiveLimit);

                if (effectivePage > totalPages) {
                    return ResponseEntity.status(400).body(null); // Invalid page number
                }

                // Fetch posts with pagination and optional filtering by tags 
                List<Post> forumPosts = postRepository.findPostsByTags(tags != null ? Arrays.asList(tags.split(",")) : List.of(), effectiveLimit, (effectivePage - 1) * effectiveLimit);

                //Response mapping
                List<GetForumPostsOutItemDTO> dtoList = new ArrayList<>();
                for (Post post : forumPosts) {
                    GetForumPostsOutItemDTO dto = GetForumPostsOutDTOMapper.toDTO(post);
                    Profile authorProfile = profileRepository.findById(post.getAuthorProfileId()).orElse(null);
                    if (authorProfile != null) {
                        dto.setAuthor(new GetForumPostsOutItemAuthorDTO(authorProfile.getProfilename(), authorProfile.getImage()));
                    }
                    dtoList.add(dto);
                }
                GetForumPostsOutMetaDTO meta = new GetForumPostsOutMetaDTO((long) effectivePage, (long) totalPages, (long) totalItems);
                return ResponseEntity.ok().body(new GetForumPostsOutDTO(dtoList, meta));
            }

    @GetMapping("forum/posts/{id}")
    public ResponseEntity<GetForumPostsOutItemDTO> getForumPostDetail(
            @PathVariable Long id,
            Authentication authentication,
            @RequestHeader("X-Profile-Name") String profileName,
            @RequestParam(required = false) Integer limit,
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) String tags,
            @RequestParam(required = false) String orderBy) {
                //Security checks
                if(!utilsCalls.checkAuthAndProfile(authentication, profileName)) {
                    return ResponseEntity.status(403).build();
                }

                Post forumPost = postRepository.findById(id).orElse(null);
                if(forumPost == null) {
                    return ResponseEntity.status(404).build();
                }else if(forumPost.getCampaign() != null) {
                    return ResponseEntity.status(400).build(); // Not a forum post
                }
                GetForumPostsOutItemDTO dto = GetForumPostsOutDTOMapper.toDTO(forumPost);
                Profile authorProfile = profileRepository.findById(forumPost.getAuthorProfileId()).orElse(null);
                if (authorProfile != null) {
                    dto.setAuthor(new GetForumPostsOutItemAuthorDTO(authorProfile.getProfilename(), authorProfile.getImage()));
                }
                return ResponseEntity.ok().body(dto);
            }

    @GetMapping("forum/myPosts")
    public ResponseEntity<GetForumPostsOutDTO> getMyForumPosts(
            Authentication authentication,
            @RequestHeader("X-Profile-Name") String profileName,
            @RequestParam(required = false) Integer limit,
            @RequestParam(required = false) Integer page) {
                //Security checks
                if(!utilsCalls.checkAuthAndProfile(authentication, profileName)) {
                    return ResponseEntity.status(403).build();
                }
                Profile profile = profileRepository.findByProfilename(profileName).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));

                int effectiveLimit = Math.min((limit != null && limit > 0) ? limit : 20, 100); // Default to 20 if not provided or invalid
                int effectivePage = (page != null && page > 0) ? page : 1; // Default to 1 if not provided or invalid
                Integer totalItems = postRepository.countForumPostsByAuthorId(profile.getId()).intValue();
                Integer totalPages = (int) Math.ceil((double) totalItems / effectiveLimit);

                if (effectivePage > totalPages) {
                    return ResponseEntity.status(400).body(null); // Invalid page number
                }

                // Fetch posts with pagination and optional filtering by tags 
                List<Post> forumPosts = postRepository.findPostsByAuthorId(profile.getId    (), effectiveLimit, (effectivePage - 1) * effectiveLimit);

                //Response mapping
                List<GetForumPostsOutItemDTO> dtoList = new ArrayList<>();
                for (Post post : forumPosts) {
                    GetForumPostsOutItemDTO dto = GetForumPostsOutDTOMapper.toDTO(post);
                    Profile authorProfile = profileRepository.findById(post.getAuthorProfileId()).orElse(null);
                    if (authorProfile != null) {
                        dto.setAuthor(new GetForumPostsOutItemAuthorDTO(authorProfile.getProfilename(), authorProfile.getImage()));
                    }
                    dtoList.add(dto);
                }
                GetForumPostsOutMetaDTO meta = new GetForumPostsOutMetaDTO((long) effectivePage, (long) totalPages, (long) totalItems);
                return ResponseEntity.ok().body(new GetForumPostsOutDTO(dtoList, meta));
            }
    
    @PostMapping("campaigns/{id}/posts")
    public ResponseEntity<?> postCampaignPost(
            @PathVariable Long id,
            @RequestHeader("X-Profile-Name") String profileName,
            Authentication authentication,
            @RequestBody PostCampaignPostsInDTO request) {
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

    @PostMapping("forum/posts")
    public ResponseEntity<?> postForumPost(
            @RequestHeader("X-Profile-Name") String profileName,
            Authentication authentication,
            @RequestBody PostForumPostsInDTO request) {
                //Security checks
                Profile profile = profileRepository.findByProfilename(profileName).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
                if(!utilsCalls.checkAuthAndProfile(authentication, profileName)) {
                    return ResponseEntity.status(403).build();
                }
                Post post = new Post();
                createPostFromRequest(request, post, profile);
                return ResponseEntity.ok().build();
    }

    private Post createPostFromRequest(PostCampaignPostsInDTO request, Post post, Profile profile, CharacterSheet character, Campaign campaign, String relation) {
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
        post.setDm("OWNER".equals(relation)); // depends on your relation model

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

    private Post createPostFromRequest(PostForumPostsInDTO request, Post post, Profile profile) {
        post.setType(PostType.valueOf(request.getType()));
        post.setContent(request.getContent());

        post.setAuthorProfileId(profile.getId());


        post.setParentPost(
            request.getParentPostId() != null
                ? postRepository.findById(request.getParentPostId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND))
                : null
        );

        post.setCreatedAt(Instant.now());

        post.setOoc(true);
        post.setDm("THREAD_START".equals(request.getType())); // only thread starters are DMs, replies are always OOC

        post.setMediaUrls(request.getMediaUrls() != null ? request.getMediaUrls() : List.of());

        post.setEdited(false);
        post.setUpdatedAt(null);

        post.setPinned(false);
        post.setLocked(false);
        postRepository.save(post);
        return post;
    }
}
