package com.rolesync.rolesync.services;

import java.time.Instant;
import java.util.List;

import org.springframework.stereotype.Service;

import com.rolesync.rolesync.model.Profile;
import com.rolesync.rolesync.model.ProfileMetrics;
import com.rolesync.rolesync.repository.ProfileMetricsRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
@Service
@RequiredArgsConstructor
public class ProfileMetricsService {

    // -----------------------------
    // EVENT HANDLERS (ENTRY POINTS)
    // -----------------------------

    private final ProfileMetricsRepository repo;

    @Transactional
    public void onPostCreated(Profile profile) {
        repo.incrementPosts(profile);     // atomic DB update
        recomputeScore(profile);          // recompute after change
    }

    @Transactional
    public void onReplyCreated(Profile profile) {
        repo.incrementReplies(profile);
        recomputeScore(profile);
    }

    @Transactional
    public void onCampaignCreated(Profile profile) {
        repo.incrementCampaigns(profile);
        recomputeScore(profile);
    }

    // -----------------------------
    // SCORE LOGIC
    // -----------------------------

    @Transactional
    public void recomputeScore(Profile profile) {
        ProfileMetrics m = repo.findByProfile(profile)
                .orElseThrow(() -> new IllegalStateException("Metrics not found"));

        float score = computeScore(m);

        m.setCredibilityScore(score);
        m.setLastUpdated(Instant.now());
    }

    private float computeScore(ProfileMetrics m) {
        // --- simple version ---
        float postsWeight = 1.0f;
        float repliesWeight = 0.5f;
        float campaignsWeight = 2.0f;

        return (m.getPostsCount() * postsWeight)
             + (m.getRepliesCount() * repliesWeight)
             + (m.getCampaignsCount() * campaignsWeight);

        // --- alternative (better scaling) ---
        // float activity = m.getPostsCount() + m.getRepliesCount();
        // return (float) (Math.log1p(activity) + (m.getCampaignsCount() * 2));
    }

    // -----------------------------
    // BULK / REPAIR
    // -----------------------------

    @Transactional
    public void recomputeAll() {
        List<ProfileMetrics> all = repo.findAll();

        for (ProfileMetrics m : all) {
            m.setCredibilityScore(computeScore(m));
            m.setLastUpdated(Instant.now());
        }
    }
    
}
