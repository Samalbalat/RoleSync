package com.rolesync.rolesync.enums;

public enum WeekDay {
    MONDAY("MON"),
    TUESDAY("TUE"),
    WEDNESDAY("WED"),
    THURSDAY("THU"),
    FRIDAY("FRI"),
    SATURDAY("SAT"),
    SUNDAY("SUN");

    // Each enum constant has a code associated with it
    // This code can be used for serialization or other purposes
    private final String code;

    WeekDay(String code) {
        this.code = code;
    }

    public String getcode() {
        return code;
    }
    
}
