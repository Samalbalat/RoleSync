package com.rolesync.rolesync.repositories;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.rolesync.rolesync.entities.Profile;

public interface ProfileRepository extends JpaRepository<Profile, Long>{
    // No need to add any methods here, as we are using the default CRUD operations
    // provided by JpaRepository.

    Optional<Profile> findByName(String name);
}
