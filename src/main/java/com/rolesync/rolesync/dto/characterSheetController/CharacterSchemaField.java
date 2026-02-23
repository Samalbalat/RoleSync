package com.rolesync.rolesync.dto.characterSheetController;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CharacterSchemaField {
    private String key;
    private String label;
    private String type;
}
