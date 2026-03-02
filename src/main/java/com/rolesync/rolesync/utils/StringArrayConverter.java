package com.rolesync.rolesync.utils;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter
public class StringArrayConverter implements AttributeConverter<String[], String> {

    private static final String SEPARATOR = ",";

    // Convert String[] → DB string (comma-separated)
    @Override
    public String convertToDatabaseColumn(String[] attribute) {
        return attribute != null ? String.join(SEPARATOR, attribute) : null;
    }

    // Convert DB string → String[]
    @Override
    public String[] convertToEntityAttribute(String dbData) {
        return dbData != null ? dbData.split(SEPARATOR) : new String[]{};
    }
}
