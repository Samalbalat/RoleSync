package com.rolesync.rolesync.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "profiles", uniqueConstraints = {
    @UniqueConstraint(columnNames={"username", "profileType"}), @UniqueConstraint(columnNames = "profilename")
})
@Data
@NoArgsConstructor
public class Profile {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String username;
    private String profilename;
    private String description;
    private ProfileType profileType;

    @Lob
    private byte[] image; // JSON string to hold profile attributes

    public Profile(String username, String profilename, String profileType, byte[] image) {
        this.username = username;
        this.profilename = profilename;
        this.profileType = ProfileType.valueOf(profileType);
        this.image = image;
        this.description = "";
    }

    public Profile(String username, String profilename, String profileType, String description, byte[] image) {
        this.username = username;
        this.profilename = profilename;
        this.profileType = ProfileType.valueOf(profileType);
        this.description = description;
        this.image = image;
        
    }
}