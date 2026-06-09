package com.rolesync.rolesync.dto.usercontroller;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserPutInDTO {

    private String email;
    private String timeZone;
    private String password;
    private String oldPassword;
    
}
