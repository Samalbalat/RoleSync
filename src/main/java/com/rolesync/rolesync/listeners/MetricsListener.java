package com.rolesync.rolesync.listeners;

import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

import com.rolesync.rolesync.events.PostCreatedEvent;
import com.rolesync.rolesync.services.ProfileMetricsService;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class MetricsListener {
    
    private final ProfileMetricsService service;

    @TransactionalEventListener(phase = TransactionPhase.BEFORE_COMMIT)
    public void handle(PostCreatedEvent event) {
        if (event == null || event.getAuthor() == null) return;
        service.onPostCreated(event.getAuthor());
    }
}
