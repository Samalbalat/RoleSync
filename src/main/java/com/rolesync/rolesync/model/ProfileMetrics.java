package com.rolesync.rolesync.model;

import java.time.Instant;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;

@Entity
@Table(name = "profile_metrics")
@Data
@ToString(exclude = "profile")
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class ProfileMetrics {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    @OneToOne
    @JoinColumn(name = "profile_id")
    private Profile profile;

    private int postsCount;
    private int campaignsCount;
    private int repliesCount;

    private float credibilityScore;

    private Instant lastUpdated;
}
