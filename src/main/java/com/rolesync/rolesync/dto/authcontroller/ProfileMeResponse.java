package com.rolesync.rolesync.dto.authcontroller;

import lombok.Data;

@Data
public class ProfileMeResponse {
    private String email;
    private String profileName;
    private String roleType;
}
