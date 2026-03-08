package com.rolesync.rolesync.model;

import java.util.List;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import com.rolesync.rolesync.dto.charactersheetcontroller.CharacterSchemaField;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "sheets")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CharacterSheet {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "schema", columnDefinition = "jsonb")
    private List<CharacterSchemaField> schema;

    private String image;
    private Boolean isTemplate;
    private Boolean isPublic;
    
    @ManyToOne
    @JoinColumn(name="campaign_id", nullable=true)
    private Campaign campaign;

    @ManyToOne
    @JoinColumn(name="profile_id", nullable=false)
    private Profile owner;
    
    
}
