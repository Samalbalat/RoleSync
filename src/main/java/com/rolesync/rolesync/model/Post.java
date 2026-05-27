package com.rolesync.rolesync.model;

import java.time.Instant;
import java.util.List;
import java.util.Set;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "posts")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Post {

    @Id
    @GeneratedValue
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PostType type; // THREAD_START / REPLY

    private String title;

    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(columnDefinition = "text[]")
    private List<String> tags;

    @Column(columnDefinition = "TEXT")
    private String content;

    
    @Column(name = "author_profile_id", nullable = false)
    private Long authorProfileId;

    @Column(name = "author_character_id")
    private Long authorCharacterId;

    private String authorCharacterName;

    private String authorCharacterImage;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "campaign_id")
    private Campaign campaign;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_post_id")
    private Post parentPost;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    private boolean isOoc;

    private boolean isDm;

    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(name = "media_urls", columnDefinition = "text[]")
    private List<String> mediaUrls;

    private boolean isEdited;

    private Instant updatedAt;

    private boolean isPinned;

    private boolean isLocked;

    @Enumerated(EnumType.STRING)
    private ProfileType rolType; // WRITTEN / TABLETOP

    // VISIBILIDAD POR PERSONAJE (tabla intermedia)
    @ElementCollection
    @CollectionTable(
        name = "post_visible_characters",
        joinColumns = @JoinColumn(name = "post_id")
    )
    @Column(name = "character_id")
    private Set<Long> visibleToCharacterIds;

    @PrePersist
    protected void onCreate() {
        this.createdAt = Instant.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = Instant.now();
        this.isEdited = true;
    }
}
