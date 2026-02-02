package com.rolesync.rolesync.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

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

    public User(String email, String password, String timeZone) {
        this.email = email;
        this.password = password;
        this.timeZone = timeZone;
    }
}
