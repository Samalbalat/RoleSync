package com.rolesync.rolesync.dto.charactersheetcontroller;

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
    private Boolean required;
    private Integer min;
    private Integer max;
    private Object value;
}
