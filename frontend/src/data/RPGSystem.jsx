export const RPG_SYSTEM_ENUM = {
	DUNGEONS_AND_DRAGONS: 'D&D',
	PATHFINDER: 'Pathfinder',
	STARFINDER: 'Sarfinder',
	WARHAMMER_FANTASY_ROLEPLAY: 'WFRP',
	WARHAMMER_40K_ROLEPLAY: 'W40K',
	CALL_OF_CTHULHU: 'CoC',
	SHADOWRUN: 'Shadowrun',
	VAMPIRE_THE_MASQUERADE: 'VtM',
	GURPS: 'Gurps',
	SAVAGE_WORLDS: 'Savage Worlds',
	FIASCO: 'Fiasco',
	DUNGEON_WORLD: 'DW',
	BLADES_IN_THE_DARK: 'BitD',
	MONSTER_OF_THE_WEEK: 'MotW',
	NUMENERA: 'Numenera',
	THE_ONE_RING: 'TOR',
	STAR_WARS_ROLEPLAYING_GAME: 'SWRPG',
};

export default function parseRpgSystem(system) {
	return RPG_SYSTEM_ENUM[system] || system || '';
}
