package com.rolesync.rolesync.model;

import java.util.Set;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * The User class represents a user in the RoleSync application. It contains information such as the user's email, password, and time zone.
 * The User entity is stored in the database and can be retrieved and updated by authenticated users through the UserController endpoints. 
 * The email field is unique to ensure that each user has a distinct identifier for authentication purposes.
 */
@Entity
@Table(name = "users", uniqueConstraints = {
    @UniqueConstraint(columnNames = "email")
})
@Data
@NoArgsConstructor
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String email;
    private String password;
    private String timeZone;

    @OneToMany(mappedBy = "owner")
    private Set<CharacterSheet> sheets;

    public User(String email, String password, String timeZone) {
        this.email = email;
        this.password = password;
        this.timeZone = timeZone;
    }
}
