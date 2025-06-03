import { loadGameState, resetGameState, gameState } from "./gameState.js";
import { cardData } from "../data/cards.js";
import {
  processCard,
  generateRoomCards,
  checkGameOver,
  checkDungeonVictory,
  runFromRoom,
} from "./gameLogic.js";

// Cargar el estado guardado o comenzar de 0
document.addEventListener("DOMContentLoaded", () => {
  if (localStorage.getItem("dungeonAttackState")) {
    console.log("Cargando estado guardado...");
    loadGameState(); // Actualiza gameState con el estado guardado
  } else {
    console.log("No se encontró estado guardado, iniciando juego nuevo...");
    generateRoomCards();
  }
  drawUI();
  updateUI();
});

export function updateUI() {
  drawDungeon();
  if (!gameState.inTargetSelection) {
    drawRoom();
  }
  drawPlayer();
  updateHealthBar();
  console.log("[updateUI] Player health:", gameState.playerHealth.current);
  console.log("[updateUI] Player health max:", gameState.playerHealth.max);
}

export function drawUI() {
  const app = document.getElementById("app");
  app.innerHTML = `
    <div id="dungeon" class="dungeon"></div>
    <div id="room" class="room"></div>
    <div id="spellTargetContainer" class="spell-target-container" style="display: none;"></div>
    <div id="player" class="player"></div>
    <div id="logContainer" class="log-container"></div>
  `;

  drawDungeon();
  drawRoom();
  drawPlayer();
}

// Función reusable para dibujar una carta según su tipo y propiedades
function drawCard(
  card,
  index,
  extraClass = "",
  includeDefault = true,
  overrideValue = null,
  overrideType = null
) {
  // Determinamos el tipo a usar (overrideType si se pasa, o el original)
  const newType = overrideType !== null ? overrideType : card.type;
  let baseClass = includeDefault ? "card" : "";
  let emoji = "";
  switch (newType) {
    case "monster":
      emoji = "💀";
      break;
    case "weapon":
      emoji = "⚔️";
      break;
    case "armor":
      emoji = "🛡️";
      break;
    case "potion":
      emoji = "🏺";
      break;
    case "spell":
      emoji = "🔮";
      break;
    case "mana":
      emoji = "🌀";
      break;
    case "fist":
      emoji = "👊";
      break;
    case "healing":
      emoji = "❤️‍🩹";
      break;
    case "strength":
      emoji = "💪";
      break;
    case "constitution":
      emoji = "⚕️";
      break;
    case "intelligence":
      emoji = "🧠";
      break;
    default:
      emoji = "❓";
  }
  const displayValue = overrideValue !== null ? overrideValue : card.value;
  const isPlaceholder = extraClass.includes("placeholder");
  return `<div class="${baseClass} ${extraClass}" data-index="${index}" data-id="${
    card.id
  }" data-type="${card.type}" data-value="${card.value}">
    
    <div class="card-content">
      <div class="card-header">
        <span class="card-value">${displayValue}</span>  
      </div>
      <div class="card-image">
        <img src="assets/cards/${card.id}.png" alt="${
    card.name
  }" onerror="this.style.display='none';" />
      </div>
      <div class="card-footer">
        <div class="card-emoji">${emoji}</div>
        <div class="card-name">${card.name}</div>
      </div>
    </div>
    ${isPlaceholder ? "" : '<div class="card-frame"></div>'}
  </div>`;
}

function drawDungeon() {
  const dungeonEl = document.getElementById("dungeon");
  dungeonEl.innerHTML = `
      <div class="dungeon-container">
        <div class="deck-pile">
          <div class="card-back">
            <div class="count-background">
              <span class="card-count">${gameState.dungeonDeck.length}</span>
            </div>
          </div>
        </div>
        <div class="dungeon-title">
          <h2>Dungeon Attack!</h2>
          <button id="backBtn" class="back-button">Volver</button>
          <div id="run" class="run-button">Escapar</div>
        </div>
        <div class="discard-pile">
          <div class="card-back">
            <div class="count-background">
              <span class="card-count">${gameState.discardPile.length}</span>
            </div>
          </div>
        </div>
      </div>
    `;
  const backBtn = document.getElementById("backBtn");
  if (backBtn) {
    backBtn.addEventListener("click", () => {
      window.location.href = "index.html";
    });
  }

  const runBtn = document.getElementById("run");
  if (runBtn) {
    runBtn.addEventListener("click", () => {
      runFromRoom();
    });
  }
}

function drawRoom() {
  const roomEl = document.getElementById("room");
  const roomSize = gameState.roomSize;
  let slotsHtml = "";

  for (let i = 0; i < roomSize; i++) {
    const card = gameState.currentRoomCards[i];
    if (card) {
      slotsHtml += drawCard(card, i);
    } else {
      slotsHtml += `<div class="card-placeholder" data-index="${i}"></div>`;
    }
  }

  roomEl.innerHTML = `
    <div class="cards">${slotsHtml}</div>
  `;

  // Asignamos event listeners solo a los slots con carta (no a los placeholder)
  const cardElements = roomEl.querySelectorAll(".card:not(.placeholder)");
  cardElements.forEach((cardEl) => {
    cardEl.addEventListener("click", async () => {
      const index = parseInt(cardEl.getAttribute("data-index"));
      await processCard(index);
      updateUI();
    });
  });
  // Si hay índices nuevos, aplicamos la animación solo a esos slots
  if (gameState.newIndexes && gameState.newIndexes.length > 0) {
    gameState.newIndexes.forEach((idx, i) => {
      setTimeout(() => {
        const element = document.querySelector(
          `.cards .card[data-index="${idx}"]`
        );
        if (element) {
          element.classList.add("pop");
          setTimeout(() => {
            element.classList.remove("pop");
          }, 500); // duración de la animación
        }
      }, i * 200); // cada carta se anima con 200ms de retraso adicional
    });
    gameState.newIndexes = [];
  }
}

// Función para buscar una carta por su ID en el pool correspondiente
function findCardById(id, type) {
  // Suponiendo que en cardData tenemos un objeto con las cartas
  return cardData[type].find((card) => card.id === id);
}

function drawPlayer() {
  const playerEl = document.getElementById("player");

  // Barra de vida
  const healthBarHTML = `
  <div class="health-bar">
    <div class="health-bar-inner" id="healthBarInner"></div>
    <div class="health-text" id="healthText">${gameState.playerHealth.current} / ${gameState.playerHealth.max}</div>
  </div>
`;

  // Dibujo del arma equipada (usando drawCard) calculando su valor efectivo y mostramos la formula
  let weaponHtml;
  if (gameState.playerEquipment.weapon) {
    const baseValue = gameState.playerEquipment.weapon.value;

    weaponHtml = `
      <div class="weapon-info">
        ${drawCard(gameState.playerEquipment.weapon, 0, "equipped", true)}
        
      </div>
    `;
  } else {
    weaponHtml = '<div class="placeholder-slot">⚔️</div>';
  }

  // Dibujo de la pila de monstruos derrotados
  const defeatedMonstersHtml = drawDefeatedMonsters();

  let armorHtml;
  if (gameState.playerEquipment.armor) {
    const baseArmor = gameState.playerEquipment.armor.value;
    const currentArmor = gameState.currentArmorValue; // Este valor se actualiza en combate
    armorHtml = `
    <div class="armor-info">
      ${drawCard(
        gameState.playerEquipment.armor,
        0,
        "equipped",
        true,
        currentArmor
      )}
      
    </div>
  `;
  } else {
    armorHtml = '<div class="placeholder-slot">🛡️</div>';
  }

  // Dibujo el Mana equipado
  // "Poción" convertida a Mana: si gameState.mana > 0, mostramos una "carta" ficticia de Mana
  const effectiveMana = gameState.mana + gameState.playerStats.intelligence;
  const manaCard = {
    id: 888,
    name: "Mana",
    value: effectiveMana,
    type: "mana",
  };
  const manaHtml =
    effectiveMana > 0
      ? `<div class="mana-info">
         ${drawCard(manaCard, 0, "equipped", true)}
         
        </div>
       `
      : '<div class="placeholder-slot">🌀</div>';

  playerEl.innerHTML = `
      
      <div class="equipment">
        <div class="equipped-weapon">
         
            <div class="weapon-group">
              <div class="weapon-slot">
                <p>${weaponHtml}</p>
              </div>
              <div class="defeated-monsters">
                ${defeatedMonstersHtml}
              </div>
            </div>
        </div>
        <div class="equipped-armor">
         
            <div class="armor-slot">
            <p>${armorHtml}</p>
            </div>
        </div>
        <div class="equipped-potion">
         
            <div class="potion-slot">
           <p>${manaHtml}</p>
           </div>
        </div>
      </div>
      <div class="stats">
        <p>💪🏻 Fuerza: <span id="str">${gameState.playerStats.strength}</span></p>
        <p>⚕️Constitución: <span id="con">${gameState.playerStats.constitution}</span></p>
        <p>🧠 Inteligencia: <span id="int">${gameState.playerStats.intelligence}</span></p>
      </div>
      <div class="health-bar-container">
        ${healthBarHTML}

      </div>
    `;
  // Animación secuencial para equipo nuevo:
  if (gameState.newEquipment.weapon) {
    const weaponEl = document.querySelector(".equipped-weapon .equipped");
    if (weaponEl) {
      weaponEl.classList.add("pop");
      setTimeout(() => {
        weaponEl.classList.remove("pop");
        gameState.newEquipment.weapon = false;
      }, 500);
    }
  }
  if (gameState.newEquipment.armor) {
    const armorEl = document.querySelector(".equipped-armor .equipped");
    if (armorEl) {
      armorEl.classList.add("pop");
      setTimeout(() => {
        armorEl.classList.remove("pop");
        gameState.newEquipment.armor = false;
      }, 500);
    }
  }
  if (gameState.newEquipment.potion) {
    const potionEl = document.querySelector(".equipped-potion .equipped");
    if (potionEl) {
      potionEl.classList.add("pop");
      setTimeout(() => {
        potionEl.classList.remove("pop");
        gameState.newEquipment.potion = false;
      }, 500);
    }
  }
}

function drawDefeatedMonsters() {
  // Si no hay monstruos derrotados, mostramos un mensaje simple
  if (
    !gameState.weaponDefeatedMonsters ||
    gameState.weaponDefeatedMonsters.length === 0
  ) {
    return `<p class="empty-stack"></p>`;
  }

  let html = `<div class="monster-stack">`;
  // Limitar el número de cartas a 5
  const maxCards = 5;
  const cardsToShow = gameState.weaponDefeatedMonsters.slice(-maxCards);

  // Recorremos la pila. A todos excepto el último se les muestra solo el valor (mini-card)
  cardsToShow.forEach((card, index) => {
    if (index < cardsToShow.length - 1) {
      html += drawCard(card, 0, "stack-top", false);
    } else {
      // La última carta se muestra completa usando drawCard con una clase extra para el stack
      html += drawCard(card, 0, "stack-top", false);
    }
  });
  html += `</div>`;
  return html;
}

// MODAL

export function showModal(modalType, options = {}, canUseWeapon) {
  const modal = document.getElementById("gameModal");
  const modalContent = document.getElementById("modalContent");
  let fistDamage = gameState.playerStats.strength;
  let fistCard = {
    id: 999,
    name: "Puño limpio",
    value: fistDamage,
    type: "fist",
  };

  if (modalType === "monster") {
    const monsterValue = options.monsterCard.value;
    const armorValue = gameState.currentArmorValue || 0;
    const fistValue = gameState.playerStats.strength;
    const weaponValue = gameState.playerEquipment.weapon
      ? gameState.playerEquipment.weapon.value
      : 0;

    let weaponOptionHTML = "";
    if (canUseWeapon === "SI") {
      weaponOptionHTML = options.weaponCard
        ? drawCard(options.weaponCard, 0, "equipped", true)
        : `<p>No arma equipada</p>`;
    } else if (canUseWeapon === "NO WEAPON") {
      weaponOptionHTML = `<div class="card-placeholder"></div>`;
    } else if (canUseWeapon === "WEAPON USED") {
      weaponOptionHTML = options.weaponCard
        ? drawCard(options.weaponCard, 0, "equipped unavailable", true)
        : `<p>No arma equipada</p>`;
    }

    modalContent.innerHTML = `
        <div id="closeModal" class="close-modal">X</div>
        <h3>Enfrentar ${options.monsterCard.name}</h3>
        <div class="modal-monster">
          ${drawCard(options.monsterCard, 0, "equipped", true)}
        </div>
        <div class="battle-analysis">▼ Como quieres atacar? ▼</div>
        <div class="modal-options">
          <div class="option" data-value="weapon">
            ${weaponOptionHTML}
          </div>
          <div class="option" data-value="unarmed">
            ${drawCard(fistCard, 0, "equipped", true)}
          </div>
        </div>
      `;

    const battleAnalysisEl = modalContent.querySelector(".battle-analysis");

    //calcular y mostrar el daño
    function showAnalysis(chosenValue, attackIcon) {
      let finalDamage = monsterValue - chosenValue - armorValue;
      if (finalDamage < 0) finalDamage = 0;
      battleAnalysisEl.textContent = `💀 ${monsterValue} - ${attackIcon} ${chosenValue} - 🛡️ ${armorValue} = Recibes ${finalDamage} daños!`;

      if (gameState.playerHealth.current - finalDamage <= 0) {
        battleAnalysisEl.textContent += " 🪦 ";
      }
    }

    // Asignar listeners de hover a las opciones
    const optionElements = modalContent.querySelectorAll(".option");
    optionElements.forEach((optionEl) => {
      optionEl.addEventListener("mouseover", () => {
        const choice = optionEl.dataset.value;
        if (choice === "weapon") {
          if (canUseWeapon === "SI") {
            showAnalysis(weaponValue, "⚔️");
          } else if (canUseWeapon === "WEAPON USED") {
            battleAnalysisEl.textContent =
              "🚫 Ya derrotaste un monstruo igual o menor con esta arma!";
          } else if (canUseWeapon === "NO WEAPON") {
            battleAnalysisEl.textContent = "🚫 No tienes un arma equipada!";
          }
        } else {
          showAnalysis(fistValue, "👊🏻");
        }
      });
      optionEl.addEventListener("mouseout", () => {
        battleAnalysisEl.textContent = "▼ Como quieres atacar? ▼";
      });
    });
  } else if (modalType === "potion") {
    let manaCard = {
      id: 888,
      name: "Mana",
      value: options.potionCard.value,
      type: "mana",
    };

    let healingCard = {
      id: 777,
      name: "Curación",
      value: options.potionCard.value,
      type: "healing",
    };

    const potionHealthValue = options.potionCard.value;
    const potionManaValue = options.potionCard.value;
    const playerHealth = gameState.playerHealth.current;
    const playerMaxHealth =
      gameState.playerHealth.max + gameState.playerStats.constitution * 5;
    const playerMana = gameState.mana + gameState.playerStats.intelligence;

    modalContent.innerHTML = `
        <div id="closeModal" class="close-modal">
          <span>X</span>
          </div>
        <h3>Usar ${options.potionCard.name}</h3>
        <div class="modal-potion">
          ${drawCard(options.potionCard, 0, "equipped", true)}
        </div>
        <div class="battle-analysis">▼ Como quieres usar la poción? ▼</div>
        <div class="modal-options">
          <div class="option" data-value="use">
            ${drawCard(healingCard, 0, "equipped", true)}
          </div>
          <div class="option" data-value="equip">
            ${drawCard(manaCard, 0, "equipped", true)}
            </div>
          </div>
        </div>
        `;
    const battleAnalysisEl = modalContent.querySelector(".battle-analysis");

    //calcular y mostrar la salud o el mana incrementados
    function showAnalysis(chosenValue, type) {
      // finalHealth cannot exceed playerMaxHealth
      let finalHealth = potionHealthValue + playerHealth;
      if (finalHealth > playerMaxHealth) finalHealth = playerMaxHealth;
      let finalMana = potionManaValue + playerMana;
      if (type == "salud") {
        battleAnalysisEl.textContent = `❤️ ${playerHealth} + ❤️‍🩹 ${potionHealthValue} = ${finalHealth} salud!`;
      } else {
        battleAnalysisEl.textContent = `🌀 ${playerMana} + 🌀 ${potionManaValue} = ${finalMana} mana!`;
      }
    }

    // Asignar listeners de hover a las opciones
    const optionElements = modalContent.querySelectorAll(".option");
    optionElements.forEach((optionEl) => {
      optionEl.addEventListener("mouseover", () => {
        const choice = optionEl.dataset.value;
        if (choice === "use") {
          showAnalysis(potionHealthValue, "salud");
        } else {
          showAnalysis(potionManaValue, "mana");
        }
      });
      optionEl.addEventListener("mouseout", () => {
        battleAnalysisEl.textContent = "▼ Como quieres usar la poción? ▼";
      });
    });
  } else {
    // Otros tipos de modal pueden definirse acá
    modalContent.innerHTML = `<h3>Modal no implementado para el tipo ${modalType}</h3>`;
  }

  modal.style.display = "flex";
  const closeModalBtn = modalContent.querySelector("#closeModal");

  return new Promise((resolve) => {
    // Get all option elements within the modal content
    const optionElements = modalContent.querySelectorAll(".option");
    // Iterate over each option element
    optionElements.forEach((optionEl) => {
      const cardEl = optionEl.querySelector(".card");
      // Check if the option is unavailable
      if (cardEl && cardEl.classList.contains("unavailable")) {
        console.log("Option is unavailable");
        return;
      } else {
        // Add a click event listener to the current option element
        optionEl.addEventListener("click", function onClick() {
          // Get the selected choice from the 'data-value' attribute
          const choice = optionEl.getAttribute("data-value");
          // Hide the modal
          modal.style.display = "none";
          // Remove event listeners from all option elements to prevent duplicates
          optionElements.forEach((opt) => {
            opt.removeEventListener("click", onClick);
          });
          // Log the selected choice to the console
          console.log("Modal choice:", choice);
          // Resolve the promise with the selected choice
          resolve(choice);
        });
      }
    });
    // Add event listener to close button to reject the promise
    closeModalBtn.addEventListener("click", () => {
      modal.style.display = "none";
      reject(new Error("Modal closed by user"));
    });
  });
}

function updateHealthBar() {
  const healthBarInner = document.getElementById("healthBarInner");
  const healthText = document.getElementById("healthText");
  const current = gameState.playerHealth.current;
  const max = gameState.playerHealth.max;
  const percent = Math.max(0, Math.min(100, (current / max) * 100));

  // Actualizamos el width
  healthBarInner.style.width = percent + "%";
  // Actualizamos el texto
  healthText.textContent = `${current} / ${max}`;

  // Si la salud se ha reducido, agregamos la clase de sacudida
  if (current < gameState.playerHealth.prev) {
    healthBarInner.classList.add("shake");
    setTimeout(() => {
      healthBarInner.classList.remove("shake");
    }, 500);
  }
  //actualizamos el valor previo
  gameState.playerHealth.prev = current;
  console.log("[updateHealthBar] Salud previa:", gameState.playerHealth.prev);
  console.log(
    "[updateHealthBar] Salud actual:",
    gameState.playerHealth.current
  );
  console.log("[updateHealthBar] Salud máxima:", gameState.playerHealth.max);
  checkGameOver();
}

export function showSpellTargetSelector(targetCount) {
  return new Promise((resolve) => {
    console.log(
      "[Selector] Iniciando showSpellTargetSelector con targetCount:",
      targetCount
    );
    // Activamos el modo selección para que processCard lo ignore.
    gameState.inTargetSelection = true;

    // Obtenemos el contenedor "dock" ya definido debajo del room.
    const dock = document.getElementById("spellTargetContainer");
    dock.style.display = "flex";

    // Creamos indicadores: tantos círculos como objetivos se deben seleccionar.
    let indicatorsHTML = "";
    for (let i = 0; i < targetCount; i++) {
      indicatorsHTML += `<div class="target-indicator"></div>`;
    }

    // Insertamos en el dock los indicadores y el botón de confirmación.
    dock.innerHTML = `
      <div class="target-indicators">${indicatorsHTML}</div>
      <button id="confirmTargets" disabled>Confirmar objetivos</button>
    `;
    console.log("[Selector] Dock configurado con indicadores:", indicatorsHTML);

    // Seleccionamos todas las cartas del room.
    const roomCards = document.querySelectorAll("#room .card");
    console.log("[Selector] Total de cartas en room:", roomCards.length);

    // Oscurecemos (dim) las cartas que no son monstruos.
    roomCards.forEach((cardEl, i) => {
      const type = cardEl.getAttribute("data-type");
      console.log(`[Selector] Procesando carta en slot ${i} - tipo: ${type}`);
      if (type !== "monster") {
        cardEl.classList.add("dimmed");
        cardEl.style.pointerEvents = "none";
        console.log(`[Selector] Slot ${i} oscurecido (no es monstruo)`);
      } else {
        // Para las de tipo "monster", nos aseguramos que estén habilitadas para seleccionar.
        cardEl.classList.add("selectable");
        cardEl.style.pointerEvents = "auto";
        console.log(
          `[Selector] Slot ${i} habilitado para selección (monstruo)`
        );
      }
    });

    // Obtenemos únicamente las cartas de monstruo (ya que son las seleccionables).
    const monsterCards = document.querySelectorAll(
      "#room .card[data-type='monster']"
    );
    console.log(
      "[Selector] Total de cartas de monstruo seleccionables:",
      monsterCards.length
    );

    // Creamos un Set para almacenar los índices seleccionados.
    const selectedIndices = new Set();

    // Función para actualizar los indicadores y el botón de confirmación.
    function updateDockIndicators() {
      const indicators = dock.querySelectorAll(".target-indicator");
      console.log(
        "[Selector] Actualizando indicadores. Indices seleccionados:",
        Array.from(selectedIndices)
      );
      indicators.forEach((indicator, i) => {
        if (i < selectedIndices.size) {
          indicator.classList.add("active");
        } else {
          indicator.classList.remove("active");
        }
      });
      const confirmBtn = dock.querySelector("#confirmTargets");
      confirmBtn.disabled = selectedIndices.size !== targetCount;
      console.log(
        "[Selector] Botón Confirmar:",
        confirmBtn.disabled ? "Deshabilitado" : "Habilitado"
      );
    }

    // Función que se ejecuta cuando se hace clic en una carta de monstruo.
    function onMonsterSelect(e) {
      e.stopPropagation();
      const cardEl = e.currentTarget;
      const idx = parseInt(cardEl.getAttribute("data-index"));
      console.log("[Selector] Click en carta de monstruo en slot:", idx);
      if (selectedIndices.has(idx)) {
        selectedIndices.delete(idx);
        cardEl.classList.remove("selected");
        console.log("[Selector] Deseleccionado slot:", idx);
      } else {
        if (selectedIndices.size < targetCount) {
          selectedIndices.add(idx);
          cardEl.classList.add("selected");
          console.log("[Selector] Seleccionado slot:", idx);
        } else {
          console.log(
            "[Selector] Límite de selección alcanzado. No se puede seleccionar slot:",
            idx
          );
        }
      }
      updateDockIndicators();
    }

    // Asignamos event listeners a las cartas de monstruo.
    monsterCards.forEach((cardEl) => {
      cardEl.addEventListener("click", onMonsterSelect);
    });

    // Listener para el botón de confirmar.
    const confirmBtn = dock.querySelector("#confirmTargets");
    confirmBtn.addEventListener("click", () => {
      console.log(
        "[Selector] Confirmar objetivos clickeado. Indices seleccionados:",
        Array.from(selectedIndices)
      );
      // Restauramos la interactividad de todas las cartas del room.
      roomCards.forEach((cardEl) => {
        cardEl.classList.remove("dimmed", "selectable", "selected");
        cardEl.style.pointerEvents = "auto";
        cardEl.removeEventListener("click", onMonsterSelect);
      });
      // Ocultamos el dock y desactivamos el modo selección.
      dock.style.display = "none";
      gameState.inTargetSelection = false;
      // Devolvemos los índices seleccionados.
      resolve(Array.from(selectedIndices));
      console.log(
        "[Selector] Selector finalizado, se resolvió la promesa con índices:",
        Array.from(selectedIndices)
      );
    });

    console.log(
      "[Selector] showSpellTargetSelector finalizó su configuración."
    );
  });
}

export function updateLogUI() {
  const logContainer = document.getElementById("logContainer");
  // Usamos slice() para crear una copia y luego reverse() para invertir el orden
  logContainer.innerHTML = gameState.log
    .slice()
    .reverse()
    .map((action) => `<p>${action}</p>`)
    .join("");
}

export function showGameOverModal({
  dungeonsVisited,
  currentTier,
  cardsRemaining,
  cardsPlayed,
}) {
  const modal = document.getElementById("gameModal");
  const modalContent = document.getElementById("modalContent");
  modalContent.classList.add("game-over");

  // Construimos el HTML del modal de Game Over
  const modalHtml = `
  <div class="game-over-title">
      
    <h3>💀 Derrota! 💀</h3>
  </div>
  <div class="game-over-stats">
    <p><strong>Dungeons explorados:</strong> ${dungeonsVisited}</p>
    <p><strong>Tier alcanzado:</strong> ${currentTier}</p>
    <p><strong>Cartas en el Dungeon:</strong> ${cardsRemaining}</p>
    <p><strong>Cartas jugadas:</strong> ${cardsPlayed}</p>
  </div>
    <div class="game-over-button" id="newGameBtn">Nuevo Juego</div>
  `;
  modalContent.innerHTML = modalHtml;
  modal.style.display = "flex";

  // Agregar listener para el botón "Nuevo juego"
  document.getElementById("newGameBtn").addEventListener("click", () => {
    // Reiniciamos el estado: borramos el estado guardado y reseteamos gameState
    localStorage.removeItem("dungeonAttackState");
    resetGameState();
    // Redirigimos al index (o donde inicie un nuevo juego)
    window.location.href = "game.html";
  });
}

export function showVictoryModal() {
  const modal = document.getElementById("gameModal");
  const modalContent = document.getElementById("modalContent");

  const strengthCard = {
    id: 1001,
    name: "+1 Fuerza",
    value: "",
    type: "strength",
  };
  const constitutionCard = {
    id: 1002,
    name: "+1 Constitución",
    value: "",
    type: "constitution",
  };
  const intelligenceCard = {
    id: 1003,
    name: "+1 Inteligencia",
    value: "",
    type: "intelligence",
  };

  modalContent.innerHTML = `
  <div class="game-over-title">
    <h3>⚜️ ¡Victória! ⚜️</h3>
  </div>
    <div class="game-over-stats">
    Dificultad del Dungeon completado: ${gameState.deckTier}
    </div>
    <div class="victory-rules">
    <p>Elige una estadística para mejorar:</p>
    <p><strong>💪🏻 Fuerza (${
      gameState.playerStats.strength
    }):</strong> Mejora tus ataques a puño limpio.
    <p><strong>⚕️ Constitución  (${
      gameState.playerStats.constitution
    }):</strong> Incrementa tu salud máxima.
    <p><strong>🧠 Inteligencia  (${
      gameState.playerStats.intelligence
    }):</strong> Aumenta tu mana permanente.
    </div>
    <div class="modal-options">
      <div class="option" data-value="strength">
      ${drawCard(strengthCard, 0, "equipped", true)}
      </div>
    <div class="option" data-value="constitution">
      ${drawCard(constitutionCard, 0, "equipped", true)}
    </div>
    <div class="option" data-value="intelligence">
      ${drawCard(intelligenceCard, 0, "equipped", true)}
    </div>
      
  `;

  modal.style.display = "flex";

  return new Promise((resolve, reject) => {
    const optionElements = modalContent.querySelectorAll(".option");

    optionElements.forEach((optionEl) => {
      optionEl.addEventListener("click", function onClick() {
        const chosenStat = optionEl.getAttribute("data-value");
        modal.style.display = "none";
        // Remover listeners para evitar duplicados
        optionElements.forEach((opt) => {
          opt.removeEventListener("click", onClick);
        });
        resolve(chosenStat);
      });
    });
  });
}
