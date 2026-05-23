package com.rolesync.rolesync.events;

import com.rolesync.rolesync.model.User;
import com.rolesync.rolesync.model.UserMetrics;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class SessionClosedEvent {
    private final User author;
    private final UserMetrics metrics;
}
