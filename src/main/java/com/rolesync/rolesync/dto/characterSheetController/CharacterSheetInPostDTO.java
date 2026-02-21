package com.rolesync.rolesync.dto.characterSheetController;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CharacterSheetInPostDTO {
    
    private String name;    
    private String avatar_url;
    private String campaign_id;
    private String template_id;
    private String attributes;
}
