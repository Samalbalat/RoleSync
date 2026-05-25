package com.rolesync.rolesync.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

import org.hibernate.annotations.Check;

@Entity
@Table(name = "reviews",
       uniqueConstraints = {
           @UniqueConstraint(name = "uk_author_target",
               columnNames = {"reviewer_id", "targetType", "targetId"})
       }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Quién escribe la reseña
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewer_id", nullable = false)
    private Profile reviewer;

    // A qué se aplica la reseña
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ReviewTargetType targetType;

    @Column(nullable = false)
    private Long targetId;

    // Datos de la reseña
    @Column(nullable = false)
    @Check(constraints = "rating >= 1 AND rating <= 5")
    private Integer rating; // 1–5

    private Double weight;

    @Column(columnDefinition = "TEXT")
    private String comment;

    @Column(nullable = false)
    private Instant createdAt;

    @Column(nullable = false)
    private Instant updatedAt;
}
