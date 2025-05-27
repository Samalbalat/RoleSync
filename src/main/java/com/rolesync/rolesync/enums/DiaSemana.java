package com.rolesync.rolesync.enums;

public enum DiaSemana {
    LUNES("L"),
    MARTES("M"),
    MIERCOLES("X"),
    JUEVES("J"),
    VIERNES("V"),
    SABADO("S"),
    DOMINGO("D");

    // Cada día de la semana tiene un código asociado
    private final String codigo;

    DiaSemana(String codigo) {
        this.codigo = codigo;
    }

    public String getCodigo() {
        return codigo;
    }
    
}
