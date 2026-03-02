package com.rolesync.rolesync.dto.profilecontroller;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ProfileInDTO {

    String profileName;
    byte[] image;
    String description;
    
}
