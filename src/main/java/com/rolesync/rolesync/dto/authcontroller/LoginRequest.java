package com.rolesync.rolesync.dto.authcontroller;

import lombok.Data;

@Data
public class LoginRequest {
    private String email;
    private String password;
}