// Estado inicial del juego
const gameState = {
  deckKey: "starter", // Identifica el mazo actual, por ejemplo "starter"
  deckTier: 1, // Indica el tier del mazo, que puede incrementarse al mejorar
  roomSize: 4, // Numero de cartas por habitación
  visitedDungeons: 1, // Cantidad de dungeons visitados
  playerStats: {
    // Estadísticas del jugador
    strength: 0, // Influye en el daño de las armas
    constitution: 0, // Influye en el Max de Salud
    intelligence: 0, // Influye en el daño de los hechizos
  },
  mana: 0,
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
    base: 20,
    current: 20,
    max: 20,
    prev: 20,
  },
  newIndexes: [],
  inTargetSelection: false,
  log: [],
  runUsed: 0,
};

function resetGameState() {
  gameState.deckKey = "starter";
  gameState.deckTier = 1;
  gameState.visitedDungeons = 1;
  gameState.playerStats = {
    strength: 0,
    constitution: 0,
    intelligence: 0,
  };
  gameState.playerHealth = {
    base: 20,
    current: 20,
    max: 20,
    prev: 20,
  };
  gameState.mana = 0;
  gameState.playerEquipment = {
    weapon: null,
    armor: null,
    potion: null,
  };
  gameState.newEquipment = {
    weapon: false,
    armor: false,
    potion: false,
  };
  gameState.weaponDefeatedMonsters = [];
  gameState.currentArmorValue = 0;
  gameState.currentRoomCards = [];
  gameState.dungeonDeck = [];
  gameState.cardsRemaining = 0;
  gameState.discardPile = [];
  gameState.newIndexes = [];
  gameState.inTargetSelection = false;
  gameState.log = [];
  gameState.runUsed = 0;
}

export { gameState, resetGameState };

export function saveGameState() {
  try {
    localStorage.setItem("dungeonAttackState", JSON.stringify(gameState));
    console.log("Estado del juego guardado.");
  } catch (error) {
    console.error("Error al guardar el estado:", error);
  }
}

export function loadGameState() {
  try {
    const storedState = localStorage.getItem("dungeonAttackState");
    if (storedState) {
      const parsedState = JSON.parse(storedState);
      // Actualizamos el gameState con los valores guardados.
      // Usamos Object.assign para actualizar solo las propiedades.
      Object.assign(gameState, parsedState);
      console.log("Estado del juego cargado.");
      return true;
    } else {
      console.log("No hay estado guardado.");
      return false;
    }
  } catch (error) {
    console.error("Error al cargar el estado:", error);
    return false;
  }
}
