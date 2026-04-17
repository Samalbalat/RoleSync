package com.rolesync.rolesync.services;

import java.time.Instant;
import java.util.HashSet;
import java.util.List;

import org.springframework.context.ApplicationEvent;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
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
import com.rolesync.rolesync.repository.CharacterSheetRepository;
import com.rolesync.rolesync.repository.PostRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PostService {

    private final PostRepository postRepository;
    private final CharacterSheetRepository characterRepository;
    private final ApplicationEventPublisher eventPublisher;
    
    @Transactional
    public CampaignPostDTO createCampaignPost(PostCampaignPostsInDTO request, Post post, Profile profile,
            CharacterSheet character, Campaign campaign, String relation) {
        return new CampaignPostDTO(createPostFromRequest(request, post, profile, character, campaign, relation));
    }
    @Transactional
    public Post createForumPost(PostForumPostsInDTO request, Post post, Profile profile) {
        return createPostFromRequest(request, post, profile);
    }

    private Post createPostFromRequest(PostCampaignPostsInDTO request, Post post, Profile profile,
            CharacterSheet character, Campaign campaign, String relation) {
        post.setType(PostType.valueOf(request.getType()));
        post.setContent(request.getContent());

        post.setAuthorProfileId(profile.getId());

        if (character != null) { // if not explicitly OOC, treat as IC and require character info
            post.setAuthorCharacterId(character.getId());
            post.setAuthorCharacterName(character.getName());
            post.setAuthorCharacterImage(character.getImage());
        }
        post.setCampaign(campaign);

        if (request.getParentPostId() != null) { // parentPostId is optional, only for replies
            post.setParentPost(
                    postRepository.findById(request.getParentPostId()).orElse(null));
        }

        post.setCreatedAt(Instant.now());

        post.setOoc(request.getIsOoc());
        if (request.getIsDm() != null && "OWNER".equals(relation)) { // Only allow setting DM flag if explicitly
                                                                     // provided and user is OWNER
            post.setDm(request.getIsDm());
        } else {
            post.setDm(false); // default to false for non-OWNERs or if not provided
        }

        post.setMediaUrls(request.getMediaUrls() != null ? request.getMediaUrls() : List.of());

        post.setEdited(false);
        post.setUpdatedAt(null);

        post.setPinned(false);
        post.setLocked(false);

        // Visibility (optional)
        visibilityPostAsigner(post, request);
        
        postRepository.save(post);
        eventPublisher.publishEvent(new PostCreatedEvent(profile));
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
                        : null);

        post.setCreatedAt(Instant.now());

        post.setOoc(true);
        post.setDm("THREAD_START".equals(request.getType())); // only thread starters are DMs, replies are always OOC

        post.setMediaUrls(request.getMediaUrls() != null ? request.getMediaUrls() : List.of());

        post.setEdited(false);
        post.setUpdatedAt(null);

        post.setPinned(false);
        post.setLocked(false);
        post.setTags(request.getTags() != null ? request.getTags() : List.of());
        postRepository.save(post);
        eventPublisher.publishEvent(new PostCreatedEvent(profile));
        return post;
    }
    
    private void visibilityPostAsigner(Post post, PostCampaignPostsInDTO request) {
        if (request.getVisibleToCharacterIds() != null && !request.getVisibleToCharacterIds().isEmpty()) {
            List<CharacterSheet> visibleCharacters = characterRepository
                    .findAllById(request.getVisibleToCharacterIds());
            if (visibleCharacters.size() != request.getVisibleToCharacterIds().size()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Some character IDs are invalid");
            }
            post.setVisibleToCharacterIds(
                    (new HashSet<>(visibleCharacters.stream().map(CharacterSheet::getId).toList())));
        } else {
            post.setVisibleToCharacterIds(new HashSet<>()); // empty set means visible to all characters
        }
    }
}
