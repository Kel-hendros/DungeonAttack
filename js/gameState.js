// Estado inicial del juego
const gameState = {
  deckKey: "starter", // Identifica el mazo actual, por ejemplo "starter"
  deckTier: 1, // Indica el tier del mazo, que puede incrementarse al mejorar
  roomSize: 5, // Numero de cartas por habitación
  playerStats: {
    // Estadísticas del jugador
    strength: 2, // Influye en el daño de las armas
    constitution: 0, // Influye en el Max de Salud
    intelligence: 0, // Influye en el daño de los hechizos
  },
  playerEquipment: {
    // Equipamiento actual del jugador
    weapon: null,
    armor: null,
    potion: null,
  },
  newEquipment: {
    weapon: false,
    armor: false,
    potion: false,
  },
  weaponDefeatedMonsters: [], // Monstruos derrotados por el arma actual
  currentArmorValue: 0, // Valor actual de la armadura
  currentRoomCards: [], // Cartas de la habitación actual
  cardsRemaining: 0, // Cantidad de cartas que quedan en el dungeon
  dungeonDeck: [], // Mazo del dungeon completo
  discardPile: [], // Pila de descarte para las cartas usadas o vencidas
  playerHealth: {
    current: 100,
    max: 100,
    prev: 100,
  },
  newIndexes: [],
};

function resetGameState() {
  gameState.deckKey = "starter";
  gameState.deckTier = 1;
  gameState.playerStats = {
    strength: 0,
    constitution: 0,
    intelligence: 0,
  };
  gameState.playerHealth = {
    current: 100,
    max: 100,
    prev: 100,
  };
  playerEquipment = {
    weapon: null,
    armor: null,
    potion: null,
  };
  newEquipment = {
    weapon: false,
    armor: false,
    potion: false,
  };
  gameState.weaponDefeatedMonsters = [];
  gameState.currentArmorValue = [];
  gameState.currentRoomCards = [];
  gameState.dungeonDeck = [];
  gameState.cardsRemaining = 0;
  gameState.discardPile = [];
  gameState.newIndexes = [];
}

export { gameState, resetGameState };
