package com.rolesync.rolesync.model;

import java.util.Set;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

/**
 * The Profile class represents a user profile in the RoleSync application.
 * The profile data is stored in the database and can be retrieved and updated by authenticated users through the ProfileController endpoints.
 * Each username can have two profiles, one for each profile type (Tabletop and Written), but the profilename must be unique across all profiles.
 */
@Entity
@Table(name = "profiles", uniqueConstraints = {
    @UniqueConstraint(columnNames={"user", "profileType"}), @UniqueConstraint(columnNames = "profilename")
})
@Getter
@Setter
@AllArgsConstructor
@ToString(exclude = {"sheets","reviews","campaigns"})
@NoArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class Profile {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    @ManyToOne
    @JoinColumn(name="user_id", nullable=true)
    private User user;

    @Column(nullable = false)
    private String profilename;

    private String description;
    
    @Enumerated(EnumType.STRING)
    private ProfileType profileType;

    private String image; // JSON string to hold profile attributes

    @OneToMany(mappedBy = "owner")
    private Set<CharacterSheet> sheets;

    @OneToMany(mappedBy = "reviewer")
    private Set<Review> reviews;

    @OneToMany(mappedBy = "owner")
    private Set<Campaign> campaigns;

    public Profile(User user,
                   String profilename,
                   ProfileType profileType,
                   String description,
                   String image,
                   Set<CharacterSheet> sheets) {
        this.user = user;
        this.profilename = profilename;
        this.profileType = profileType;
        this.description = description != null ? description : "";
        this.image = image;
        this.sheets = sheets;
    }

    public Profile(User user,
                   String profilename,
                   ProfileType profileType,
                   String image) {
        this(user, profilename, profileType, "", image, null);
    }

    public static Profile of(User user,
                             String profilename,
                             String profileType,
                             String description,
                             String image,
                             Set<CharacterSheet> sheets) {
        return new Profile(
            user,
            profilename,
            ProfileType.valueOf(profileType),
            description,
            image,
            sheets
        );
    }
}
