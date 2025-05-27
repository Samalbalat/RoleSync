package com.rolesync.rolesync.entities;

import java.util.Set;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

@Entity
@Table(name = "perfil")
public class Perfil {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nombre;

    private String email;

    private Integer telefono;

    @ManyToMany(mappedBy = "miembros")
    private Set<Campanya> campanyasMiembro;

    @OneToMany(mappedBy = "propietario")
    private Set<Campanya> campanyasPropietario;

    // Constructor por defecto
    public Perfil() {
    }

    // Constructor con parámetros
    public Perfil(String nombre, String email, Integer telefono) {
        this.nombre = nombre;
        this.email = email;
        this.telefono = telefono;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public Integer getTelefono() {
        return telefono;
    }

    public void setTelefono(Integer telefono) {
        this.telefono = telefono;
    }

    public Set<Campanya> getCampanyasMiembro() {
        return campanyasMiembro;
    }

    public void setCampanyasMiembro(Set<Campanya> campanyasMiembro) {
        this.campanyasMiembro = campanyasMiembro;
    }

    public Set<Campanya> getCampanyasPropietario() {
        return campanyasPropietario;
    }

    public void setCampanyasPropietario(Set<Campanya> campanyasPropietario) {
        this.campanyasPropietario = campanyasPropietario;
    }
    
}
