package com.rolesync.rolesync.entities;

import java.util.Set;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;

// This class represents a character sheet in the RoleSync application.
// It contains various fields that can be used to store character information.
@Entity(name="characterSheet")
public class CharacterSheet {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToMany(mappedBy = "sheet")
    private Set<CharacterSheetField> fields;

}
