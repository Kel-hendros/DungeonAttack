// Ejemplo de definición de cartas

const monster = [
  { id: 3, name: "Kobold", value: 1, type: "monster", tier: 1 },
  { id: 4, name: "Rata Gigante", value: 2, type: "monster", tier: 1 },
  { id: 5, name: "Esqueleto", value: 3, type: "monster", tier: 1 },
  { id: 6, name: "Zombi", value: 4, type: "monster", tier: 1 },
  { id: 7, name: "Bandido", value: 5, type: "monster", tier: 1 },
  { id: 8, name: "Lobo Salvaje", value: 6, type: "monster", tier: 1 },
  { id: 9, name: "Troll de las Cavernas", value: 7, type: "monster", tier: 1 },
  { id: 10, name: "Ogro", value: 8, type: "monster", tier: 1 },
  { id: 11, name: "Harpía", value: 9, type: "monster", tier: 1 },
  { id: 12, name: "Minotauro", value: 10, type: "monster", tier: 1 },
  { id: 13, name: "Gárgola", value: 11, type: "monster", tier: 1 },
  { id: 14, name: "Cria de Dragón", value: 12, type: "monster", tier: 1 },
  { id: 15, name: "Capitán Orco", value: 13, type: "monster", tier: 1 },
];

const weapon = [
  { id: 102, name: "Palo con punta", value: 2, type: "weapon", tier: 1 },
  { id: 103, name: "Escoba rústica", value: 3, type: "weapon", tier: 1 },
  { id: 104, name: "Cuchillo de cocina", value: 4, type: "weapon", tier: 1 },
  { id: 105, name: "Maza de madera", value: 5, type: "weapon", tier: 1 },
  { id: 106, name: "Daga afilada", value: 6, type: "weapon", tier: 1 },
  { id: 107, name: "Martillo de herrero", value: 7, type: "weapon", tier: 1 },
  { id: 108, name: "Lanza corta", value: 8, type: "weapon", tier: 1 },
  { id: 109, name: "Espada corta", value: 9, type: "weapon", tier: 1 },
  { id: 110, name: "Hacha de batalla", value: 10, type: "weapon", tier: 1 },
  {
    id: 111,
    name: "Espada de gran calidad",
    value: 11,
    type: "weapon",
    tier: 1,
  },
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

// Definición de decks con composición
export const decks = {
  starter: {
    name: "Starter",
    tier: 1,
    composition: {
      monster: 20,
      weapon: 10,
      armor: 10,
      potion: 10,
      spell: 5,
    },
  },
  // Podés definir más decks para niveles superiores
};
