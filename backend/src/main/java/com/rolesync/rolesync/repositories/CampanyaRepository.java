package com.rolesync.rolesync.repositories;

import org.springframework.data.repository.CrudRepository;

import com.rolesync.rolesync.entities.Campanya;;

public interface CampanyaRepository extends CrudRepository<Campanya, Long> {
    // No need to add any methods here, as we are using the default CRUD operations
    // provided by CrudRepository.
}