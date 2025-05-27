package com.rolesync.rolesync.repositories;

import org.springframework.data.repository.CrudRepository;

import com.rolesync.rolesync.entities.Perfil;

public interface PerfilRepository extends CrudRepository<Perfil, Long>{
    // No se requiere definir métodos adicionales aquí, ya que CrudRepository proporciona los métodos básicos de CRUD.
    // Puedes agregar métodos personalizados si es necesario, por ejemplo:
}
