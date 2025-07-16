package com.rolesync.rolesync.enums;

public enum Communication {
    Local("LO"),
    InPerson("IP"),
    Discord("DI"),
    Twitter("TW"),
    Whatsapp("W"),
    Telegram("TG"),
    Facebook("FB"),
    Otro("OT");
    // More can be added as needed

    // Each enum constant has a code associated with it
    // This code can be used for serialization or other purposes
    private final String code;

    Communication(String code) {
        this.code = code;
    }

    public String getCode() {
        return code;
    }
    
}
