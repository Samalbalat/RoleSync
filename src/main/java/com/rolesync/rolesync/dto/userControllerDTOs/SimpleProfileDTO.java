package com.rolesync.rolesync.dto.userControllerDTOs;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class SimpleProfileDTO {

    private Long id;
    private String profileName;
    private byte[] image;

    public SimpleProfileDTO() {
    }
    
}
