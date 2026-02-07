package com.rolesync.rolesync.dto.userControllerDTOs;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class UserInfoResponseDetailed {
    Long id;
    String email;
    String timeZone;
    List<SimpleProfileDTO> profiles;

    public UserInfoResponseDetailed() {
    }
}
