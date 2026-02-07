package com.rolesync.rolesync.dto.profileControllerDTOs;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ProfileInDTO {

    String profileName;
    byte[] image;
    String description;
    
}
