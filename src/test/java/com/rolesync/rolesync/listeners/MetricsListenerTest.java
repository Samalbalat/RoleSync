package com.rolesync.rolesync.listeners;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import com.rolesync.rolesync.events.PostCreatedEvent;
import com.rolesync.rolesync.events.SessionClosedEvent;
import com.rolesync.rolesync.model.User;
import com.rolesync.rolesync.services.UserMetricsService;

class MetricsListenerTest {

    @Mock
    private UserMetricsService service;

    private MetricsListener listener;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        listener = new MetricsListener(service);
    }

    @Test
    void handlePostCreatedEventShouldCallService() {
        User author = new User();

        PostCreatedEvent event = mock(PostCreatedEvent.class);

        org.mockito.Mockito.when(event.getAuthor())
                .thenReturn(author);

        listener.handle(event);

        verify(service).onPostCreated(author);
    }

    @Test
    void handlePostCreatedEventShouldIgnoreNullEvent() {
        listener.handle((PostCreatedEvent) null);

        verifyNoInteractions(service);
    }

    @Test
    void handlePostCreatedEventShouldIgnoreEventWithoutAuthor() {
        PostCreatedEvent event = mock(PostCreatedEvent.class);

        org.mockito.Mockito.when(event.getAuthor())
                .thenReturn(null);

        listener.handle(event);

        verify(service, never()).onPostCreated(org.mockito.ArgumentMatchers.any());
    }

    @Test
    void handleSessionClosedEventShouldCallService() {
        User author = new User();

        SessionClosedEvent event = mock(SessionClosedEvent.class);

        org.mockito.Mockito.when(event.getAuthor())
                .thenReturn(author);

        listener.handle(event);

        verify(service).onSessionClosed(author);
    }

    @Test
    void handleSessionClosedEventShouldIgnoreNullEvent() {
        listener.handle((SessionClosedEvent) null);

        verifyNoInteractions(service);
    }

    @Test
    void handleSessionClosedEventShouldIgnoreEventWithoutAuthor() {
        SessionClosedEvent event = mock(SessionClosedEvent.class);

        org.mockito.Mockito.when(event.getAuthor())
                .thenReturn(null);

        listener.handle(event);

        verify(service, never()).onSessionClosed(org.mockito.ArgumentMatchers.any());
    }
}