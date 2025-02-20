// Ejemplo de definición de cartas

const monster = [
  { id: 1, name: "Ogro de la caverna", value: 8, type: "monster", tier: 1 },
  { id: 2, name: "Goblin", value: 4, type: "monster", tier: 1 },
  // Más monstruos...
];

const weapon = [
  { id: 101, name: "Espada oxidada", value: 5, type: "weapon", tier: 1 },
  // Más armas...
];

const armor = [
  { id: 201, name: "Escudo viejo", value: 3, type: "armor", tier: 1 },
  // Más armaduras...
];

const potion = [
  { id: 301, name: "Poción menor", value: 1, type: "potion", tier: 1 },
  // Más pociones...
];

const spell = [
  { id: 401, name: "Chispa mágica", value: 2, type: "spell", tier: 1 },
  // Más hechizos...
];

export const cardData = { monster, weapon, armor, potion, spell };

// Definición de decks con composición
export const decks = {
  starter: {
    name: "Starter",
    tier: 1,
    composition: {
      monster: 30,
      weapon: 15,
      armor: 10,
      potion: 15,
      spell: 10,
    },
  },
  // Podés definir más decks para niveles superiores
};
