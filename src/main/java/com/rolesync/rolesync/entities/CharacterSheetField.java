package com.rolesync.rolesync.entities;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;

// This class represents a field in a character sheet.
// It can be used to store various types of data related to a character's attributes, skills, etc.
@Entity(name = "characterSheetField")
public class CharacterSheetField {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // This field represents the name of the character sheet field
    private String name;

    // This field represents the value of the character sheet field
    private String value;

    @ManyToOne
    @JoinColumn(name = "characterSheetId", nullable = false)
    private CharacterSheet sheet; // The character sheet this field belongs to

    public CharacterSheetField() {
        // Default constructor for JPA
    }

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