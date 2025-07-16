package com.rolesync.rolesync.enums;

public enum RPGSystem {
    DungeonsAndDragons("D&D"),
    Pathfinder("PF"),
    Starfinder("SF"),
    WarhammerFantasyRoleplay("WFRP"),
    Warhammer40kRoleplay("W40K"),
    CallOfCthulhu("CoC"),
    Shadowrun("SR"),
    VampireTheMasquerade("VtM"),
    GURPS("GURPS"),
    SavageWorlds("SW"),
    Fiasco("Fiasco"),
    DungeonWorld("DW"),
    BladesInTheDark("BitD"),
    MonsterOfTheWeek("MotW"),
    Numenera("Numenera"),
    TheOneRing("TOR"),
    StarWarsRoleplayingGame("SWRPG")
    // More can be added as needed
    ;

    // Each enum constant has a code associated with it
    // This code can be used for serialization or other purposes
    private final String code;
    
    RPGSystem(String code) {
        this.code = code;
    }

    public String getcode() {
        return code;
    }    
    
}
