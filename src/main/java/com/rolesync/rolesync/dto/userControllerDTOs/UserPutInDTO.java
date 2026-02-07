package com.rolesync.rolesync.dto.userControllerDTOs;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class UserPutInDTO {

    private String email;
    private String timeZone;
    private String password;
    
}
