package com.rolesync.rolesync.entities;

import java.util.Set;

import com.rolesync.rolesync.enums.Comunicacion;
import com.rolesync.rolesync.enums.Horario;
import com.rolesync.rolesync.enums.Idioma;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;

@Entity
@DiscriminatorValue("E")
public class CampanyaEscrito extends Campanya {
    
    public CampanyaEscrito(String nombre, String tematica, String descripcion, Perfil propietario, Set<Perfil> miembros,
            Set<Comunicacion> comunicacion, Set<Idioma> idiomas, Horario horario, String imagen) {

        super(nombre, tematica, descripcion, propietario, miembros, comunicacion, idiomas, horario, imagen);
    }
}