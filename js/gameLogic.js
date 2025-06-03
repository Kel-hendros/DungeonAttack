import { cardData, decks } from "../data/cards.js";
import { saveGameState } from "./gameState.js";
import { gameState } from "./gameState.js";
import { showModal, showGameOverModal, showVictoryModal } from "./ui.js";
import { showSpellTargetSelector } from "./ui.js";
import { drawUI, updateUI, updateLogUI } from "./ui.js";

// Inicializar el contador de unique IDs del mazo
let uniqueIdCounter = 1;
function generateUniqueId() {
  return uniqueIdCounter++;
}

export function initializeDungeonDeck() {
  // console log para verificar que se está generando el mazo
  console.log("Inicializando mazo del dungeon...");
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

    // Si el número de cartas requeridas es mayor o igual que las únicas disponibles,
    // primero agregamos todas las cartas únicas.
    if (availableCards.length <= count) {
      availableCards.forEach((card) => {
        const newCard = { ...card, instanceId: generateUniqueId() };
        fullDeck.push(newCard);
      });
      // Luego, completamos el resto de las cartas faltantes con selecciones al azar
      const remaining = count - availableCards.length;
      for (let i = 0; i < remaining; i++) {
        const randomIndex = Math.floor(Math.random() * availableCards.length);
        const newCard = {
          ...availableCards[randomIndex],
          instanceId: generateUniqueId(),
        };
        fullDeck.push(newCard);
      }
    } else {
      // Si hay más cartas únicas disponibles de las que necesitamos,
      // elegimos aleatoriamente 'count' de ellas, asegurando que sean únicas.
      const shuffled = shuffleArray(availableCards.slice());
      for (let i = 0; i < count; i++) {
        const newCard = { ...shuffled[i], instanceId: generateUniqueId() };
        fullDeck.push(newCard);
      }
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
  // console log para verificar que se está generando el mazo
  console.log("Generando cartas de la habitación...");
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
  gameState.cardsRemaining = roomCards.filter((card) => card !== null).length;

  console.log("Room size:", gameState.roomSize);
  console.log("Deck length antes de splice:", gameState.dungeonDeck.length);

  return roomCards;
}

export function shuffleArray(array) {
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
  if (gameState.cardsRemaining <= 1) {
    nextRoom();
  }
  checkDungeonVictory();

  return gameState.currentRoomCards;
}

// Función para avanzar al siguiente room
export function nextRoom() {
  if (gameState.runUsed > 0) {
    gameState.runUsed = gameState.runUsed - 1;
    console.log("ajuste de runUsed:", gameState.runUsed);
  }
  console.log("Pasando al siguiente room...");
  logAction("Ingresas a una nueva habitación");
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
  saveGameState();
  return gameState.currentRoomCards;
}

// Función que procesa la carta según su tipo. Se espera recibir el índice de la carta en currentRoomCards.
export async function processCard(index) {
  // Si estamos en modo de selección de objetivos, no procesamos el clic normal.
  if (gameState.inTargetSelection) {
    console.log("Ignorando clic: estamos en modo selección de objetivos.");
    return false;
  }

  const card = gameState.currentRoomCards[index];
  if (!card) return false;

  let actionProcessed = false;

  try {
    switch (card.type) {
      case "weapon":
        console.warn("Carta clickeada:", card, "posición:", index);
        actionProcessed = equipWeapon(card);
        break;
      case "armor":
        console.warn("Carta clickeada:", card, "posición:", index);
        actionProcessed = equipArmor(card);
        break;
      case "potion": {
        console.warn("Carta clickeada:", card, "posición:", index);
        const userChoice = await showModal("potion", { potionCard: card });
        if (userChoice === "use") {
          actionProcessed = usePotion(card);
        } else {
          actionProcessed = equipPotion(card);
        }
        break;
      }
      case "spell":
        console.warn("Carta clickeada:", card, "posición:", index);
        actionProcessed = await castSpell(card);
        break;
      case "monster": {
        console.warn("Carta clickeada:", card, "posición:", index);
        let availableWeapon = "";
        if (gameState.playerEquipment.weapon) {
          let canUseWeapon = false;
          // Si ya hay monstruos derrotados, comparamos el value del último con el actual
          if (
            gameState.weaponDefeatedMonsters &&
            gameState.weaponDefeatedMonsters.length > 0
          ) {
            const lastDefeated =
              gameState.weaponDefeatedMonsters[
                gameState.weaponDefeatedMonsters.length - 1
              ];
            console.log("Último monstruo derrotado:", lastDefeated);
            // Si el último monstruo derrotado tiene un valor mayor o igual, el arma ya se usó efectivamente
            canUseWeapon = lastDefeated.value > card.value;
          } else {
            // Si aún no hay monstruos derrotados, se puede usar el arma
            canUseWeapon = true;
          }
          availableWeapon = canUseWeapon ? "SI" : "WEAPON USED";
        } else {
          availableWeapon = "NO WEAPON";
        }
        console.log("Estado del arma:", availableWeapon);

        // Se abre el modal siempre, pasando el estado del arma
        const userChoice = await showModal(
          "monster",
          {
            monsterCard: card,
            weaponCard: gameState.playerEquipment.weapon,
          },
          availableWeapon
        );

        // Según la elección del usuario y el estado del arma, se decide la acción
        if (userChoice === "weapon" && availableWeapon === "SI") {
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
        break;
      }
      default:
        console.warn("Tipo de carta desconocido:", card.type);
        break;
    }
    if (actionProcessed) {
      removeCard(index);
      saveGameState();
    }
  } catch (error) {
    if (error.message === "Modal closed by user") {
      console.log("Modal was closed by the user. Cancelling card processing.");
      // Lógica para cancelar el procesamiento de la carta
    } else {
      console.error("An unexpected error occurred:", error);
    }
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
  logAction(
    `Encuentras una nueva arma: <strong>${gameState.playerEquipment.weapon.name}</strong>, y la equipas raudamente.`
  );
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
  logAction(
    `Ves algo que podria ayudarte a protegerte: <strong>${gameState.playerEquipment.armor.name}</strong>, y procedes a utilizarlo.`
  );
  return true;
}

function attackMonsterWithWeapon(card) {
  console.log(`Atacaste al monstruo ${card.name} usando tu arma.`);
  // Mensaje base de enfrentamiento
  let message = `Te enfrentas con tu <strong>${gameState.playerEquipment.weapon.name}</strong> a un feroz enemigo: <strong>${card.name}</strong>, `;

  // Paso 1: Usamos el arma para "reducir" el daño
  let effectiveWeaponValue = gameState.playerEquipment.weapon.value;
  let remainingDamage = card.value - effectiveWeaponValue;
  message += `que ataca con fuerza ${card.value}. `;
  if (remainingDamage < 0) remainingDamage = 0;
  console.log(
    `Daño del monstruo: ${card.value}, Reducción por arma: ${effectiveWeaponValue}, Daño restante: ${remainingDamage}`
  );
  if (remainingDamage == 0) {
    message += `Tu pericia y armamento te protege de la criatura. `;
  }

  // Paso 2: Mitigación con armadura
  if (gameState.playerEquipment.armor && gameState.currentArmorValue > 0) {
    let absorbed = Math.min(remainingDamage, gameState.currentArmorValue);
    gameState.currentArmorValue -= absorbed;
    remainingDamage -= absorbed;
    if (absorbed > 0)
      message += `Tu protección bloqueó <strong>${absorbed}</strong> daño/s. `;
    console.log(
      `La armadura absorbió ${absorbed} de daño. Valor restante de la armadura: ${gameState.currentArmorValue}`
    );
    if (gameState.currentArmorValue <= 0) {
      // La armadura se rompe y se mueve al descarte
      gameState.discardPile.push(gameState.playerEquipment.armor);
      message += `pero tu <strong>${gameState.playerEquipment.armor.name}</strong> se rompió con el feroz ataque. `;
      console.log("La armadura se rompió");
      gameState.playerEquipment.armor = null;
      gameState.currentArmorValue = 0;
    }
  }

  // Asegurarse de que remainingDamage no sea negativo
  if (remainingDamage < 0) remainingDamage = 0;
  if (remainingDamage == 0) {
    message += `Saliste sin un rasguño del combate. `;
  } else {
    message += `Recibiste <strong>${remainingDamage}</strong> daño/s. `;
  }
  gameState.playerHealth.current -= remainingDamage;
  if (gameState.playerHealth.current < 0) gameState.playerHealth.current = 0;
  console.log(
    `Daño final aplicado a la salud: ${remainingDamage}. Salud restante: ${gameState.playerHealth.current}`
  );
  // Logueamos el mensaje final
  logAction(message);
  return true;
}

function attackMonsterUnarmed(card) {
  // Mensaje base de enfrentamiento
  let message = `Te enfrentas a mano limpia con un horrible monstruo: <strong>${card.name}</strong>, `;

  // Daño base del monstruo
  let remainingDamage = card.value;
  message += `que ataca con fuerza <strong>${card.value}</strong>. `;

  // Si hay armadura equipada y valor de protección disponible:
  if (gameState.playerEquipment.armor && gameState.currentArmorValue > 0) {
    let absorbed = Math.min(remainingDamage, gameState.currentArmorValue);
    gameState.currentArmorValue -= absorbed;
    remainingDamage -= absorbed;
    message += `Tu protección bloqueó <strong>${absorbed}</strong> daño/s. `;
    // Si la armadura se agota:
    if (gameState.currentArmorValue <= 0) {
      message += `pero tu <strong>${gameState.playerEquipment.armor.name}</strong> se rompió con el feroz ataque. `;
      gameState.discardPile.push(gameState.playerEquipment.armor);
      gameState.playerEquipment.armor = null;
      gameState.currentArmorValue = 0;
    }
  } else {
    message += `No tienes nada con que protegerte! `;
  }

  // Aseguramos que el daño restante no sea negativo.
  if (remainingDamage < 0) remainingDamage = 0;
  gameState.playerHealth.current -= remainingDamage;
  if (gameState.playerHealth.current < 0) gameState.playerHealth.current = 0;
  if (remainingDamage == 0) {
    message += `No resultaste herido en este enfrentamiento.`;
  } else {
    message += `Recibiste <strong>${remainingDamage}</strong> daño/s.`;
  }
  // Logueamos el mensaje final
  logAction(message);

  // Se descarta el monstruo (ya fue enfrentado)
  gameState.discardPile.push(card);

  return true;
}
function equipPotion(card) {
  let message = `Encuentras algo entre los escombros: <strong>${card.name}</strong>. Lo bebes y aumenta tu maná en <strong>${card.value} punto/s</strong>!`;
  // Sumamos el valor de la poción al mana actual.
  gameState.mana = (gameState.mana || 0) + card.value;
  // Movemos la poción a la pila de descarte.
  gameState.discardPile.push(card);
  console.log("Poción convertida a mana:", card, "Nuevo mana:", gameState.mana);
  logAction(message);
  return true;
}

function usePotion(card) {
  // Al usar la poción, se incrementa la salud segun el value de la carta pero sin superar el max
  let message = `Ves una botella roja que brilla con una tenue luz entre las sombras: <strong>${card.name}</strong>. El dulce líquido te otorga renovadads fuerzas, dandote <strong>${card.value} punto/s de salud</strong>`;
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
  logAction(message);
  return true;
}

export async function castSpell(spellCard) {
  console.log("=== Iniciando castSpell ===");
  console.log("Hechizo usado:", spellCard);
  let message = `Un poderoso pergamino mágico te permite lanzar el hechizo <strong>${spellCard.name}</strong>. `;

  // Determinar cuántos monstruos puede afectar el hechizo.
  const targetCount = spellCard.value;
  console.log("Objetivos permitidos:", targetCount);
  message += `Este conjuro puede dañar hasta <strong>${targetCount}</strong> enemigo/s a distancia`;
  // Filtrar los monstruos en la habitación.
  const monstersInRoom = gameState.currentRoomCards.filter(
    (card) => card && card.type === "monster"
  );
  console.log(
    "Monstruos en habitación:",
    monstersInRoom.map((m) => m.name)
  );

  // Calcular el maná efectivo: al menos igual a la Inteligencia del jugador.
  const effectiveMana = Math.max(
    gameState.mana,
    gameState.playerStats.intelligence
  );
  console.log(
    "Maná acumulado:",
    gameState.mana,
    "Inteligencia:",
    gameState.playerStats.intelligence,
    "Maná efectivo:",
    effectiveMana
  );

  // Si el maná efectivo es 0, no se puede lanzar el hechizo.
  if (effectiveMana <= 0) {
    message += `. Pero no tienes maná suficiente para lanzar el hechizo, por lo que el pergamino se desvanece en humo de colores entre tus manos.`;
    logAction(message);
    // Descarta el hechizo
    gameState.discardPile.push(spellCard);
    console.log("Hechizo descartado por falta de maná.");
    return true;
  }
  // El daño del hechizo es igual al maná efectivo.
  const damage = effectiveMana;
  gameState.mana = 0;
  console.log("Daño del hechizo:", damage, "Mana ahora:", gameState.mana);
  message += `, haciendo tanto daño a cada uno como Maná tienes acumulado: <strong>${effectiveMana}</strong>.`;

  let targetIndices = [];
  if (monstersInRoom.length <= targetCount) {
    // Si la cantidad de monstruos es menor o igual que targetCount, seleccionamos todos los índices de monstruos en el room.
    targetIndices = gameState.currentRoomCards
      .map((card, index) => (card && card.type === "monster" ? index : null))
      .filter((idx) => idx !== null);
    console.log("Selección automática de índices:", targetIndices);
  } else {
    console.log("Invocando selector de objetivos...");
    targetIndices = await showSpellTargetSelector(targetCount);
    console.log("Índices seleccionados por el usuario:", targetIndices);
  }

  // Aplicar el daño a cada monstruo seleccionado usando su índice en el room.
  targetIndices.forEach((index) => {
    const monster = gameState.currentRoomCards[index];
    if (monster) {
      const prevValue = monster.value;
      monster.value = Math.max(0, monster.value - damage);
      console.log(
        `Monstruo en slot ${index} (${monster.name}): ${prevValue} - ${damage} = ${monster.value}`
      );
      message += `<br>Monstruo dañado: ${monster.name}.`;
      if (monster.value === 0) {
        console.log(
          `Monstruo en slot ${index} (${monster.name}) destruido y descartado.`
        );
        message += `<br>Monstruo destruido: ${monster.name}.`;
        gameState.discardPile.push(monster);
        gameState.currentRoomCards[index] = null;
      }
    }
  });

  const remainingCards = gameState.currentRoomCards.filter(
    (card) => card !== null
  );
  console.log(
    "Cartas restantes en el room:",
    remainingCards.map((c) => (c ? c.name : "null"))
  );
  if (remainingCards.length === 0) {
    console.log("Room vacío. Pasando al siguiente room...");
    nextRoom();
  }

  console.log("=== castSpell finalizado ===");
  message += `<br>La magia ilumina la oscura habitación y los gritos de dolor de las criaturas alcanzadas hace eco en las paredes de piedra.`;
  logAction(message);
  return true;
}

export function logAction(message) {
  // Agregar el mensaje al log
  gameState.log.push(message);
  // si hay mas de 5, eliminar el mas antiguo
  if (gameState.log.lenght > 5) {
    gameState.log.shift();
  }
  // Actualizar la UI del log
  updateLogUI();
}

// Función para verificar si se alcanzó el Game Over
export function checkGameOver() {
  if (gameState.playerHealth.current <= 0) {
    console.log("Game Over detectado.");
    // Recopilamos algunas estadísticas del juego
    const dungeonsVisited = gameState.visitedDungeons || 0;
    const currentTier = gameState.deckTier;
    const cardsRemaining = gameState.dungeonDeck.length;
    const cardsPlayed = gameState.discardPile.length;
    const bestWeapon =
      gameState.discardPile
        .filter((card) => card.type === "weapon")
        .sort((a, b) => b.value - a.value)[0] || null;
    const bestArmor =
      gameState.discardPile
        .filter((card) => card.type === "armor")
        .sort((a, b) => b.value - a.value)[0] || null;
    showGameOverModal({
      dungeonsVisited,
      currentTier,
      cardsRemaining,
      cardsPlayed,
    });
  }
}

// Función para verificar si se completó el dungeon actual
export async function checkDungeonVictory() {
  // Verificamos si el dungeon está vacío y además no quedan cartas en la habitación
  if (
    gameState.dungeonDeck.length === 0 &&
    gameState.currentRoomCards.every((card) => card === null)
  ) {
    console.log("¡Dungeon completado!");
    // Llamamos al modal de victoria y esperamos la elección del usuario
    try {
      const chosenStat = await showVictoryModal();
      // Actualizamos la estadística elegida (por ejemplo, incrementamos en 1)
      upgradePlayerStat(chosenStat);
      logAction(`¡Victoria! Has mejorado tu ${chosenStat}.`);
      proceedToNextDungeon();
    } catch (error) {
      console.error("El modal de victoria se cerró sin elegir:", error);
    }
  }
}

function upgradePlayerStat(stat) {
  // Supongamos que cada mejora incrementa el stat en 1
  if (gameState.playerStats.hasOwnProperty(stat)) {
    gameState.playerStats[stat] += 1;
    console.log(`Stat ${stat} incrementado a ${gameState.playerStats[stat]}`);
    saveGameState();
  } else {
    console.warn(`La estadística ${stat} no existe en playerStats.`);
  }
}

// Llamada tras showVictoryModal y upgradePlayerStat
function proceedToNextDungeon() {
  // Incrementar tier (si corresponde)
  gameState.deckTier++;
  // Llevar registro de cuántos dungeons se han completado
  gameState.visitedDungeons = (gameState.visitedDungeons || 0) + 1;

  // reset para nuevo run
  resetRun();

  // Inicializar de nuevo el mazo y la habitación
  generateRoomCards();

  drawUI();
  updateUI();
  saveGameState();

  console.log("¡Listo para el siguiente dungeon!");
}

async function resetRun() {
  return new Promise((resolve) => {
    // Reseteamos la salud y mana para el nuevo dungeon

    if (gameState.playerStats.constitution > 0) {
      gameState.playerHealth.max =
        gameState.playerHealth.base + gameState.playerStats.constitution * 5;
    } else {
      gameState.playerHealth.max = gameState.playerHealth.base;
    }

    gameState.playerHealth.current = gameState.playerHealth.max;
    gameState.mana = 0;
    console.log("Salud máxima actualizada:", gameState.playerHealth.max);

    // Se vacían los equipamientos y se reinicia el valor actual de armadura
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

    // Se reinician los mazos y la habitación
    gameState.currentRoomCards = [];
    gameState.dungeonDeck = [];
    gameState.cardsRemaining = 0;
    gameState.discardPile = [];
    gameState.newIndexes = [];

    // Reiniciamos banderas y log
    gameState.inTargetSelection = false;
    gameState.log = [];

    //console log all player stats
    console.log(gameState.playerStats);
    console.log(gameState.playerHealth);
    console.log(gameState.mana);
    console.log(gameState.playerEquipment);
    console.log(gameState.newEquipment);

    console.log("Reset de datos volatiles completado.");
    resolve();
  });
}

export function runFromRoom() {
  // Comprobar que la room esté completa (ningún slot vacío)
  if (gameState.currentRoomCards.some((card) => card === null)) {
    console.log("La habitación no está completa, no puedes correr.");
    logAction(
      `Ya te has adentrado demasiado en esta habitación, no puedes huir ahora!`
    );
    return false;
  }

  // Comprobar que no se haya corrido ya en esta room
  if (gameState.runUsed > 0) {
    console.log("Ya has corrido en esta habitación.");
    logAction(
      `Has llegado a hasta aqui escapando de la habitación anterior... es hora de enfrentar los desafios.`
    );
    return false;
  }

  // Marcar que se ha usado "Run!" en la room actual

  gameState.runUsed = gameState.runUsed + 2;

  // Tomar las cartas de la habitación y mezclarlas
  const roomCards = gameState.currentRoomCards.slice();
  const shuffledRoomCards = shuffleArray(roomCards);

  // Añadir estas cartas al final del mazo del dungeon
  gameState.dungeonDeck = gameState.dungeonDeck.concat(shuffledRoomCards);

  // Vaciar la habitación (se puede generar una nueva room o dejarla vacía hasta que se llame a nextRoom)
  gameState.currentRoomCards = new Array(gameState.roomSize).fill(null);
  gameState.cardsRemaining = 0;

  console.log(
    "Has corrido de la habitación. Las cartas se han añadido al final del mazo.",
    gameState.runUsed
  );
  // Actualizar la UI para reflejar el cambio
  logAction(
    `Has escapado de esta habitación, pero solo por ahora. Para completar el Dungeon deberás volver más tarde y terminar lo que empezaste.`
  );
  saveGameState();
  nextRoom();
  updateUI();

  return true;
}
