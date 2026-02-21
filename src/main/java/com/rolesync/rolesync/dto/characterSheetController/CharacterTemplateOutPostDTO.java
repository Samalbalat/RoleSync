package com.rolesync.rolesync.dto.characterSheetController;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CharacterTemplateOutPostDTO {

    private Long id;
    private String campaign_id;
    private String campaign_name;
    private String schema_definition;
    
}