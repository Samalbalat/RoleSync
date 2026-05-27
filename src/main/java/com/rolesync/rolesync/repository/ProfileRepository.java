package com.rolesync.rolesync.repository;

import com.rolesync.rolesync.model.Profile;
import com.rolesync.rolesync.model.ProfileType;
import com.rolesync.rolesync.model.User;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProfileRepository extends JpaRepository<Profile, Long> {
    Optional<Profile> findByProfilename(String profilename);
    List<Profile> findAllByUser(User user);
    Optional<Profile> findByUserAndProfileType(User user, ProfileType profileType);
    Boolean existsByUserAndProfileType(User user, ProfileType profileType);
    Boolean existsByProfilename(String profilename);
}


