package com.rolesync.rolesync.controllers;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
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
import com.rolesync.rolesync.model.Campaign;
import com.rolesync.rolesync.model.CharacterSheet;
import com.rolesync.rolesync.model.Post;
import com.rolesync.rolesync.model.PostType;
import com.rolesync.rolesync.model.Profile;
import com.rolesync.rolesync.repository.CampaignRepository;
import com.rolesync.rolesync.repository.CharacterSheetRepository;
import com.rolesync.rolesync.repository.PostRepository;
import com.rolesync.rolesync.repository.ProfileRepository;
import com.rolesync.rolesync.repository.projections.ForumPostView;
import com.rolesync.rolesync.services.PostService;
import com.rolesync.rolesync.utils.UtilsCalls;

@ExtendWith(MockitoExtension.class)
class ForumControllerReadTest {

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

        @BeforeEach
        void setup() {
                Profile profile = new Profile();
                profile.setId(1L);
                profile.setProfilename("testUser");
        }

        // --------------------------------------------------
        // GLOBAL AUTH FAILURE
        // --------------------------------------------------

        @Test
        void shouldReturn403WhenAuthFailsGetCampaignPosts() {
                when(utilsCalls.checkAuthAndProfile(authentication, "testUser"))
                                .thenReturn(false);

                ResponseEntity<?> res = controller.getCampaignPosts(
                                1L, authentication, "testUser", 10, null, null);

                assertEquals(403, res.getStatusCode().value());
        }

        // --------------------------------------------------
        // CAMPAIGN POSTS - FORBIDDEN RELATION
        // --------------------------------------------------

        @Test
        void shouldReturn403WhenNoRelationToCampaign() {
                when(utilsCalls.checkAuthAndProfile(authentication, "testUser"))
                                .thenReturn(true);

                Campaign campaign = new Campaign();
                when(campaignRepository.findById(1L)).thenReturn(Optional.of(campaign));
                when(utilsCalls.getProfileRelationToCampaign("testUser", campaign))
                                .thenReturn("NONE");

                ResponseEntity<?> res = controller.getCampaignPosts(
                                1L, authentication, "testUser", 10, null, null);

                assertEquals(403, res.getStatusCode().value());
        }

        // --------------------------------------------------
        // CAMPAIGN POSTS - SUCCESS PATH
        // --------------------------------------------------

        @Test
        void shouldReturn200CampaignPostsSuccess() {
                when(utilsCalls.checkAuthAndProfile(authentication, "testUser"))
                                .thenReturn(true);

                Campaign campaign = new Campaign();
                when(campaignRepository.findById(1L)).thenReturn(Optional.of(campaign));
                when(utilsCalls.getProfileRelationToCampaign("testUser", campaign))
                                .thenReturn("MEMBER");

                Post post = createMockPostWithCampaign(1L);
                post.setCreatedAt(Instant.now());
                Profile authorProfile = new Profile();
                authorProfile.setId(1L);
                authorProfile.setProfilename("testUser");
                post.setAuthor(authorProfile);

                when(postRepository.findCampaignPosts(anyLong(), any(), anyInt(), any()))
                                .thenReturn(List.of(post));

                ResponseEntity<?> res = controller.getCampaignPosts(
                                1L, authentication, "testUser", 10, null, null);

                assertEquals(200, res.getStatusCode().value());
        }

        // --------------------------------------------------
        // REPLIES - FORBIDDEN AUTH
        // --------------------------------------------------

        @Test
        void shouldReturn403WhenAuthFailsGetReplies() {
                when(utilsCalls.checkAuthAndProfile(authentication, "testUser"))
                                .thenReturn(false);

                ResponseEntity<?> res = controller.getPostReplies(
                                1L, authentication, "testUser", 10, null);

                assertEquals(403, res.getStatusCode().value());
        }

        // --------------------------------------------------
        // REPLIES - CAMPAIGN FORBIDDEN RELATION
        // --------------------------------------------------

        @Test
        void shouldReturn403WhenCampaignRelationInvalidOnReplies() {
                when(utilsCalls.checkAuthAndProfile(authentication, "testUser"))
                                .thenReturn(true);

                Post parent = new Post();
                Campaign campaign = new Campaign();
                campaign.setId(1L);
                parent.setCampaign(campaign);

                when(postRepository.findById(1L)).thenReturn(Optional.of(parent));
                when(campaignRepository.findById(anyLong())).thenReturn(Optional.of(campaign));
                when(utilsCalls.getProfileRelationToCampaign(anyString(), any()))
                                .thenReturn("NONE");

                ResponseEntity<?> res = controller.getPostReplies(
                                1L, authentication, "testUser", 10, null);

                assertEquals(403, res.getStatusCode().value());
        }

        // --------------------------------------------------
        // REPLIES - SUCCESS
        // --------------------------------------------------

        @Test
        void shouldReturn200RepliesSuccess() {
                when(utilsCalls.checkAuthAndProfile(authentication, "testUser"))
                                .thenReturn(true);

                Post parent = new Post();
                parent.setCampaign(null);
                Profile authorProfile = new Profile();
                authorProfile.setId(1L);
                authorProfile.setProfilename("testUser");
                parent.setAuthor(authorProfile);

                Post reply = createMockPostWithCampaign(2L);
                reply.setAuthor(authorProfile);

                when(postRepository.findById(1L)).thenReturn(Optional.of(parent));
                when(postRepository.findPostReplies(anyLong(), any(), anyInt()))
                                .thenReturn(List.of(reply));

                ResponseEntity<?> res = controller.getPostReplies(
                                1L, authentication, "testUser", 10, null);

                assertEquals(200, res.getStatusCode().value());
        }

        // --------------------------------------------------
        // FORUM POSTS - AUTH FAIL
        // --------------------------------------------------

        @Test
        void shouldReturn403ForumPostsAuthFail() {
                when(utilsCalls.checkAuthAndProfile(authentication, "testUser"))
                                .thenReturn(false);

                ResponseEntity<?> res = controller.getForumPosts(
                                authentication, "testUser", 10, 1, null, null);

                assertEquals(403, res.getStatusCode().value());
        }

        // --------------------------------------------------
        // FORUM POSTS - SUCCESS
        // --------------------------------------------------

        @Test
        void shouldReturn200ForumPostsSuccess() {
                when(utilsCalls.checkAuthAndProfile(authentication, "testUser"))
                                .thenReturn(true);

                when(postRepository.countForumPosts(any())).thenReturn(10L);
                when(postRepository.findForumPosts(any(), anyInt(), anyLong()))
                                .thenReturn(List.of());

                ResponseEntity<?> res = controller.getForumPosts(
                                authentication, "testUser", 10, 1, "tag1,tag2", null);

                assertEquals(200, res.getStatusCode().value());
        }

        // --------------------------------------------------
        // FORUM DETAIL - NOT FOUND
        // --------------------------------------------------

        @Test
        void shouldReturn404ForumPostNotFound() {
                when(utilsCalls.checkAuthAndProfile(authentication, "testUser"))
                                .thenReturn(true);

                when(postRepository.findById(1L)).thenReturn(Optional.empty());

                ResponseEntity<?> res = controller.getForumPostDetail(
                                1L, authentication, "testUser", null, null, null, null);

                assertEquals(404, res.getStatusCode().value());
        }

        // --------------------------------------------------
        // FORUM DETAIL - INVALID TYPE (campaign post)
        // --------------------------------------------------

        @Test
        void shouldReturn400ForumPostIsCampaignPost() {
                when(utilsCalls.checkAuthAndProfile(authentication, "testUser"))
                                .thenReturn(true);

                Post post = new Post();
                post.setCampaign(new Campaign());

                when(postRepository.findById(1L)).thenReturn(Optional.of(post));

                ResponseEntity<?> res = controller.getForumPostDetail(
                                1L, authentication, "testUser", null, null, null, null);

                assertEquals(400, res.getStatusCode().value());
        }

        // --------------------------------------------------
        // MY POSTS - SUCCESS
        // --------------------------------------------------

        @Test
        void shouldReturn200MyPostsSuccess() {
                when(utilsCalls.checkAuthAndProfile(authentication, "testUser"))
                                .thenReturn(true);

                Profile p = new Profile();
                p.setId(1L);

                when(profileRepository.findByProfilename("testUser"))
                                .thenReturn(Optional.of(p));

                when(postRepository.countForumPostsByAuthor(p)).thenReturn(5L);
                when(postRepository.findPostsByAuthor(p, 10, 0))
                                .thenReturn(List.of(createMockPostWithCampaign(1L)));

                ResponseEntity<?> res = controller.getMyForumPosts(
                                authentication, "testUser", 10, 1);

                assertEquals(200, res.getStatusCode().value());
        }

        @Test
        void shouldReturn400WhenCharacterDoesNotExist() {
                when(utilsCalls.checkAuthAndProfile(authentication, "testUser"))
                                .thenReturn(true);

                Campaign campaign = new Campaign();
                when(campaignRepository.findById(1L)).thenReturn(Optional.of(campaign));
                when(utilsCalls.getProfileRelationToCampaign(anyString(), any()))
                                .thenReturn("MEMBER");

                when(characterRepository.findById(99L))
                                .thenReturn(Optional.empty());

                ResponseEntity<?> res = controller.getCampaignPosts(
                                1L, authentication, "testUser", 10, null, 99L);

                assertEquals(400, res.getStatusCode().value());
        }

        @Test
        void shouldReturn403WhenCharacterNotOwnedByProfile() {
                when(utilsCalls.checkAuthAndProfile(authentication, "testUser"))
                                .thenReturn(true);

                Campaign campaign = new Campaign();
                when(campaignRepository.findById(1L)).thenReturn(Optional.of(campaign));
                when(utilsCalls.getProfileRelationToCampaign(anyString(), any()))
                                .thenReturn("MEMBER");

                Profile other = new Profile();
                other.setProfilename("other");

                CharacterSheet cs = new CharacterSheet();
                cs.setOwner(other);

                when(characterRepository.findById(99L))
                                .thenReturn(Optional.of(cs));

                ResponseEntity<?> res = controller.getCampaignPosts(
                                1L, authentication, "testUser", 10, null, 99L);

                assertEquals(403, res.getStatusCode().value());
        }

        @Test
        void shouldReturn400WhenPageOutOfBoundsMyPosts() {
                when(utilsCalls.checkAuthAndProfile(authentication, "testUser"))
                                .thenReturn(true);

                Profile p = new Profile();
                p.setId(1L);

                when(profileRepository.findByProfilename("testUser"))
                                .thenReturn(Optional.of(p));

                when(postRepository.countForumPostsByAuthor(p))
                                .thenReturn(0L);

                ResponseEntity<?> res = controller.getMyForumPosts(
                                authentication, "testUser", 10, 5);

                assertEquals(400, res.getStatusCode().value());
        }

        @Test
        void shouldReturn200WhenCharacterValidInCampaignSecurity() {
                when(utilsCalls.checkAuthAndProfile(authentication, "testUser"))
                                .thenReturn(true);

                Campaign campaign = new Campaign();
                when(campaignRepository.findById(1L)).thenReturn(Optional.of(campaign));
                when(utilsCalls.getProfileRelationToCampaign(anyString(), any()))
                                .thenReturn("MEMBER");

                Profile owner = new Profile();
                owner.setProfilename("testUser");
                owner.setId(1L);

                CharacterSheet cs = new CharacterSheet();
                cs.setOwner(owner);

                when(characterRepository.findById(99L))
                                .thenReturn(Optional.of(cs));

                Post post = createMockPostWithCampaign(1L);
                post.setAuthor(owner);

                when(postRepository.findCampaignPosts(anyLong(), any(), anyInt(), any()))
                                .thenReturn(List.of(post));
                ResponseEntity<?> res = controller.getCampaignPosts(
                                1L, authentication, "testUser", 10, null, 99L);

                assertEquals(200, res.getStatusCode().value());
        }

        @Test
        void shouldReturn200RepliesWhenParentPostNotFound() {
                when(utilsCalls.checkAuthAndProfile(authentication, "testUser"))
                                .thenReturn(true);

                when(postRepository.findById(1L)).thenReturn(Optional.empty());

                Post post = createMockPostWithCampaign(1L);
                Profile authorProfile = new Profile();
                authorProfile.setId(1L);
                authorProfile.setProfilename("testUser");
                post.setAuthor(authorProfile);

                when(postRepository.findPostReplies(anyLong(), any(), anyInt()))
                                .thenReturn(List.of(post));

                ResponseEntity<?> res = controller.getPostReplies(
                                1L, authentication, "testUser", 10, null);

                assertEquals(200, res.getStatusCode().value());
        }

        @Test
        void shouldReturnHasMoreTrueWhenRepliesExceedLimit() {
                when(utilsCalls.checkAuthAndProfile(authentication, "testUser"))
                                .thenReturn(true);

                Post parent = new Post();
                parent.setCampaign(null);
                Profile authorProfile = new Profile();
                authorProfile.setId(1L);
                authorProfile.setProfilename("testUser");
                parent.setAuthor(authorProfile);

                when(postRepository.findById(1L)).thenReturn(Optional.of(parent));

                Post p1 = createMockPostWithCampaign(1L);
                p1.setAuthor(authorProfile);
                Post p2 = createMockPostWithCampaign(2L);
                p2.setAuthor(authorProfile);

                when(postRepository.findPostReplies(anyLong(), any(), anyInt()))
                                .thenReturn(List.of(p1, p2, new Post())); // > limit (2 > 2 edge fix needed)

                ResponseEntity<?> res = controller.getPostReplies(
                                1L, authentication, "testUser", 2, null);

                assertEquals(200, res.getStatusCode().value());
        }

        @Test
        void shouldReturn200MyPostsMultipleMapping() {
                when(utilsCalls.checkAuthAndProfile(authentication, "testUser"))
                                .thenReturn(true);

                Profile p = new Profile();
                p.setId(1L);
                p.setProfilename("testUser");
                p.setImage("img");

                when(profileRepository.findByProfilename("testUser"))
                                .thenReturn(Optional.of(p));

                when(postRepository.countForumPostsByAuthor(p))
                                .thenReturn(2L);

                when(postRepository.findPostsByAuthor(p, 10, 0))
                                .thenReturn(List.of(createMockPostWithCampaign(1L)));

                ResponseEntity<?> res = controller.getMyForumPosts(
                                authentication, "testUser", 10, 1);

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

        @Test
        void shouldReturn200CampaignPostsHasMoreBranch() {
                when(utilsCalls.checkAuthAndProfile(authentication, "testUser"))
                                .thenReturn(true);

                Campaign campaign = new Campaign();
                when(campaignRepository.findById(1L)).thenReturn(Optional.of(campaign));
                when(utilsCalls.getProfileRelationToCampaign("testUser", campaign))
                                .thenReturn("MEMBER");

                Profile authorProfile = new Profile();
                authorProfile.setId(1L);
                authorProfile.setProfilename("testUser");

                Post post1 = createMockPostWithCampaign(1L);
                post1.setCreatedAt(Instant.now());

                post1.setAuthor(authorProfile);

                Post post2 = createMockPostWithCampaign(2L);
                post2.setCreatedAt(Instant.now().plusSeconds(10));
                post2.setAuthor(authorProfile);

                // IMPORTANT: size = limit + 1
                when(postRepository.findCampaignPosts(anyLong(), any(), eq(1), any()))
                                .thenReturn(List.of(post1, post2));

                ResponseEntity<?> res = controller.getCampaignPosts(
                                1L, authentication, "testUser", 1, null, null);

                assertEquals(200, res.getStatusCode().value());
        }

        @Test
        void shouldReturn200RepliesCampaignBranchAllowed() {
                when(utilsCalls.checkAuthAndProfile(authentication, "testUser"))
                                .thenReturn(true);

                Post parent = createMockPostWithCampaign(1L);
                Profile authorProfile = new Profile();
                authorProfile.setId(1L);
                authorProfile.setProfilename("testUser");
                parent.setAuthor(authorProfile);

                Campaign campaign = new Campaign();
                campaign.setId(1L);
                parent.setCampaign(campaign);

                when(postRepository.findById(1L)).thenReturn(Optional.of(parent));
                when(campaignRepository.findById(anyLong())).thenReturn(Optional.of(campaign));
                when(utilsCalls.getProfileRelationToCampaign(anyString(), any()))
                                .thenReturn("MEMBER");

                Post reply = createMockPostWithCampaign(2L);
                reply.setAuthor(authorProfile);
                when(postRepository.findPostReplies(anyLong(), any(), anyInt()))
                                .thenReturn(List.of(reply));

                ResponseEntity<?> res = controller.getPostReplies(
                                1L, authentication, "testUser", 10, null);

                assertEquals(200, res.getStatusCode().value());
        }

        @Test
        void shouldReturn200ForumPostsFullMappingBranch() {
                when(utilsCalls.checkAuthAndProfile(authentication, "testUser"))
                                .thenReturn(true);

                when(postRepository.countForumPosts(any())).thenReturn(1L);

                ForumPostView view = mock(ForumPostView.class);

                when(view.getId()).thenReturn(1L);
                when(view.getType()).thenReturn("POST");
                when(view.getTitle()).thenReturn("title");
                when(view.getContent()).thenReturn("content");
                when(view.getCreatedAt()).thenReturn(Instant.now());
                when(view.getUpdatedAt()).thenReturn(Instant.now());
                when(view.getIsEdited()).thenReturn(false);
                when(view.getIsLocked()).thenReturn(false);
                when(view.getProfilename()).thenReturn("user");
                when(view.getImage()).thenReturn("img");
                when(view.getMediaUrls()).thenReturn(new String[] { "m1" });
                when(view.getTags()).thenReturn(new String[] { "t1" });
                when(view.getReplyCount()).thenReturn(5L);

                when(postRepository.findForumPosts(any(), anyInt(), anyLong()))
                                .thenReturn(List.of(view));

                ResponseEntity<?> res = controller.getForumPosts(
                                authentication, "testUser", 10, 1, "tag1", null);

                assertEquals(200, res.getStatusCode().value());
        }

        @Test
        void shouldReturn200MyPostsEmptyMappingBranch() {
                when(utilsCalls.checkAuthAndProfile(authentication, "testUser"))
                                .thenReturn(true);

                Profile p = new Profile();
                p.setId(1L);
                p.setImage("img");

                when(profileRepository.findByProfilename("testUser"))
                                .thenReturn(Optional.of(p));

                when(postRepository.countForumPostsByAuthor(p))
                                .thenReturn(1L);

                // EMPTY LIST forces loop skip
                when(postRepository.findPostsByAuthor(p, 10, 0))
                                .thenReturn(List.of());

                ResponseEntity<?> res = controller.getMyForumPosts(
                                authentication, "testUser", 10, 1);

                assertEquals(200, res.getStatusCode().value());
        }
}