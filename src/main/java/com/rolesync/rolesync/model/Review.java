package com.rolesync.rolesync.model;

import java.time.Instant;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Data;

@Entity
@Data
@Table(name = "reviews", uniqueConstraints = {
    @UniqueConstraint(columnNames={"reviewer_id", "target_id", "target_type"}) // Ensure one review per reviewer per target
})

public class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "reviewer_id")
    private Profile reviewer;

    private Long targetId;
    private String targetType;

    private int rawScore;
    private float normalizedScore;

    @Column(columnDefinition = "TEXT")
    private String comment;

    private Float credibilityScore;
    private Float qualityScore;
    private Float finalScore;

    private Instant createdAt;
}
