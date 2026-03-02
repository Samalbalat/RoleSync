package com.rolesync.rolesync.dto.charactersheetcontroller;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CharacterTemplateGetOutDTO {

    private Long id;
    private Long campaign_id;
    private String campaign_name;
    private String schema_definition;
    
}