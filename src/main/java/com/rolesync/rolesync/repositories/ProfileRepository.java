package com.rolesync.rolesync.repositories;

import org.springframework.data.repository.CrudRepository;

import com.rolesync.rolesync.entities.Profile;

public interface ProfileRepository extends CrudRepository<Profile, Long>{
    // No need to add any methods here, as we are using the default CRUD operations
    // provided by CrudRepository.
}
