package com.rolesync.rolesync.dto.charactersheetcontroller;

import java.util.List;

import com.rolesync.rolesync.model.CharacterSheet;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CharacterSheetGetOutDTO {

    private Long id;
    private Long userId;
    private String name;
    private String avatarUrl;
    private Long campaignId;
    private String campaignName;
    private Long templateId;
    private List<CharacterSchemaField> schema;

    public CharacterSheetGetOutDTO(CharacterSheet sheet) {
        this.id = sheet.getId();
        this.userId = sheet.getOwner().getId();
        this.name = sheet.getName();
        this.avatarUrl = sheet.getImage();
        this.campaignId = sheet.getCampaign().getId();
        this.campaignName = sheet.getCampaign().getName();
        this.templateId = sheet.getTemplate().getId();
        this.schema = sheet.getSchema();
    }
    
}
