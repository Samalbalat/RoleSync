package com.rolesync.rolesync.dto.usercontroller;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class UserInfoResponse {
    private Long id;
    private String username;
    private String email;
}