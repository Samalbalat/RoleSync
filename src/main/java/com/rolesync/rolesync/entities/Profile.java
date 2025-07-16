package com.rolesync.rolesync.entities;

import java.util.Set;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

// This class represents a user profile in the RoleSync application.
// It contains fields for the user's name, email, phone number, and relationships with campaigns.
// It will also house several statistics about the user, making a history of their activity in the application which will 
// be used to calculate the user's level, experience points and review weights

@Entity
@Table(name = "profile")
public class Profile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    private String email;

    private Integer phone;

    @ManyToMany(mappedBy = "members")
    private Set<Campaign> memberOf;

    @OneToMany(mappedBy = "owner")
    private Set<Campaign> ownerOf;

    // Default constructor
    public Profile() {
    }

    // Constructor with parameters
    public Profile(String name, String email, Integer phone) {
        this.name = name;
        this.email = email;
        this.phone = phone;
    }

    // Getters and Setters
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public Integer getPhone() {
        return phone;
    }

    public void setPhone(Integer phone) {
        this.phone = phone;
    }

    public Set<Campaign> getMemberOf() {
        return memberOf;
    }

    public void setMemberOf(Set<Campaign> memberOf) {
        this.memberOf = memberOf;
    }

    public Set<Campaign> getOwnerOf() {
        return ownerOf;
    }

    public void setOwnerOf(Set<Campaign> ownerOf) {
        this.ownerOf = ownerOf;
    }
}
