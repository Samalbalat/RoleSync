package com.rolesync.rolesync.dto.charactersheetcontroller;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CharacterSheetInPostDTO {
    
    private String name;    
    private String avatar_url;
    private Boolean isPublic;
    private Long campaign_id;
    private Long template_id;
    private List<CharacterSchemaField> attributes;
}
