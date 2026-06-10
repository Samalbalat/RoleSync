package com.rolesync.rolesync.model;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

import java.lang.reflect.Method;
import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;

class ModelsTest {

    @Test
    void loginSessionEmptyConstructorTest() {
        LoginSession session = new LoginSession();
        assertNotNull(session);
    }

    @Test
    void closeSessionShouldNotThrowAndCanBeInvoked() {
        LoginSession session = new LoginSession();
        assertDoesNotThrow(() -> session.closeSession());
    }

    @Test
    void sessionTimeoutShouldNotThrowAndCanBeInvoked() {
        LoginSession session = new LoginSession();
        assertDoesNotThrow(() -> session.sessionTimeout());
    }



    private Object getDummyValue(Class<?> type) {
        if (type == String.class) {
            return "test";
        }
        if (type == Long.class || type == long.class) {
            return 1L;
        }
        if (type == Integer.class || type == int.class) {
            return 1;
        }
        if (type == Boolean.class || type == boolean.class) {
            return true;
        }
        if (type == Double.class || type == double.class) {
            return 1.0;
        }
        if (type == Float.class || type == float.class) {
            return 1.0f;
        }
        if (type == Short.class || type == short.class) {
            return (short) 1;
        }
        if (type == Byte.class || type == byte.class) {
            return (byte) 1;
        }
        if (type == Character.class || type == char.class) {
            return 'a';
        }
        if (type == Instant.class) {
            return Instant.now();
        }
        if (type == List.class) {
            return new ArrayList<>();
        }
        if (type == Set.class) {
            return new java.util.HashSet<>();
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
    }

}
