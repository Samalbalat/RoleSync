package com.rolesync.rolesync.repositories;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import java.time.Instant;
import java.util.List;
import com.querydsl.jpa.impl.JPAQuery;
import com.querydsl.jpa.impl.JPAQueryFactory;
import com.rolesync.rolesync.model.Post;
import com.rolesync.rolesync.repository.implementations.PostRepositoryImpl;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Answers;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

@MockitoSettings(strictness = Strictness.LENIENT)
@ExtendWith(MockitoExtension.class)
class PostRepositoryImplTest {

    @Mock
    private JPAQueryFactory queryFactory;

    @Mock(answer = Answers.RETURNS_SELF)
    private JPAQuery<Post> postQuery;

    @Mock(answer = Answers.RETURNS_SELF)
    private JPAQuery<Long> longQuery;

    private PostRepositoryImpl repository;

    @BeforeEach
    void setUp() {
        repository = new PostRepositoryImpl(queryFactory);
    }

    // -------------------------
    // Helpers
    // -------------------------
    @SuppressWarnings({ "rawtypes", "unchecked" })
    private void stubPostQueryChain() {

        when(queryFactory.selectFrom(any()))
                .thenReturn((JPAQuery) postQuery);

        when(postQuery.fetch())
                .thenReturn(List.of(new Post()));
    }

    @SuppressWarnings({"unchecked" })
    private void stubLongQueryChain() {

        when(queryFactory.select(any(com.querydsl.core.types.Expression.class)))
                .thenReturn(longQuery);

        when(longQuery.fetchOne())
                .thenReturn(10L);
    }

    // -------------------------
    // findCampaignPosts
    // -------------------------
    @Test
    void findCampaignPosts_basicFlow_withAccessingCharacter() {
        stubPostQueryChain();

        List<Post> result = repository.findCampaignPosts(
                1L,
                Instant.now(),
                10,
                99L);

        assertEquals(1, result.size());

        verify(queryFactory).selectFrom(any());
        verify(postQuery).limit(11); // limit + 1
        verify(postQuery).fetch();
    }

    @Test
    void findCampaignPosts_withoutCursor_andNoAccessCharacter() {
        stubPostQueryChain();

        List<Post> result = repository.findCampaignPosts(
                1L,
                null,
                5,
                null);

        assertEquals(1, result.size());
        verify(postQuery).limit(6);
    }

    // -------------------------
    // findForumPosts
    // -------------------------
    @Test
    void findForumPosts_returnsPosts() {
        stubPostQueryChain();

        List<Post> result = repository.findForumPosts();

        assertEquals(1, result.size());
        verify(queryFactory).selectFrom(any());
        verify(postQuery).fetch();
    }

    // -------------------------
    // findPostReplies
    // -------------------------
    @Test
    void findPostReplies_withCursor() {
        stubPostQueryChain();

        List<Post> result = repository.findPostReplies(1L, Instant.now(), 10);

        assertEquals(1, result.size());
        verify(postQuery).limit(11);
    }

    @Test
    void findPostReplies_withoutCursor() {
        stubPostQueryChain();

        List<Post> result = repository.findPostReplies(1L, null, 10);

        assertEquals(1, result.size());
        verify(postQuery).limit(11);
    }

    // -------------------------
    // findPostsByTags
    // -------------------------
    @Test
    void findPostsByTags_withTags() {
        stubPostQueryChain();

        List<Post> result = repository.findPostsByTags(List.of("rpg", "fantasy"), 10, 0);

        assertEquals(1, result.size());
        verify(postQuery).offset(0);
        verify(postQuery).limit(10);
    }

    @Test
    void findPostsByTags_emptyTags() {
        stubPostQueryChain();

        List<Post> result = repository.findPostsByTags(List.of(), 10, 0);

        assertEquals(1, result.size());
    }

    // -------------------------
    // findPostsByAuthorId
    // -------------------------
    @Test
    void findPostsByAuthorId_basic() {
        stubPostQueryChain();

        List<Post> result = repository.findPostsByAuthorId(42L, 10, 5);

        assertEquals(1, result.size());
        verify(postQuery).offset(5);
        verify(postQuery).limit(10);
    }

    // -------------------------
    // countForumPostsByAuthorId
    // -------------------------
    @Test
    void countForumPostsByAuthorId_returnsCount() {
        stubLongQueryChain();

        Long result = repository.countForumPostsByAuthorId(42L);

        assertEquals(10L, result);
        verify(longQuery).fetchOne();
    }

    // -------------------------
    // countForumPostsByTags
    // -------------------------
    @Test
    void countForumPostsByTags_withTags() {
        stubLongQueryChain();

        Long result = repository.countForumPostsByTags(List.of("rpg"));

        assertEquals(10L, result);
        verify(longQuery).fetchOne();
    }

    @Test
    void countForumPostsByTags_emptyTags() {
        stubLongQueryChain();

        Long result = repository.countForumPostsByTags(List.of());

        assertEquals(10L, result);
        verify(longQuery).fetchOne();
    }
}
