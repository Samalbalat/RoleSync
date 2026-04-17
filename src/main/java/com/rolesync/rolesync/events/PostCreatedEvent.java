package com.rolesync.rolesync.events;

import com.rolesync.rolesync.model.Profile;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class PostCreatedEvent {
    private final Profile author;    
}
