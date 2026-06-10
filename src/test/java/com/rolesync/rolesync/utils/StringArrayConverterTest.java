package com.rolesync.rolesync.utils;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class StringArrayConverterTest {

    private final StringArrayConverter converter = new StringArrayConverter();

    @Test
    void convertToDatabaseColumnShouldReturnNullwhenAttributeIsNull() {
        assertNull(converter.convertToDatabaseColumn(null));
    }

    @Test
    void convertToDatabaseColumnShouldReturnEmptyStringwhenArrayIsEmpty() {
        String result = converter.convertToDatabaseColumn(new String[]{});
        assertEquals("", result);
    }

    @Test
    void convertToDatabaseColumnShouldJoinElementsWithComma() {
        String[] input = {"a", "b", "c"};
        String result = converter.convertToDatabaseColumn(input);

        assertEquals("a,b,c", result);
    }

    @Test
    void convertToEntityAttributeShouldReturnEmptyArrayWhenDbDataIsNull() {
        String[] result = converter.convertToEntityAttribute(null);
        assertNotNull(result);
        assertEquals(0, result.length);
    }

    @Test
    void convertToEntityAttributeShouldReturnSingleEmptyElementWhenDbDataIsEmptyString() {
        String[] result = converter.convertToEntityAttribute("");
        assertArrayEquals(new String[]{""}, result);
    }

    @Test
    void convertToEntityAttributeShouldSplitByComma() {
        String[] result = converter.convertToEntityAttribute("a,b,c");

        assertArrayEquals(new String[]{"a", "b", "c"}, result);
    }

    @Test
    void roundTripConversionShouldBeConsistent() {
        String[] original = {"x", "y", "z"};

        String db = converter.convertToDatabaseColumn(original);
        String[] back = converter.convertToEntityAttribute(db);

        assertArrayEquals(original, back);
    }
}
