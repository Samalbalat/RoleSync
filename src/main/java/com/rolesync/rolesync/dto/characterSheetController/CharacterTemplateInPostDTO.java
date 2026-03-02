package com.rolesync.rolesync.dto.charactersheetcontroller;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CharacterTemplateInPostDTO {

    private List<CharacterSchemaField> schema_definition;
    
}
