package com.rolesync.rolesync.entities;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;

@Entity(name="characterSheetField")
public class CharacterSheetField {
    // This class represents a field in a character sheet.
    // It can be used to store various types of data related to a character's attributes, skills, etc.
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name; // The name of the field
    private String value; // The value of the field
    
    @ManyToOne
    @JoinColumn(name="characterSheetId", nullable=false)
    private CharacterSheet sheet; // The character sheet this field belongs to

    public CharacterSheetField(String name, String value) {
        this.name = name;
        this.value = value;
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getValue() {
        return value;
    }

    public void setValue(String value) {
        this.value = value;
    }

    public CharacterSheet getSheet() {
        return sheet;
    }

    public void setSheet(CharacterSheet sheet) {
        this.sheet = sheet;
    }
}