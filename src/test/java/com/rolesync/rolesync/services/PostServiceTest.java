
package com.rolesync.rolesync.services;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import java.util.List;
import java.util.Optional;
import java.util.Set;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import com.rolesync.rolesync.dto.forumcontroller.CampaignPostDTO;
import com.rolesync.rolesync.dto.forumcontroller.PostCampaignPostsInDTO;
import com.rolesync.rolesync.dto.forumcontroller.PostForumPostsInDTO;
import com.rolesync.rolesync.events.PostCreatedEvent;
import com.rolesync.rolesync.model.Campaign;
import com.rolesync.rolesync.model.CharacterSheet;
import com.rolesync.rolesync.model.Post;
import com.rolesync.rolesync.model.PostType;
import com.rolesync.rolesync.model.Profile;
import com.rolesync.rolesync.model.User;
import com.rolesync.rolesync.repository.CharacterSheetRepository;
import com.rolesync.rolesync.repository.PostRepository;
import com.rolesync.rolesync.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = org.mockito.quality.Strictness.LENIENT)
class PostServiceTest {

    @Mock
    private PostRepository postRepository;

    @Mock
    private CharacterSheetRepository characterRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private ApplicationEventPublisher eventPublisher;

    @InjectMocks
    private PostService service;

    private Profile profile;
    private User user;
    private Campaign campaign;

    @BeforeEach
    void setUp() {
        profile = new Profile();
        profile.setId(1L);

        user = new User();
        user.setEmail("user@test.com");

        campaign = new Campaign();
        campaign.setId(10L);

        when(postRepository.saveAndFlush(any(Post.class)))
                .thenAnswer(i -> i.getArgument(0));

        when(userRepository.findByEmail(any()))
                .thenReturn(Optional.of(user));
    }

    @Test
    void createCampaignPostOwnerDmWithCharacterAndVisibility() {
        CharacterSheet character = new CharacterSheet();
        character.setId(5L);
        character.setName("Hero");
        character.setImage("img");

        CharacterSheet visible = new CharacterSheet();
        visible.setId(100L);

        PostCampaignPostsInDTO dto = new PostCampaignPostsInDTO();
        dto.setType(PostType.THREAD_START.name());
        dto.setContent("content");
        dto.setIsOoc(false);
        dto.setIsDm(true);
        dto.setMediaUrls(List.of("a"));
        dto.setVisibleToCharacterIds(List.of(100L));

        when(characterRepository.findAllById(List.of(100L)))
                .thenReturn(List.of(visible));

        CampaignPostDTO result = service.createCampaignPost(
                dto,
                profile,
                character,
                campaign,
                "OWNER",
                user);

        assertNotNull(result);

        ArgumentCaptor<Post> captor = ArgumentCaptor.forClass(Post.class);

        verify(postRepository).saveAndFlush(captor.capture());

        Post saved = captor.getValue();

        assertEquals(PostType.THREAD_START, saved.getType());
        assertEquals("content", saved.getContent());
        assertEquals(1L, saved.getAuthor().getId());
        assertEquals(5L, saved.getAuthorCharacterId());
        assertEquals("Hero", saved.getAuthorCharacterName());
        assertEquals("img", saved.getAuthorCharacterImage());
        assertEquals(campaign, saved.getCampaign());
        assertFalse(saved.isOoc());
        assertTrue(saved.isDm());
        assertEquals(List.of("a"), saved.getMediaUrls());
        assertEquals(Set.of(100L), saved.getVisibleToCharacterIds());
        assertFalse(saved.isEdited());
        assertFalse(saved.isPinned());
        assertFalse(saved.isLocked());

        verify(eventPublisher)
                .publishEvent(any(PostCreatedEvent.class));
    }

    @Test
    void createCampaignPostWithoutCharacterAndDefaultVisibility() {
        PostCampaignPostsInDTO dto = new PostCampaignPostsInDTO();
        dto.setType(PostType.THREAD_START.name());
        dto.setContent("content");
        dto.setIsOoc(true);

        service.createCampaignPost(
                dto,
                profile,
                null,
                campaign,
                "PLAYER",
                user);

        ArgumentCaptor<Post> captor = ArgumentCaptor.forClass(Post.class);

        verify(postRepository).saveAndFlush(captor.capture());

        Post saved = captor.getValue();

        assertNull(saved.getAuthorCharacterId());
        assertFalse(saved.isDm());
        assertEquals(List.of(), saved.getMediaUrls());
        assertTrue(saved.getVisibleToCharacterIds().isEmpty());
    }

    @Test
    void createCampaignPostWithParentPost() {
        Post parent = new Post();
        parent.setId(50L);

        PostCampaignPostsInDTO dto = new PostCampaignPostsInDTO();
        dto.setType(PostType.REPLY.name());
        dto.setContent("reply");
        dto.setIsOoc(false);
        dto.setParentPostId(50L);

        when(postRepository.findById(50L))
                .thenReturn(Optional.of(parent));

        service.createCampaignPost(
                dto,
                profile,
                null,
                campaign,
                "PLAYER",
                user);

        ArgumentCaptor<Post> captor = ArgumentCaptor.forClass(Post.class);

        verify(postRepository).saveAndFlush(captor.capture());

        assertEquals(parent, captor.getValue().getParentPost());
    }

    @Test
    void createCampaignPostWithMissingParentUsesNull() {
        PostCampaignPostsInDTO dto = new PostCampaignPostsInDTO();
        dto.setType(PostType.REPLY.name());
        dto.setContent("reply");
        dto.setIsOoc(false);
        dto.setParentPostId(999L);

        when(postRepository.findById(999L))
                .thenReturn(Optional.empty());

        service.createCampaignPost(
                dto,
                profile,
                null,
                campaign,
                "PLAYER",
                user);

        ArgumentCaptor<Post> captor = ArgumentCaptor.forClass(Post.class);

        verify(postRepository).saveAndFlush(captor.capture());

        assertNull(captor.getValue().getParentPost());
    }

    @Test
    void createCampaignPostThrowsWhenVisibilityContainsInvalidCharacter() {
        PostCampaignPostsInDTO dto = new PostCampaignPostsInDTO();
        dto.setType(PostType.THREAD_START.name());
        dto.setContent("content");
        dto.setIsOoc(false);
        dto.setVisibleToCharacterIds(List.of(1L, 2L));

        CharacterSheet onlyOne = new CharacterSheet();
        onlyOne.setId(1L);

        when(characterRepository.findAllById(List.of(1L, 2L)))
                .thenReturn(List.of(onlyOne));

        ResponseStatusException ex = assertThrows(
                ResponseStatusException.class,
                () -> service.createCampaignPost(
                        dto,
                        profile,
                        null,
                        campaign,
                        "OWNER",
                        user));

        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());

        verify(postRepository, never()).saveAndFlush(any());
    }

    @Test
    void createCampaignPostHandlesNullUser() {
        PostCampaignPostsInDTO dto = new PostCampaignPostsInDTO();
        dto.setType(PostType.THREAD_START.name());
        dto.setContent("content");
        dto.setIsOoc(false);

        service.createCampaignPost(
                dto,
                profile,
                null,
                campaign,
                "OWNER",
                null);

        verify(userRepository).findByEmail(null);
        verify(eventPublisher).publishEvent(any(PostCreatedEvent.class));
    }

    @Test
    void createForumThreadStart() {
        PostForumPostsInDTO dto = new PostForumPostsInDTO();
        dto.setType("THREAD_START");
        dto.setTitle("Title");
        dto.setContent("Content");
        dto.setTags(List.of("tag1"));
        dto.setMediaUrls(List.of("img"));

        Post result = service.createForumPost(
                dto,
                profile,
                user);

        assertNotNull(result);

        ArgumentCaptor<Post> captor = ArgumentCaptor.forClass(Post.class);

        verify(postRepository).saveAndFlush(captor.capture());

        Post saved = captor.getValue();

        assertEquals("Title", saved.getTitle());
        assertTrue(saved.isOoc());
        assertTrue(saved.isDm());
        assertEquals(List.of("tag1"), saved.getTags());
        assertEquals(List.of("img"), saved.getMediaUrls());
    }

    @Test
    void createForumReplyWithParent() {
        Post parent = new Post();
        parent.setId(12L);

        PostForumPostsInDTO dto = new PostForumPostsInDTO();
        dto.setType(PostType.REPLY.name());
        dto.setTitle("reply");
        dto.setContent("content");
        dto.setParentPostId(12L);

        when(postRepository.findById(12L))
                .thenReturn(Optional.of(parent));

        service.createForumPost(
                dto,
                profile,
                user);

        ArgumentCaptor<Post> captor = ArgumentCaptor.forClass(Post.class);

        verify(postRepository).saveAndFlush(captor.capture());

        assertEquals(parent, captor.getValue().getParentPost());
        assertFalse(captor.getValue().isDm());
    }

    @Test
    void createForumPostThrowsWhenParentMissing() {
        PostForumPostsInDTO dto = new PostForumPostsInDTO();
        dto.setType(PostType.REPLY.name());
        dto.setTitle("reply");
        dto.setContent("content");
        dto.setParentPostId(99L);

        when(postRepository.findById(99L))
                .thenReturn(Optional.empty());

        ResponseStatusException ex = assertThrows(
                ResponseStatusException.class,
                () -> service.createForumPost(
                        dto,
                        profile,
                        user));

        assertEquals(HttpStatus.NOT_FOUND, ex.getStatusCode());

        verify(postRepository, never()).saveAndFlush(any());
    }

    @Test
    void createForumPostUsesDefaultsForNullCollections() {
        PostForumPostsInDTO dto = new PostForumPostsInDTO();
        dto.setType(PostType.THREAD_START.name());
        dto.setTitle("Title");
        dto.setContent("Content");

        service.createForumPost(
                dto,
                profile,
                user);

        ArgumentCaptor<Post> captor = ArgumentCaptor.forClass(Post.class);

        verify(postRepository).saveAndFlush(captor.capture());

        Post saved = captor.getValue();

        assertEquals(List.of(), saved.getTags());
        assertEquals(List.of(), saved.getMediaUrls());
        assertNull(saved.getParentPost());
    }
}
