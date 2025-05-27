package com.rolesync.rolesync.enums;

public enum Idioma {
    Español("ES"),
    Inglés("EN"),
    Francés("FR"),
    Alemán("DE"),
    Italiano("IT"),
    Portugués("PT"),
    Ruso("RU"),
    Chino("ZH"),
    Japonés("JA"),
    Coreano("KO"),
    Otro("OT");

    // Cada idioma tiene un código asociado
    private final String codigo;

    Idioma(String codigo) {
        this.codigo = codigo;
    }

    public String getCodigo() {
        return codigo;
    }
}
