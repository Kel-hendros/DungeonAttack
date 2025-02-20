import { cardData, decks } from "../data/cards.js";
import { gameState } from "./gameState.js";
import { showModal } from "./ui.js";

export function initializeDungeonDeck() {
  const deckDefinition = decks[gameState.deckKey];
  let fullDeck = [];
  const composition = deckDefinition.composition;

  // Generar el mazo completo basado en la composición
  Object.keys(composition).forEach((type) => {
    const count = composition[type];
    // Filtrar cartas disponibles que cumplan con el tier actual
    const availableCards = cardData[type].filter(
      (card) => card.tier <= gameState.deckTier
    );
    for (let i = 0; i < count; i++) {
      const randomIndex = Math.floor(Math.random() * availableCards.length);
      fullDeck.push(availableCards[randomIndex]);
    }
  });

  // Mezclar el mazo completo
  fullDeck = shuffleArray(fullDeck);
  // Actualizar el estado con el mazo completo
  gameState.dungeonDeck = fullDeck;
  gameState.cardsRemaining = fullDeck.length;
  return fullDeck;
}

export function generateRoomCards() {
  // Si aún no se ha inicializado el dungeon deck, lo generamos
  if (gameState.dungeonDeck.length === 0) {
    initializeDungeonDeck();
  }

  const roomSize = gameState.roomSize;

  // Generamos las cartas de la habitación según el roomSize
  let roomCards = new Array(roomSize).fill(null);
  // Para cada slot, si hay cartas en el dungeon, tomamos la siguiente
  for (let i = 0; i < roomSize; i++) {
    if (gameState.dungeonDeck.length > 0) {
      roomCards[i] = gameState.dungeonDeck.shift();
    }
  }

  // Actualizamos el estado con las cartas de la habitación actual
  gameState.currentRoomCards = roomCards;
  gameState.cardsRemaining = roomCards.filter((card) => card !== null).lenght;

  console.log("Room size:", gameState.roomSize);
  console.log("Deck length antes de splice:", gameState.dungeonDeck.length);

  return roomCards;
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// Función para remover una carta del room por su índice
export function removeCard(cardIndex) {
  // Marcar la posición como vacía sin modificar la longitud del array.
  gameState.currentRoomCards[cardIndex] = null;
  // Actualizamos cardsRemaining contando solo las cartas que no son null.
  gameState.cardsRemaining = gameState.currentRoomCards.filter(
    (card) => card !== null
  ).length;

  // Opcional: si se llega a cierto umbral (por ejemplo, 1 carta no nula) se puede generar un nuevo room.
  if (gameState.cardsRemaining === 1) {
    nextRoom();
  }
  return gameState.currentRoomCards;
}

// Función para avanzar al siguiente room
export function nextRoom() {
  console.log("Pasando al siguiente room...");
  const roomSize = gameState.roomSize;
  // Inicializar array de nuevos indices
  gameState.newIndexes = [];

  // Recorremos cada slot del room
  for (let i = 0; i < roomSize; i++) {
    // Si el slot está vacío y hay cartas en el dungeon, llenamos ese slot
    if (
      gameState.currentRoomCards[i] === null &&
      gameState.dungeonDeck.length > 0
    ) {
      gameState.currentRoomCards[i] = gameState.dungeonDeck.shift();
      // Guardamos el indice como slot nuevo
      gameState.newIndexes.push(i);
    }
  }
  // Actualizamos la cuenta de cartas restantes en el room
  gameState.cardsRemaining = gameState.currentRoomCards.filter(
    (card) => card !== null
  ).length;
  gameState.newRoom = true;
  return gameState.currentRoomCards;
}

// Función que procesa la carta según su tipo. Se espera recibir el índice de la carta en currentRoomCards.
export async function processCard(index) {
  const card = gameState.currentRoomCards[index];
  if (!card) return false;

  let actionProcessed = false;
  switch (card.type) {
    case "weapon":
      console.warn("Carta clickeada:", card, "posición:", index);
      actionProcessed = equipWeapon(card);
      break;
    case "armor":
      console.warn("Carta clickeada:", card, "posición:", index);
      actionProcessed = equipArmor(card);
      break;
    case "potion":
      console.warn("Carta clickeada:", card, "posición:", index);
      const userChoice = await showModal("potion", { potionCard: card });
      if (userChoice === "use") {
        actionProcessed = usePotion(card);
      } else {
        actionProcessed = equipPotion(card);
      }
      break;
    case "spell":
      console.warn("Carta clickeada:", card, "posición:", index);
      break;
    case "monster":
      console.warn("Carta clickeada:", card, "posición:", index);
      // Si tengo un arma equipada, evaluamos si se puede usar
      if (gameState.playerEquipment.weapon) {
        console.log("Arma equipada:", gameState.playerEquipment.weapon);
        let canUseWeapon = false;
        // Si ya derrotamos monstruos con el arma, verificamos el value del último
        if (
          gameState.weaponDefeatedMonsters &&
          gameState.weaponDefeatedMonsters.length > 0
        ) {
          const lastDefeated =
            gameState.weaponDefeatedMonsters[
              gameState.weaponDefeatedMonsters.length - 1
            ];
          console.log("Último monstruo derrotado:", lastDefeated);
          if (lastDefeated.value > card.value) {
            canUseWeapon = true;
          }
        } else {
          // Si aún no hay monstruos derrotados, permitimos usar el arma
          canUseWeapon = true;
        }
        console.log("Puede usar arma?", canUseWeapon);
        if (canUseWeapon) {
          // Se abre el Modal con las opciones de Monstruo
          const userChoice = await showModal("monster", {
            monsterCard: card,
            weaponCard: gameState.playerEquipment.weapon,
          });
          if (userChoice === "weapon") {
            actionProcessed = attackMonsterWithWeapon(card);
            if (actionProcessed) {
              // Agregar el monstruo a la pila de derrotados con arma
              if (!gameState.weaponDefeatedMonsters) {
                gameState.weaponDefeatedMonsters = [];
              }
              gameState.weaponDefeatedMonsters.push(card);
            }
          } else {
            actionProcessed = attackMonsterUnarmed(card);
          }
        } else {
          // Si el arma no sirve, se pelea a mano
          actionProcessed = attackMonsterUnarmed(card);
        }
      } else {
        // Si no tengo arma equipada, se pelea a mano
        actionProcessed = attackMonsterUnarmed(card);
      }
      break;
    default:
      console.warn("Tipo de carta desconocido:", card.type);
  }
  if (actionProcessed) {
    removeCard(index);
  }
  return actionProcessed;
}

function equipWeapon(card) {
  // Si ya hay un arma equipada, la movemos al descarte
  if (gameState.playerEquipment.weapon) {
    gameState.discardPile.push(gameState.playerEquipment.weapon);
    console.log("Arma movida al descarte:", gameState.playerEquipment.weapon);
  }
  // Si hay enemigos derrotados con esta Arma, se envian al descarte
  if (gameState.weaponDefeatedMonsters) {
    gameState.discardPile = gameState.discardPile.concat(
      gameState.weaponDefeatedMonsters
    );
    console.log(
      "Monstruos derrotados con esta arma movidos al descarte:",
      gameState.weaponDefeatedMonsters
    );
    gameState.weaponDefeatedMonsters = [];
  }
  // Equipamos la nueva arma (guardamos el objeto completo para tener todos sus atributos)
  gameState.playerEquipment.weapon = card;
  gameState.newEquipment.weapon = true;
  console.log("Arma equipada", gameState.playerEquipment.weapon);
  return true;
}

function equipArmor(card) {
  // Si ya hay una armadura equipada, la movemos al descarte
  if (gameState.playerEquipment.armor) {
    gameState.discardPile.push(gameState.playerEquipment.armor);
    console.log(
      "Armadura movida al descarte:",
      gameState.playerEquipment.armor
    );
  }
  // Equipamos la nueva armadura (guardamos el objeto completo para tener todos sus atributos)
  gameState.playerEquipment.armor = card;
  gameState.currentArmorValue = card.value;
  gameState.newEquipment.armor = true;

  console.log("Armadura equipada", gameState.playerEquipment.armor);
  return true;
}

function attackMonsterWithWeapon(card) {
  console.log(`Atacaste al monstruo ${card.name} usando tu arma.`);
  // Aquí agregar lógica de daño, efectos, etc.
  let weaponValue = gameState.playerEquipment.weapon.value;
  let strengthModifier = gameState.playerStats.strength;
  // Calculamos el daño real
  let damageReceived = card.value - weaponValue - strengthModifier;
  // El daño nunca puede ser negativo
  if (damageReceived < 0) {
    damageReceived = 0;
  }
  // Actualizamos la salud del jugador
  gameState.playerHealth.current -= damageReceived;
  console.log(
    `Recibiste ${damageReceived} de daño. Salud restante: ${gameState.playerHealth.current}`
  );

  return true; // Retornamos true si el ataque se procesa correctamente
}

function attackMonsterUnarmed(card) {
  console.log(`Atacaste al monstruo ${card.name} a mano.`);
  // Calculamos el valor de la armadura, 0 si no hay armadura equipada
  let armorValue = gameState.playerEquipment.armor
    ? gameState.playerEquipment.armor.value
    : 0;
  let constitutionModifier = gameState.playerStats.constitution;
  // Calculamos el daño real
  let damageReceived = card.value - armorValue - constitutionModifier;
  // El daño nunca puede ser negativo
  if (damageReceived < 0) {
    damageReceived = 0;
  }
  // Actualizamos la salud del jugador
  gameState.playerHealth.current -= damageReceived;
  console.log(
    `Recibiste ${damageReceived} de daño. Salud restante: ${gameState.playerHealth.current}`
  );
  gameState.discardPile.push(card);
  return true;
}

function equipPotion(card) {
  // Si ya hay una poción equipada, la movemos al descarte
  if (gameState.playerEquipment.potion) {
    gameState.discardPile.push(gameState.playerEquipment.potion);
    console.log("Poción movida al descarte:", gameState.playerEquipment.potion);
  }
  // Equipamos la nueva poción (guardamos el objeto completo para tener todos sus atributos)
  gameState.playerEquipment.potion = card;
  gameState.newEquipment.potion = true;

  return true;
}

function usePotion(card) {
  // Al usar la poción, se incrementa la salud segun el value de la carta pero sin superar el max
  if (
    gameState.playerHealth.current + card.value >
    gameState.playerHealth.max
  ) {
    gameState.playerHealth.current = gameState.playerHealth.max;
  } else {
    gameState.playerHealth.current += card.value;
    console.log(
      `Usaste la poción ${card.name}. Salud actual: ${gameState.playerHealth.current}`
    );
  }
  return true;
}
