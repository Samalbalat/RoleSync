package com.rolesync.rolesync.model;

import java.time.Instant;
import java.util.Date;

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
@Table(name = "user_metrics")
@Data
@ToString(exclude = "user")
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class UserMetrics {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    @OneToOne
    @JoinColumn(name = "user_id")
    private User user;

    private Date registrationDate;
    private int postsCount;
    private long sessionsCount;
    private float avgSessionTimeSeconds;
    private Date lastSessionTime;


    private double credibilityScore;

    private Instant lastUpdated;
}
