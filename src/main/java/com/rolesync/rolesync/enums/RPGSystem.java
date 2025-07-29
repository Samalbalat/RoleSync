package com.rolesync.rolesync.enums;

public enum RPGSystem {
    DUNGEONS_AND_DRAGONS("D&D"),
    PATHFINDER("PF"),
    STARFINDER("SF"),
    WARHAMMER_FANTASY_ROLEPLAY("WFRP"),
    WARHAMMER_40K_ROLEPLAY("W40K"),
    CALL_OF_CTHULHU("CoC"),
    SHADOWRUN("SR"),
    VAMPIRE_THE_MASQUERADE("VtM"),
    GURPS("GURPS"),
    SAVAGE_WORLDS("SW"),
    FIASCO("Fiasco"),
    DUNGEON_WORLD("DW"),
    BLADES_IN_THE_DARK("BitD"),
    MONSTER_OF_THE_WEEK("MotW"),
    NUMENERA("Numenera"),
    THE_ONE_RING("TOR"),
    STAR_WARS_ROLEPLAYING_GAME("SWRPG");
    // More can be added as needed

    private final String code;

    RPGSystem(String code) {
        this.code = code;
    }

    public String getCode() {
        return code;
    }
}
