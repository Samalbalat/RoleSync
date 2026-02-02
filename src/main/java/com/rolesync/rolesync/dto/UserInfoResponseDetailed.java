package com.rolesync.rolesync.dto;
import java.util.List;

import com.rolesync.rolesync.model.Profile;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class UserInfoResponseDetailed {
    Long id;
    String email;
    String timeZone;
    List<Profile> profiles;

    public UserInfoResponseDetailed() {
    }
}
