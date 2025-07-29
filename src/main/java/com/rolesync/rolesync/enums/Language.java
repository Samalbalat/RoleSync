package com.rolesync.rolesync.enums;

public enum Language {
    SPANISH("SP"),
    ENGLISH("EN"),
    FRENCH("FR"),
    GERMAN("GE"),
    ITALIAN("IT"),
    PORTUGUESE("PT"),
    RUSSIAN("RU"),
    CHINESE("CH"),
    JAPANESE("JA"),
    KOREAN("KO"),
    OTHER("OT");

    // Each enum constant has a code associated with it
    // This code can be used for serialization or other purposes
    private final String code;

    Language(String code) {
        this.code = code;
    }

    public String getcode() {
        return code;
    }
}
