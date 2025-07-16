package com.rolesync.rolesync.enums;

public enum Language {
    Spanish("SP"),
    English("EN"),
    French("FR"),
    German("GE"),
    Italian("IT"),
    Portuguese("PT"),
    Russian("RU"),
    Chinese("CH"),
    Japanese("JA"),
    Corean("KO"),
    Other("OT");

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
