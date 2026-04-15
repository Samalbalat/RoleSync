package com.rolesync.rolesync.model.idclasses;

import java.io.Serializable;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class RatingSummaryId implements Serializable {

    private Long targetId;
    private String targetType;
}
