package com.rolesync.rolesync.dto.campaigncontroller;

import com.rolesync.rolesync.model.ProfileType;

public record CampaignFilter(
        ProfileType type,
        String system,
        String location,
        String language,
        String timeZone,
        String dayWeek,
        String communication,
        String status,
        String search,
        String themes,
        String duration
) {}
