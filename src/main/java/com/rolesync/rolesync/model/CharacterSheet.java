package com.rolesync.rolesync.model;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
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
    private String schema;

    private String image;
    private Boolean isTemplate;
    private Long campaignId;
    private String campaignName;
    
    
}
