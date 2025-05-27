package com.rolesync.rolesync.enums;

public enum Comunicacion {
    Local("LO"),
    EnPersona("EP"),
    Discord("DI"),
    Twitter("TW"),
    Whatsapp("W"),
    Telegram("TG"),
    Facebook("FB"),
    Otro("OT");

    // Cada tipo de comunicación tiene un código asociado
    private final String codigo;

    Comunicacion(String codigo) {
        this.codigo = codigo;
    }

    public String getCodigo() {
        return codigo;
    }
    
}
