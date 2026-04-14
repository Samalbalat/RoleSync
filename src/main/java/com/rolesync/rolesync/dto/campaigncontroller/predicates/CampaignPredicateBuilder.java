package com.rolesync.rolesync.dto.campaigncontroller.predicates;

import com.querydsl.core.types.dsl.BooleanExpression;
import com.querydsl.core.types.dsl.Expressions;
import com.querydsl.core.types.dsl.StringPath;
import com.rolesync.rolesync.dto.campaigncontroller.CampaignFilter;
import com.rolesync.rolesync.model.CampaignStatus;
import com.rolesync.rolesync.model.QCampaign;

public class CampaignPredicateBuilder {
    private static final QCampaign Q = QCampaign.campaign;

    public BooleanExpression build(CampaignFilter f) {
        BooleanExpression predicate = Q.campaignType.eq(f.type())
                .and(Q.status.ne(CampaignStatus.DELETED));

        predicate = andString(predicate, Q.system, f.system());
        predicate = andString(predicate, Q.location, f.location());
        predicate = andString(predicate, Q.language, f.language());
        predicate = andString(predicate, Q.timeZone, f.timeZone());
        predicate = andString(predicate, Q.dayWeek, f.dayWeek());
        predicate = andString(predicate, Q.communication, f.communication());
        predicate = andString(predicate, Q.duration, f.duration());

        if (f.status() != null && !f.status().isBlank()) {
            predicate = predicate.and(
                    Q.status.eq(CampaignStatus.valueOf(f.status().toUpperCase())));
        }

        if (f.themes() != null && !f.themes().isBlank()) {
            predicate = predicate.and(
                    Expressions.booleanTemplate(
                            "CAST({0} AS text) ilike {1}",
                            Q.themes,
                            "%" + f.themes() + "%"));
        }

        if (f.search() != null && !f.search().isBlank()) {
            predicate = predicate.and(buildSearch(f.search()));
        }

        return predicate;
    }

    private BooleanExpression andString(BooleanExpression base, StringPath path, String value) {
        if (value == null || value.isBlank())
            return base;
        return base.and(path.containsIgnoreCase(value));
    }

    private BooleanExpression buildSearch(String search) {
        String[] keywords = search.trim().split("\\s+");

        BooleanExpression expr = Q.name.containsIgnoreCase(keywords[0]);

        for (int i = 1; i < keywords.length; i++) {
            expr = expr.and(Q.name.containsIgnoreCase(keywords[i]));
        }

        return expr;
    }
}