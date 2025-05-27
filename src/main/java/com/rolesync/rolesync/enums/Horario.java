package com.rolesync.rolesync.enums;

public enum Horario {
    GMTE0("GMT+0"),
    GMTE1("GMT+1"),GMTE2("GMT+2"),
    GMTE3("GMT+3"),GMTE4("GMT+4"),
    GMTE5("GMT+5"),GMTE6("GMT+6"),
    GMTE7("GMT+7"),GMTE8("GMT+8"),
    GMTE9("GMT+9"),GMTE10("GMT+10"),
    GMTE11("GMT+11"),GMTE12("GMT+12"),
    GMTW1("GMT-1"),GMTW2("GMT-2"),
    GMTW3("GMT-3"),GMTW4("GMT-4"),
    GMTW5("GMT-5"),GMTW6("GMT-6"),
    GMTW7("GMT-7"),GMTW8("GMT-8"),
    GMTW9("GMT-9"),GMTW10("GMT-10"),
    GMTW11("GMT-11"),GMTW12("GMT-12");

    // Cada horario tiene un código asociado
    private final String codigo;

    Horario(String codigo) {
        this.codigo = codigo;
    }

    public String getCodigo() {
        return codigo;
    }

    
    
}
