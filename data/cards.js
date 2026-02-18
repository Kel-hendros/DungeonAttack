// Ejemplo de definición de cartas

const monster = [
  // Tier 1: Criaturas básicas (values 2-15)
  { id: 3, name: "Kobold", value: 2, type: "monster", tier: 1 },
  { id: 4, name: "Rata Gigante", value: 3, type: "monster", tier: 1 },
  { id: 5, name: "Esqueleto", value: 4, type: "monster", tier: 1 },
  { id: 6, name: "Zombi", value: 5, type: "monster", tier: 1 },
  { id: 7, name: "Bandido", value: 6, type: "monster", tier: 1 },
  { id: 8, name: "Lobo Salvaje", value: 7, type: "monster", tier: 1 },
  { id: 9, name: "Troll de las Cavernas", value: 8, type: "monster", tier: 1 },
  { id: 10, name: "Ogro", value: 9, type: "monster", tier: 1 },
  { id: 11, name: "Harpía", value: 10, type: "monster", tier: 1 },
  { id: 12, name: "Minotauro", value: 11, type: "monster", tier: 1 },
  { id: 13, name: "Gárgola", value: 12, type: "monster", tier: 1 },
  { id: 14, name: "Cria de Dragón", value: 13, type: "monster", tier: 1 },
  { id: 15, name: "Capitán Orco", value: 15, type: "monster", tier: 1 },
  // Tier 2: Criaturas peligrosas (values 10-18)
  { id: 16, name: "Golem de Piedra", value: 10, type: "monster", tier: 2 },
  { id: 17, name: "Espectro", value: 12, type: "monster", tier: 2 },
  { id: 18, name: "Basilisco", value: 14, type: "monster", tier: 2 },
  { id: 19, name: "Señor Orco", value: 16, type: "monster", tier: 2 },
  { id: 20, name: "Quimera", value: 18, type: "monster", tier: 2 },
  // Tier 3: Criaturas letales (values 16-25)
  { id: 21, name: "Hidra", value: 16, type: "monster", tier: 3 },
  { id: 22, name: "Demonio Menor", value: 18, type: "monster", tier: 3 },
  { id: 23, name: "Gigante de Hielo", value: 20, type: "monster", tier: 3 },
  { id: 24, name: "Vampiro Antiguo", value: 22, type: "monster", tier: 3 },
  { id: 25, name: "Wyrm", value: 25, type: "monster", tier: 3 },
];

const weapon = [
  // Tier 1: Armas básicas (values 2-12)
  { id: 102, name: "Palo con punta", value: 2, type: "weapon", tier: 1 },
  { id: 103, name: "Escoba rústica", value: 3, type: "weapon", tier: 1 },
  { id: 104, name: "Cuchillo de cocina", value: 4, type: "weapon", tier: 1 },
  { id: 105, name: "Maza de madera", value: 5, type: "weapon", tier: 1 },
  { id: 106, name: "Daga afilada", value: 6, type: "weapon", tier: 1 },
  { id: 107, name: "Martillo de herrero", value: 7, type: "weapon", tier: 1 },
  { id: 108, name: "Lanza corta", value: 8, type: "weapon", tier: 1 },
  { id: 109, name: "Espada corta", value: 9, type: "weapon", tier: 1 },
  { id: 110, name: "Hacha de batalla", value: 10, type: "weapon", tier: 1 },
  { id: 111, name: "Espada de gran calidad", value: 12, type: "weapon", tier: 1 },
  // Tier 2: Armas superiores (values 10-16)
  { id: 112, name: "Espada Larga", value: 10, type: "weapon", tier: 2 },
  { id: 113, name: "Alabarda", value: 12, type: "weapon", tier: 2 },
  { id: 114, name: "Hacha de Guerra", value: 14, type: "weapon", tier: 2 },
  { id: 115, name: "Espada Rúnica", value: 16, type: "weapon", tier: 2 },
];

const armor = [
  { id: 201, name: "Escudo viejo", value: 3, type: "armor", tier: 1 },
  // Más armaduras...
  { id: 202, name: "Armadura Tachonada", value: 5, type: "armor", tier: 1 },
  {
    id: 203,
    name: "Armadura de Cota de Malla",
    value: 7,
    type: "armor",
    tier: 2,
  },
  { id: 204, name: "Armadura de Placas", value: 10, type: "armor", tier: 2 },
  { id: 205, name: "Armadura Completa", value: 12, type: "armor", tier: 3 },
  { id: 206, name: "Escudo Paves", value: 15, type: "armor", tier: 3 },
];

const potion = [
  { id: 301, name: "Poción menor", value: 1, type: "potion", tier: 1 },
  { id: 302, name: "Poción mediana", value: 2, type: "potion", tier: 1 },
  { id: 303, name: "Gran Poción", value: 3, type: "potion", tier: 1 },
  { id: 304, name: "Poción del Alquimista", value: 4, type: "potion", tier: 1 },
  { id: 305, name: "Brebaje de la Bruja", value: 5, type: "potion", tier: 1 },
  { id: 306, name: "Elixir Mágico", value: 6, type: "potion", tier: 1 },
  { id: 307, name: "Tónico de Hadas", value: 7, type: "potion", tier: 1 },
  { id: 308, name: "Bebida de Dragón", value: 8, type: "potion", tier: 1 },
  { id: 309, name: "Néctar de los Dioses", value: 9, type: "potion", tier: 1 },
  { id: 310, name: "Ambrosía Celestial", value: 10, type: "potion", tier: 1 },
];

const spell = [
  { id: 402, name: "Misil Mágico", value: 1, type: "spell", tier: 1 },
  { id: 403, name: "Golpe Arcano", value: 2, type: "spell", tier: 1 },
  { id: 404, name: "Cono de Fuego", value: 3, type: "spell", tier: 1 },
];

export const cardData = { monster, weapon, armor, potion, spell };

// Definición de decks con composición base (tier 1)
export const decks = {
  starter: {
    name: "Starter",
    tier: 1,
    composition: {
      monster: 20,
      weapon: 12,
      armor: 7,
      potion: 10,
      spell: 4,
    },
  },
};

// Escala la composición del mazo según el tier actual.
// Más monstruos y menos pociones conforme sube la dificultad.
export function getScaledComposition(deckKey, currentTier) {
  const base = decks[deckKey].composition;
  const tierOffset = currentTier - 1;
  return {
    monster: base.monster + tierOffset * 2,
    weapon: base.weapon,
    armor: base.armor,
    potion: Math.max(base.potion - tierOffset, 6),
    spell: base.spell,
  };
}

// Objetivo de dificultad por tier.
// dificultad = Σ monstruos - Σ (armas + armaduras + pociones)
// Tier 1: 15, Tier 2: 35, Tier 3: 55, etc.
export function getDifficultyTarget(tier) {
  return 15 + (tier - 1) * 20;
}
