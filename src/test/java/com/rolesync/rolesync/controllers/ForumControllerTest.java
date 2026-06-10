package com.rolesync.rolesync.controllers;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;

import com.rolesync.rolesync.controller.ForumController;
import com.rolesync.rolesync.dto.forumcontroller.PostCampaignPostsInDTO;
import com.rolesync.rolesync.dto.forumcontroller.PostForumPostsInDTO;
import com.rolesync.rolesync.dto.forumcontroller.PutPostModerateInDTO;
import com.rolesync.rolesync.model.Campaign;
import com.rolesync.rolesync.model.CharacterSheet;
import com.rolesync.rolesync.model.Post;
import com.rolesync.rolesync.model.PostType;
import com.rolesync.rolesync.model.Profile;
import com.rolesync.rolesync.repository.CampaignRepository;
import com.rolesync.rolesync.repository.CharacterSheetRepository;
import com.rolesync.rolesync.repository.PostRepository;
import com.rolesync.rolesync.repository.ProfileRepository;
import com.rolesync.rolesync.services.PostService;
import com.rolesync.rolesync.utils.UtilsCalls;

@ExtendWith(MockitoExtension.class)
class ForumControllerWriteUpdateTest {

    @Mock
    CampaignRepository campaignRepository;
    @Mock
    PostRepository postRepository;
    @Mock
    ProfileRepository profileRepository;
    @Mock
    CharacterSheetRepository characterRepository;
    @Mock
    PostService postService;
    @Mock
    UtilsCalls utilsCalls;
    @Mock
    Authentication authentication;

    @InjectMocks
    ForumController controller;

    private Profile profile;

    @BeforeEach
    void setup() {
        profile = new Profile();
        profile.setId(1L);
        profile.setProfilename("testUser");
    }

    // --------------------------------------------------
    // LOCK POST - NOT OWNER / NOT AUTHORIZED
    // --------------------------------------------------

    @Test
    void shouldReturn403LockPostNotAllowed() {
        when(utilsCalls.checkAuthAndProfile(authentication, "testUser"))
                .thenReturn(true);

        Profile p = new Profile();
        p.setId(1L);

        Post post = new Post();
        post.setAuthorProfileId(2L); // different owner
        post.setCampaign(null);

        when(profileRepository.findByProfilename("testUser"))
                .thenReturn(Optional.of(p));
        when(postRepository.findById(1L))
                .thenReturn(Optional.of(post));

        PutPostModerateInDTO dto = new PutPostModerateInDTO();
        dto.setIsLocked("true");

        ResponseEntity<?> res = controller.putPostLock(
                1L, "testUser", authentication, dto);

        assertEquals(403, res.getStatusCode().value());
    }

    // --------------------------------------------------
    // LOCK POST - SUCCESS
    // --------------------------------------------------

    @Test
    void shouldReturn200LockPostSuccess() {
        when(utilsCalls.checkAuthAndProfile(authentication, "testUser"))
                .thenReturn(true);

        Profile p = new Profile();
        p.setId(1L);

        Post post = new Post();
        post.setAuthorProfileId(1L);
        post.setCampaign(null);

        when(profileRepository.findByProfilename("testUser"))
                .thenReturn(Optional.of(p));
        when(postRepository.findById(1L))
                .thenReturn(Optional.of(post));

        PutPostModerateInDTO dto = new PutPostModerateInDTO();
        dto.setIsLocked("true");

        ResponseEntity<?> res = controller.putPostLock(
                1L, "testUser", authentication, dto);

        assertEquals(200, res.getStatusCode().value());
        verify(postRepository).save(post);
    }

    // --------------------------------------------------
    // CREATE FORUM POST - SUCCESS
    // --------------------------------------------------

    @Test
    void shouldReturn200CreateForumPostSuccess() {
        when(utilsCalls.checkAuthAndProfile(authentication, "testUser"))
                .thenReturn(true);

        when(profileRepository.findByProfilename("testUser"))
                .thenReturn(Optional.of(profile));

        Post post = new Post();
        post.setId(1L);

        when(postService.createForumPost(any(), any(), any()))
                .thenReturn(post);

        ResponseEntity<?> res = controller.postForumPost(
                "testUser", authentication, new PostForumPostsInDTO());

        assertEquals(200, res.getStatusCode().value());
    }

    // --------------------------------------------------
    // CREATE CAMPAIGN POST - CHARACTER OWNERSHIP FAIL
    // --------------------------------------------------

    @Test
    void shouldReturn403CharacterNotOwned() {
        when(utilsCalls.checkAuthAndProfile(authentication, "testUser"))
                .thenReturn(true);

        Profile p = new Profile();
        p.setId(1L);

        Campaign campaign = new Campaign();

        CharacterSheet cs = new CharacterSheet();
        Profile owner = new Profile();
        owner.setId(99L);

        cs.setOwner(owner);

        when(profileRepository.findByProfilename("testUser"))
                .thenReturn(Optional.of(p));
        when(campaignRepository.findById(1L))
                .thenReturn(Optional.of(campaign));
        when(characterRepository.findById(anyLong()))
                .thenReturn(Optional.of(cs));

        PostCampaignPostsInDTO dto = new PostCampaignPostsInDTO();
        dto.setAuthorCharacterId(10L);

        ResponseEntity<?> res = controller.postCampaignPost(
                1L, "testUser", authentication, dto);

        assertEquals(403, res.getStatusCode().value());
    }

    @Test
    void shouldReturn400WhenPinPostIsNotCampaignPost() {
        when(utilsCalls.checkAuthAndProfile(authentication, "testUser"))
                .thenReturn(true);

        Profile p = new Profile();
        p.setId(1L);

        Post post = new Post();
        post.setCampaign(null);

        when(profileRepository.findByProfilename("testUser"))
                .thenReturn(Optional.of(p));
        when(postRepository.findById(1L))
                .thenReturn(Optional.of(post));

        ResponseEntity<?> res = controller.putPostModerate(
                1L, "testUser", authentication, new PutPostModerateInDTO());

        assertEquals(400, res.getStatusCode().value());
    }

    @Test
    void shouldReturn403WhenPinPostNotOwnerNorCampaignOwner() {
        when(utilsCalls.checkAuthAndProfile(authentication, "testUser"))
                .thenReturn(true);

        Profile p = new Profile();
        p.setId(1L);

        Post post = createMockPostWithCampaign(1L);
        post.setAuthorProfileId(99L);

        Campaign campaign = new Campaign();
        campaign.setId(1L);
        post.setCampaign(campaign);

        when(profileRepository.findByProfilename("testUser"))
                .thenReturn(Optional.of(p));
        when(postRepository.findById(1L)).thenReturn(Optional.of(post));
        when(campaignRepository.findById(anyLong())).thenReturn(Optional.of(campaign));
        when(utilsCalls.getProfileRelationToCampaign(anyString(), any()))
                .thenReturn("MEMBER");

        PutPostModerateInDTO dto = new PutPostModerateInDTO();
        dto.setIsPinned("true");

        ResponseEntity<?> res = controller.putPostModerate(
                1L, "testUser", authentication, dto);

        assertEquals(403, res.getStatusCode().value());
    }

    @Test
    void shouldReturn400WhenPinMissingValue() {
        when(utilsCalls.checkAuthAndProfile(authentication, "testUser"))
                .thenReturn(true);

        Profile p = new Profile();
        p.setId(1L);

        Campaign campaign = new Campaign();
        campaign.setId(1L);

        Post post = createMockPostWithCampaign(1L);
        post.setCampaign(campaign);
        post.setAuthorProfileId(1L);

        when(profileRepository.findByProfilename("testUser"))
                .thenReturn(Optional.of(p));
        when(postRepository.findById(1L)).thenReturn(Optional.of(post));
        when(campaignRepository.findById(anyLong())).thenReturn(Optional.of(campaign));
        when(utilsCalls.getProfileRelationToCampaign(anyString(), any()))
                .thenReturn("OWNER");

        ResponseEntity<?> res = controller.putPostModerate(
                1L, "testUser", authentication, new PutPostModerateInDTO());

        assertEquals(400, res.getStatusCode().value());
    }

    @Test
    void shouldReturn200LockCampaignPostAsOwner() {
        when(utilsCalls.checkAuthAndProfile(authentication, "testUser"))
                .thenReturn(true);

        Profile p = new Profile();
        p.setId(1L);

        Campaign campaign = new Campaign();
        campaign.setId(1L);

        Post post = new Post();
        post.setAuthorProfileId(99L);
        post.setCampaign(campaign);

        when(profileRepository.findByProfilename("testUser"))
                .thenReturn(Optional.of(p));
        when(postRepository.findById(1L))
                .thenReturn(Optional.of(post));
        when(campaignRepository.findById(anyLong()))
                .thenReturn(Optional.of(campaign));
        when(utilsCalls.getProfileRelationToCampaign(anyString(), any()))
                .thenReturn("OWNER");

        PutPostModerateInDTO dto = new PutPostModerateInDTO();
        dto.setIsLocked("false");

        ResponseEntity<?> res = controller.putPostLock(
                1L, "testUser", authentication, dto);

        assertEquals(200, res.getStatusCode().value());
    }

    private Post createMockPostWithCampaign(Long id) {
        Post post = new Post();
        post.setId(id);
        post.setTitle("title");
        post.setContent("content");
        post.setCreatedAt(Instant.now());
        post.setUpdatedAt(Instant.now());
        post.setEdited(false);
        post.setLocked(false);
        post.setType(PostType.THREAD_START);
        post.setMediaUrls(new ArrayList<>() {
            {
                add("m1");
            }
        });
        post.setTags(new ArrayList<>() {
            {
                add("t1");
            }
        });

        Campaign campaign = new Campaign();
        campaign.setId(1L);
        post.setCampaign(campaign);

        return post;
    }
}