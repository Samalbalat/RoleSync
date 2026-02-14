package com.rolesync.rolesync.dto.usercontroller;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SimpleProfileDTO {

    private Long id;
    private String profileName;
    private byte[] image;
    
}
