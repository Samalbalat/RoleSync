package com.rolesync.rolesync.entities;

import java.util.Set;

import com.rolesync.rolesync.enums.Comunicacion;
import com.rolesync.rolesync.enums.Horario;
import com.rolesync.rolesync.enums.Idioma;

import jakarta.persistence.DiscriminatorColumn;
import jakarta.persistence.DiscriminatorType;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Inheritance;
import jakarta.persistence.InheritanceType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;

@Entity(name="campanya")
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
@DiscriminatorColumn(name="tipo_campanya", 
  discriminatorType = DiscriminatorType.STRING)
public class Campanya {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    //El campo nombre representa el título de la campaña
    private String nombre;

    //El campo tematica representa la temática de la campaña
    private String tematica;

    //El campo descripcion representa una breve descripción de la campaña
    private String descripcion;

    //El campo propietario representa al dueño de la campaña
    @ManyToOne
    @JoinColumn(name="perfil_id", nullable=false)
    private Perfil propietario;
    
    //Este campo representa a los miembros de la campaña
    @ManyToMany
    @JoinTable(name = "miembros_campanyas", 
    joinColumns = @JoinColumn(name = "campanya_id"), 
    inverseJoinColumns = @JoinColumn(name = "perfil_id"))
    private Set<Perfil> miembros;
    
    //Este campo representa los canales de comunicación disponibles para la campaña
    private Set<Comunicacion> comunicacion;

    //Este campo representa los idiomas disponibles para la campaña
    private Set<Idioma> idiomas;

    //Este campo representa el horario de la campaña
    private Horario horario;

    //Este campo representa la imagen asociada a la campaña
    private String imagen;

    public Campanya() {
    }

    public Campanya(String nombre, String tematica, String descripcion, Perfil propietario, Set<Perfil> miembros,
            Set<Comunicacion> comunicacion, Set<Idioma> idiomas, Horario horario, String imagen) {
        this.nombre = nombre;
        this.tematica = tematica;
        this.descripcion = descripcion;
        this.propietario = propietario;
        this.miembros = miembros;
        this.comunicacion = comunicacion;
        this.idiomas = idiomas;
        this.horario = horario;
        this.imagen = imagen;
    }

    public Long getId() {
        return id;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getTematica() {
        return tematica;
    }

    public void setTematica(String tematica) {
        this.tematica = tematica;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    public Perfil getPropietario() {
        return propietario;
    }

    public void setPropietario(Perfil propietario) {
        this.propietario = propietario;
    }

    public Set<Perfil> getMiembros() {
        return miembros;
    }

    public void setMiembros(Set<Perfil> miembros) {
        this.miembros = miembros;
    }

    public Set<Comunicacion> getComunicacion() {
        return comunicacion;
    }

    public void setComunicacion(Set<Comunicacion> comunicacion) {
        this.comunicacion = comunicacion;
    }

    public Set<Idioma> getIdiomas() {
        return idiomas;
    }

    public void setIdiomas(Set<Idioma> idiomas) {
        this.idiomas = idiomas;
    }

    public Horario getHorario() {
        return horario;
    }

    public void setHorario(Horario horario) {
        this.horario = horario;
    }

    public String getImagen() {
        return imagen;
    }

    public void setImagen(String imagen) {
        this.imagen = imagen;
    }

}
