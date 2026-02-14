package com.rolesync.rolesync.dto.authcontroller;

import lombok.Data;

@Data
public class SignupRequest {
    private String profilename;
    private String roleType;
    private String timeZone;
    private String email;
    private String password;
}