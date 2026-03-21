package com.rolesync.rolesync.controller;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.core.Authentication;
import com.rolesync.rolesync.dto.forumcontroller.GetCampaignPostsOutMapper;
import com.rolesync.rolesync.dto.forumcontroller.GetCampaignPostsOutResponseDTO;
import com.rolesync.rolesync.dto.forumcontroller.GetCampaignPostsOutResponseItemDTO;
import com.rolesync.rolesync.model.Campaign;
import com.rolesync.rolesync.model.Post;
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

@RestController
public class ForumController {

    private final CampaignRepository campaignRepository;
    private final UtilsCalls utilsCalls;
    private final PostRepository postRepository;

    public ForumController(
            CampaignRepository campaignRepository,
            UtilsCalls utilsCalls,
            ProfileRepository profileRepository,
            CampaignRequestRepository campaignRequestRepository,
            CharacterSheetRepository characterSheetRepository,
            PostRepository postRepository) {
        this.campaignRepository = campaignRepository;
        this.utilsCalls = utilsCalls;
        this.postRepository = postRepository;
    }

    @GetMapping("campaigns/{id}/posts")
    public ResponseEntity<GetCampaignPostsOutResponseDTO> getCampaignPosts(
            @PathVariable Long id,
            @RequestParam(required = false) Integer limit,
            @RequestParam(required = false) Instant cursor,
            @RequestHeader("X-Profile-Name") String profileName,
            Authentication authentication) {
                //Security checks
                if(!utilsCalls.checkAuthAndProfile(authentication, profileName)) {
                    return ResponseEntity.status(403).build();
                }
                Campaign campaign = campaignRepository.findById(id).orElse(null);
                if(utilsCalls.getProfileRelationToCampaign(profileName, campaign) == "NONE" 
                || utilsCalls.getProfileRelationToCampaign(profileName, campaign) == "PENDING") {
                    return ResponseEntity.status(403).build();
                }
                // Fetch posts with pagination
                List<Post> posts = postRepository.findByCampaignId(id);
                posts.sort((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt())); // Sort by createdAt descending
                List<Post> page = posts.stream().filter(post -> post.getCreatedAt().isAfter(cursor)).limit(limit != null ? limit : Integer.MAX_VALUE).collect(Collectors.toList());

                // Prepare response additional info for pagination
                Instant nextCursor = null;
                Boolean hasMore = false;
                if (posts.size() > page.size()) {
                    nextCursor = page.get(page.size() - 1).getCreatedAt();
                    hasMore = true; 
                }

                List<GetCampaignPostsOutResponseItemDTO> dtoList = page.stream().map(GetCampaignPostsOutMapper::toDTO).toList();
                return ResponseEntity.ok().body(new GetCampaignPostsOutResponseDTO(dtoList, nextCursor, hasMore));
                

            }
                
    }
