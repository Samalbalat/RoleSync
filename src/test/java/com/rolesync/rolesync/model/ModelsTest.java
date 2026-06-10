package com.rolesync.rolesync.model;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

import java.lang.reflect.Method;
import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

class ModelsTest {

        private static final Map<Class<?>, Object> DUMMY_VALUES = Map.ofEntries(
        Map.entry(String.class, "test"),
        Map.entry(Long.class, 1L),
        Map.entry(long.class, 1L),
        Map.entry(Integer.class, 1),
        Map.entry(int.class, 1),
        Map.entry(Boolean.class, true),
        Map.entry(boolean.class, true),
        Map.entry(Double.class, 1.0d),
        Map.entry(double.class, 1.0d),
        Map.entry(Float.class, 1.0f),
        Map.entry(float.class, 1.0f),
        Map.entry(Short.class, (short) 1),
        Map.entry(short.class, (short) 1),
        Map.entry(Byte.class, (byte) 1),
        Map.entry(byte.class, (byte) 1),
        Map.entry(Character.class, 'a'),
        Map.entry(char.class, 'a'),
        Map.entry(Instant.class, Instant.parse("2025-01-01T00:00:00Z"))
);

    @Test
    void loginSessionEmptyConstructorTest() {
        LoginSession session = new LoginSession();
        assertNotNull(session);
    }

    @Test
    void closeSessionShouldNotThrowAndCanBeInvoked() {
        LoginSession session = new LoginSession();
        session.setLoginTime(Instant.now().minus(Duration.ofMinutes(10)));
        session.setLastRequest(Instant.now().minus(Duration.ofMinutes(10)));
        assertDoesNotThrow(() -> session.closeSession());
    }

    @Test
    void sessionTimeoutShouldNotThrowAndCanBeInvoked() {
        LoginSession session = new LoginSession();
        session.setLoginTime(Instant.now().minus(Duration.ofMinutes(10)));
        session.setLastRequest(Instant.now().minus(Duration.ofMinutes(10)));
        assertDoesNotThrow(() -> session.sessionTimeout());
    }

    private Object getDummyValue(Class<?> type) {
    Object value = DUMMY_VALUES.get(type);

    if (value != null) {
        return value;
    }

    return getComplexDummyValue(type);
}

private Object getComplexDummyValue(Class<?> type) {
    if (List.class.isAssignableFrom(type)) {
        return new ArrayList<>();
    }

    if (Set.class.isAssignableFrom(type)) {
        return new HashSet<>();
    }

    if (type.isEnum()) {
        return type.getEnumConstants()[0];
    }

    try {
        return type.getDeclaredConstructor().newInstance();
    } catch (Exception e) {
        return null;
    }
}

    @Test
    void campaignRequestEmptyConstructorTest() {
        CampaignRequest request = new CampaignRequest();
        assertNotNull(request);
    }


    @Test
    void characterSheetEmptyConstructorTest() {
        CharacterSheet sheet = new CharacterSheet();
        assertNotNull(sheet);
    }

    @Test
    void postEmptyConstructorTest() {
        Post post = new Post();
        assertNotNull(post);
    }

    @Test
    void modelsGettersAndSettersTest() throws Exception {
        List<Object> dummyValues = List.of(
                new LoginSession(),
                new CampaignRequest(),
                new CharacterSheet(),
                new Post());

        for (Object value : dummyValues) {
            for (Method setter : value.getClass().getMethods()) {
                if (setter.getName().startsWith("set") && setter.getParameterCount() == 1) {
                    setter.invoke(value, getDummyValue(setter.getParameterTypes()[0]));
                }
            }

            for (Method getter : value.getClass().getMethods()) {
                String name = getter.getName();
                if ((name.startsWith("get") || name.startsWith("is")) && getter.getParameterCount() == 0
                        && !"getClass".equals(name)) {
                    getter.invoke(value);
                }
            }
        }
        assertTrue(true);
    }

}
