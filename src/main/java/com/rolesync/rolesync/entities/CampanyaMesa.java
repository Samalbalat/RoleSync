package com.rolesync.rolesync.entities;

import java.util.Set;

import com.rolesync.rolesync.enums.Comunicacion;
import com.rolesync.rolesync.enums.DiaSemana;
import com.rolesync.rolesync.enums.Horario;
import com.rolesync.rolesync.enums.Idioma;
import com.rolesync.rolesync.enums.Sistema;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;

@Entity
@DiscriminatorValue("M")
public class CampanyaMesa extends Campanya {

    public CampanyaMesa() {
    }

    public CampanyaMesa(String nombre, String tematica, String descripcion, Perfil propietario, Set<Perfil> miembros,
            Set<Comunicacion> comunicacion, Set<Idioma> idiomas, Horario horario, String imagen, Sistema sistema,
            DiaSemana diaSemana, String frecuencia, Double duracion, String localizacion) {
        super(nombre, tematica, descripcion, propietario, miembros, comunicacion, idiomas, horario, imagen);
        this.sistema = sistema;
        this.diaSemana = diaSemana;
        this.frecuencia = frecuencia;
        this.duracion = duracion;
        this.localizacion = localizacion;
    }

    @Enumerated(EnumType.STRING)
    private Sistema sistema;

    @Enumerated(EnumType.STRING)
    private DiaSemana diaSemana;

    private String frecuencia;

    private Double duracion;

    private String localizacion;

    public Sistema getSistema() {
        return sistema;
    }

    public void setSistema(Sistema sistema) {
        this.sistema = sistema;
    }

    public DiaSemana getDiaSemana() {
        return diaSemana;
    }

    public void setDiaSemana(DiaSemana diaSemana) {
        this.diaSemana = diaSemana;
    }

    public String getFrecuencia() {
        return frecuencia;
    }

    public void setFrecuencia(String frecuencia) {
        this.frecuencia = frecuencia;
    }

    public Double getDuracion() {
        return duracion;
    }

    public void setDuracion(Double duracion) {
        this.duracion = duracion;
    }

    public String getLocalizacion() {
        return localizacion;
    }

    public void setLocalizacion(String localizacion) {
        this.localizacion = localizacion;
    }
    
}