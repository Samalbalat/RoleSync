package com.rolesync.rolesync.repository;

import com.rolesync.rolesync.model.Profile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProfileRepository extends JpaRepository<Profile, Long> {
    Optional<Profile> findByProfilename(String profilename);
    List<Profile> findAllByUsername(String username);
    Optional<Profile> findByUsernameAndProfileType(String username, String profileType);
    Boolean existsByUsernameAndProfileType(String username, String profileType);
    Boolean existsByProfilename(String profilename);
}


