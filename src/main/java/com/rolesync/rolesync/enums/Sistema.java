package com.rolesync.rolesync.enums;

public enum Sistema {
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
    // Otros sistemas pueden ser añadidos aquí
    ;

    // Cada sistema tiene un código asociado
    private final String codigo;

    Sistema(String codigo) {
        this.codigo = codigo;
    }

    public String getCodigo() {
        return codigo;
    }    
    
}
