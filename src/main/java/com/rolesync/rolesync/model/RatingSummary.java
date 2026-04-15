package com.rolesync.rolesync.model;

import com.rolesync.rolesync.model.idclasses.RatingSummaryId;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Data;

@Entity
@Table(name = "rating_summary", uniqueConstraints = {
    @UniqueConstraint(columnNames={"targetId", "targetType"})
})
@Data
@IdClass(RatingSummaryId.class)
public class RatingSummary {

    @Id
    private Long targetId;

    @Id
    private String targetType;

    private int reviewCount;
    private float weightedSum;
    private float bayesianScore;
}
