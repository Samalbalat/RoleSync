package com.rolesync.rolesync.enums;

public enum Communication {
    LOCAL("LO"),
    IN_PERSON("IP"),
    DISCORD("DI"),
    TWITTER("TW"),
    WHATSAPP("W"),
    TELEGRAM("TG"),
    FACEBOOK("FB"),
    ZOOM("ZO"),
    OTHER("OT");
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
