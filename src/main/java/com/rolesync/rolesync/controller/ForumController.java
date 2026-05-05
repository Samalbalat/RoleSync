package com.rolesync.rolesync.controller;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.security.core.Authentication;
import com.rolesync.rolesync.dto.forumcontroller.GetCampaignPostsOutDTOMapper;
import com.rolesync.rolesync.dto.forumcontroller.CampaignPostDTO;
import com.rolesync.rolesync.dto.forumcontroller.GetCampaignPostsOutDTO;
import com.rolesync.rolesync.dto.forumcontroller.GetCampaignPostsOutItemDTO;
import com.rolesync.rolesync.dto.forumcontroller.GetForumPostItemOutBasicData;
import com.rolesync.rolesync.dto.forumcontroller.GetForumPostsOutDTO;
import com.rolesync.rolesync.dto.forumcontroller.GetForumPostsOutDTOMapper;
import com.rolesync.rolesync.dto.forumcontroller.GetForumPostsOutItemAuthorDTO;
import com.rolesync.rolesync.dto.forumcontroller.GetForumPostsOutItemDTO;
import com.rolesync.rolesync.dto.forumcontroller.GetForumPostsOutMetaDTO;
import com.rolesync.rolesync.dto.forumcontroller.PostCampaignPostsInDTO;
import com.rolesync.rolesync.dto.forumcontroller.PostForumPostsInDTO;
import com.rolesync.rolesync.dto.forumcontroller.PutPostModerateInDTO;
import com.rolesync.rolesync.model.Campaign;
import com.rolesync.rolesync.model.CharacterSheet;
import com.rolesync.rolesync.model.Post;
import com.rolesync.rolesync.model.Profile;
import com.rolesync.rolesync.repository.CampaignRepository;
import com.rolesync.rolesync.repository.CharacterSheetRepository;
import com.rolesync.rolesync.repository.PostRepository;
import com.rolesync.rolesync.repository.ProfileRepository;
import com.rolesync.rolesync.services.PostService;
import com.rolesync.rolesync.utils.UtilsCalls;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;

@RestController
public class ForumController {

    private final CampaignRepository campaignRepository;
    private final UtilsCalls utilsCalls;
    private final PostRepository postRepository;
    private final CharacterSheetRepository characterRepository;
    private final ProfileRepository profileRepository;
    private final PostService postService;

    public ForumController(
            CampaignRepository campaignRepository,
            UtilsCalls utilsCalls,
            ProfileRepository profileRepository,
            PostRepository postRepository,
            CharacterSheetRepository characterRepository,
            PostService postService) {
        this.campaignRepository = campaignRepository;
        this.utilsCalls = utilsCalls;
        this.postRepository = postRepository;
        this.profileRepository = profileRepository;
        this.characterRepository = characterRepository;
        this.postService = postService;
    }

    @GetMapping("campaigns/{id}/posts")
    public ResponseEntity<?> getCampaignPosts(
            @PathVariable Long id,
            Authentication authentication,
            @RequestHeader("X-Profile-Name") String profileName,
            @RequestParam(required = false) Integer limit,
            @RequestParam(required = false) Instant cursor,
            @RequestParam(required = false) Long characterId) {
        // Security checks
        ResponseEntity<?> accessCheck = (ResponseEntity<?>) getPostFromCampaignsSecurity(authentication, profileName,
                id, characterId);
        if (accessCheck != null) {
            return accessCheck;
        }
        // Fetch posts with pagination
        int effectiveLimit = Math.min((limit != null && limit > 0) ? limit : 20, 100); // Default to 20 if not provided
                                                                                       // or invalid
        List<Post> page = postRepository.findCampaignPosts(id, cursor, effectiveLimit, characterId);
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
        // Security checks
        if (!utilsCalls.checkAuthAndProfile(authentication, profileName)) {
            return ResponseEntity.status(403).build();
        }
        Post parentPost = postRepository.findById(id).orElse(null);
        if (parentPost.getCampaign() != null) {
            Campaign campaign = campaignRepository.findById(parentPost.getCampaign().getId()).orElse(null);
            String relation = utilsCalls.getProfileRelationToCampaign(profileName, campaign);
            if ("NONE".equals(relation) || "PENDING".equals(relation)) {
                return ResponseEntity.status(403).build();
            }
        }

        // Fetch posts with pagination
        int effectiveLimit = Math.min((limit != null && limit > 0) ? limit : 20, 100); // Default to 20 if not provided
                                                                                       // or invalid
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

    @GetMapping("forums/posts")
    public ResponseEntity<?> getForumPosts(
            Authentication authentication,
            @RequestHeader("X-Profile-Name") String profileName,
            @RequestParam(required = false) Integer limit,
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) String tags,
            @RequestParam(required = false) String orderBy) {
        // Security checks
        ResponseEntity<?> accessCheck = validateAccess(authentication, profileName);
        if (accessCheck != null) {
            return accessCheck;
        }

        int effectiveLimit = resolveLimit(limit);
        int effectivePage = resolvePage(page);
        String[] tagList = (tags == null || tags.isBlank())
                ? null
                : parseTags(tags);
        long totalItems = postRepository.countForumPosts(tagList);
        int totalPages = calculateTotalPages((int) totalItems, effectiveLimit);

        if(validatePage(effectivePage, totalPages)!=null){
            return validatePage(effectivePage, totalPages);
        }

        Pageable pageable = PageRequest.of(effectivePage - 1, effectiveLimit);

        List<GetForumPostsOutItemDTO> dtoList = postRepository
                .findForumPosts(tagList, pageable.getPageSize(), pageable.getOffset())
                .stream()
                .map(forumPostView -> new GetForumPostsOutItemDTO(
                        new GetForumPostItemOutBasicData(
                                forumPostView.getId(),
                                forumPostView.getType(),
                                forumPostView.getTitle(),
                                forumPostView.getContent(),
                                forumPostView.getCreatedAt(),
                                forumPostView.getUpdatedAt(),
                                forumPostView.getIsEdited(),
                                forumPostView.getIsLocked()
                        ),
                        new GetForumPostsOutItemAuthorDTO(forumPostView.getProfilename(), forumPostView.getImage()),
                        Arrays.asList(forumPostView.getMediaUrls()),
                        Arrays.asList(forumPostView.getTags()),
                        forumPostView.getReplyCount()
                ))
                .toList();

        GetForumPostsOutMetaDTO meta = new GetForumPostsOutMetaDTO(
                (long) effectivePage,
                (long) totalPages,
                totalItems);

        return ResponseEntity.ok(new GetForumPostsOutDTO(dtoList, meta));
    }

    @GetMapping("forums/posts/{id}")
    public ResponseEntity<?> getForumPostDetail(
            @PathVariable Long id,
            Authentication authentication,
            @RequestHeader("X-Profile-Name") String profileName,
            @RequestParam(required = false) Integer limit,
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) String tags,
            @RequestParam(required = false) String orderBy) {
        // Security checks
        ResponseEntity<?> accessCheck = validateAccess(authentication, profileName);
        if (accessCheck != null) {
            return accessCheck;
        }
        Post forumPost = postRepository.findById(id).orElse(null);
        if (forumPost == null) {
            return ResponseEntity.status(404).body("Post not found");
        } else if (forumPost.getCampaign() != null) {
            return ResponseEntity.status(400).body("Post is not a forum post");
        }
        GetForumPostsOutItemDTO dto = GetForumPostsOutDTOMapper.toDTO(forumPost);
        Profile authorProfile = profileRepository.findById(forumPost.getAuthorProfileId()).orElse(null);
        if (authorProfile != null) {
            dto.setAuthor(new GetForumPostsOutItemAuthorDTO(authorProfile.getProfilename(), authorProfile.getImage()));
        }
        return ResponseEntity.ok().body(dto);
    }

    @GetMapping("forums/myPosts")
    public ResponseEntity<?> getMyForumPosts(
            Authentication authentication,
            @RequestHeader("X-Profile-Name") String profileName,
            @RequestParam(required = false) Integer limit,
            @RequestParam(required = false) Integer page) {
        // Security checks
        ResponseEntity<?> accessCheck = validateAccess(authentication, profileName);
        if (accessCheck != null) {
            return accessCheck;
        }
        Profile profile = profileRepository.findByProfilename(profileName)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));

        int effectiveLimit = Math.min((limit != null && limit > 0) ? limit : 20, 100); // Default to 20 if not provided
                                                                                       // or invalid
        int effectivePage = (page != null && page > 0) ? page : 1; // Default to 1 if not provided or invalid
        Integer totalItems = postRepository.countForumPostsByAuthorId(profile.getId()).intValue();
        Integer totalPages = (int) Math.ceil((double) totalItems / effectiveLimit);

        if (effectivePage > totalPages) {
            return ResponseEntity.status(400).body("Invalid page number"); // Invalid page number
        }

        // Fetch posts with pagination and optional filtering by tags
        List<Post> forumPosts = postRepository.findPostsByAuthorId(profile.getId(), effectiveLimit,
                (effectivePage - 1) * effectiveLimit);

        // Response mapping
        List<GetForumPostsOutItemDTO> dtoList = new ArrayList<>();
        for (Post post : forumPosts) {
            GetForumPostsOutItemDTO dto = GetForumPostsOutDTOMapper.toDTO(post);
            dto.setAuthor(new GetForumPostsOutItemAuthorDTO(profile.getProfilename(), profile.getImage()));
            dtoList.add(dto);
        }
        GetForumPostsOutMetaDTO meta = new GetForumPostsOutMetaDTO((long) effectivePage, (long) totalPages,
                (long) totalItems);
        return ResponseEntity.ok().body(new GetForumPostsOutDTO(dtoList, meta));
    }

    @PostMapping("campaigns/{id}/posts")
    public ResponseEntity<?> postCampaignPost(
            @PathVariable Long id,
            @RequestHeader("X-Profile-Name") String profileName,
            Authentication authentication,
            @RequestBody PostCampaignPostsInDTO request) {
        // Security checks
        ResponseEntity<?> accessCheck = validateAccess(authentication, profileName);
        if (accessCheck != null) {
            return accessCheck;
        }
        Profile profile = profileRepository.findByProfilename(profileName)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        Campaign campaign = campaignRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        String relation = utilsCalls.getProfileRelationToCampaign(profileName, campaign);
        if ("NONE".equals(relation) || "PENDING".equals(relation)) {
            return ResponseEntity.status(403).build();
        }
        CharacterSheet character = null;
        if (request.getAuthorCharacterId() != null) {
            character = characterRepository.findById(request.getAuthorCharacterId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
            // Ensure character belongs to profile
            if (!character.getOwner().getId().equals(profile.getId())) {
                return ResponseEntity.status(403).build();
            }
        }
        CampaignPostDTO campaignPostDto = postService.createCampaignPost(request, profile, character, campaign, relation);
        return ResponseEntity.ok().body(campaignPostDto);
    }

    @PutMapping("post/{id}/lock")
    public ResponseEntity<?> putPostLock(
            @PathVariable Long id,
            @RequestHeader("X-Profile-Name") String profileName,
            Authentication authentication,
            @RequestBody PutPostModerateInDTO request) {

        // Security checks
        ResponseEntity<?> accessCheck = validateAccess(authentication, profileName);
        if (accessCheck != null) return accessCheck;
        Profile profile = profileRepository.findByProfilename(profileName)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        boolean canModify = false;
        if (post.getCampaign() == null) {
            // Forum post → only author
            canModify = post.getAuthorProfileId().equals(profile.getId());
        } else {
            Campaign campaign = campaignRepository.findById(post.getCampaign().getId())
                    .orElse(null);
            String relation = utilsCalls.getProfileRelationToCampaign(profileName, campaign);
            // Campaign post → owner OR author
            canModify = "OWNER".equals(relation) ||
                        post.getAuthorProfileId().equals(profile.getId());
        }
        if (!canModify) {
            return ResponseEntity.status(403).body("Access denied");
        }
        post.setLocked(request.getIsLocked());
        postRepository.save(post);
        return ResponseEntity.ok()
                .body("Post " + (request.getIsLocked() ? "locked" : "unlocked"));
    }

    @PutMapping("post/{id}/pin")
    public ResponseEntity<?> putPostModerate(
            @PathVariable Long id,
            @RequestHeader("X-Profile-Name") String profileName,
            Authentication authentication,
            @RequestBody PutPostModerateInDTO request) {
        // Security checks
        ResponseEntity<?> accessCheck = validateAccess(authentication, profileName);
        if (accessCheck != null) return accessCheck;
        Profile profile = profileRepository.findByProfilename(profileName)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        if(post.getCampaign() != null){
        Campaign campaign = campaignRepository.findById(post.getCampaign().getId())
                .orElse(null);
        String relation = utilsCalls.getProfileRelationToCampaign(profileName, campaign);
        // Campaign post → owner OR author
        boolean canModify = "OWNER".equals(relation) ||
                    post.getAuthorProfileId().equals(profile.getId());
            if (!canModify) {
                return ResponseEntity.status(403).body("Access denied");
            }
        }else{
            return ResponseEntity.status(400).body("Post is not a campaign post, therefore cannot be pinned");
        }
        post.setLocked(request.getIsLocked());
        postRepository.save(post);
        return ResponseEntity.ok()
                .body("Post " + (request.getIsLocked() ? "locked" : "unlocked"));
    }

    @PostMapping("forums/posts")
    public ResponseEntity<?> postForumPost(
            @RequestHeader("X-Profile-Name") String profileName,
            Authentication authentication,
            @RequestBody PostForumPostsInDTO request) {
        // Security checks
        ResponseEntity<?> accessCheck = validateAccess(authentication, profileName);
        if (accessCheck != null) {
            return accessCheck;
        }
        Profile profile = profileRepository.findByProfilename(profileName)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        Post responsePost = postService.createForumPost(request, profile);
        return ResponseEntity.ok().body(responsePost.getId());
    }

    private Object getPostFromCampaignsSecurity(Authentication authentication, String profileName, Long id,
            Long characterId) {
        // Security checks
        ResponseEntity<?> accessCheck = validateAccess(authentication, profileName);
        if (accessCheck != null) {
            return accessCheck;
        }
        Campaign campaign = campaignRepository.findById(id).orElse(null);
        String relation = utilsCalls.getProfileRelationToCampaign(profileName, campaign);
        if ("NONE".equals(relation) || "PENDING".equals(relation)) {
            return ResponseEntity.status(403).body("Access denied");
        }
        if (characterId != null) {
            CharacterSheet accessingCharacter = characterRepository.findById(characterId).orElse(null);
            if (accessingCharacter == null) {
                return ResponseEntity.status(400).body("Invalid character ID"); // Invalid character ID
            } else if (!accessingCharacter.getOwner().getProfilename().equals(profileName)) {
                return ResponseEntity.status(403).body("Access denied"); // Character does not belong to profile
            }
        }
        return null; // No issues, access granted
    }

    private ResponseEntity<?> validateAccess(Authentication auth, String profileName) {
        if (!utilsCalls.checkAuthAndProfile(auth, profileName)) {
            return ResponseEntity.status(403).body("Access denied");
        }
        return null;
    }

    private int resolveLimit(Integer limit) {
        return Math.min((limit != null && limit > 0) ? limit : 20, 100);
    }

    private int resolvePage(Integer page) {
        return (page != null && page > 0) ? page : 1;
    }

    private int calculateTotalPages(int totalItems, int limit) {
        return (int) Math.ceil((double) totalItems / limit);
    }

    private ResponseEntity<?> validatePage(int page, int totalPages) {
        if (page > totalPages && totalPages != 0) {
            return ResponseEntity.status(400).body("Invalid page number"); // Invalid page number
        }
        return null;
    }

    private String[] parseTags(String tags) {
        return Arrays.stream(tags.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .toArray(String[]::new);
    }
}
