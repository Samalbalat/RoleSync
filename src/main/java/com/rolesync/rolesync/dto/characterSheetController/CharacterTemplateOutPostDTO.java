package com.rolesync.rolesync.dto.charactersheetcontroller;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CharacterTemplateOutPostDTO {

    private Long id;
    private String name;
    private String campaign_id;
    private String campaign_name;
    private List<CharacterSchemaField> schema_definition;
    
}