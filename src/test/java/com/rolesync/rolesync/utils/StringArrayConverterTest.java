package com.rolesync.rolesync.utils;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class StringArrayConverterTest {

    private final StringArrayConverter converter = new StringArrayConverter();

    @Test
    void convertToDatabaseColumn_shouldReturnNull_whenAttributeIsNull() {
        assertNull(converter.convertToDatabaseColumn(null));
    }

    @Test
    void convertToDatabaseColumn_shouldReturnEmptyString_whenArrayIsEmpty() {
        String result = converter.convertToDatabaseColumn(new String[]{});
        assertEquals("", result);
    }

    @Test
    void convertToDatabaseColumn_shouldJoinElementsWithComma() {
        String[] input = {"a", "b", "c"};
        String result = converter.convertToDatabaseColumn(input);

        assertEquals("a,b,c", result);
    }

    @Test
    void convertToEntityAttribute_shouldReturnEmptyArray_whenDbDataIsNull() {
        String[] result = converter.convertToEntityAttribute(null);
        assertNotNull(result);
        assertEquals(0, result.length);
    }

    @Test
    void convertToEntityAttribute_shouldReturnSingleEmptyElement_whenDbDataIsEmptyString() {
        String[] result = converter.convertToEntityAttribute("");
        assertArrayEquals(new String[]{""}, result);
    }

    @Test
    void convertToEntityAttribute_shouldSplitByComma() {
        String[] result = converter.convertToEntityAttribute("a,b,c");

        assertArrayEquals(new String[]{"a", "b", "c"}, result);
    }

    @Test
    void roundTrip_conversion_shouldBeConsistent() {
        String[] original = {"x", "y", "z"};

        String db = converter.convertToDatabaseColumn(original);
        String[] back = converter.convertToEntityAttribute(db);

        assertArrayEquals(original, back);
    }
}
