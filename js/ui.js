import { generateRoomCards } from "./gameLogic.js";
import { gameState } from "./gameState.js";
import { cardData } from "../data/cards.js";
import { processCard } from "./gameLogic.js";

function updateUI() {
  drawDungeon();
  drawRoom();
  drawPlayer();
  updateHealthBar();
}

document.addEventListener("DOMContentLoaded", () => {
  // Inicializamos la partida y generamos las cartas del room
  generateRoomCards();
  drawUI();
});

function drawUI() {
  const app = document.getElementById("app");
  app.innerHTML = `
    <div id="dungeon" class="dungeon"></div>
    <div id="room" class="room"></div>
    <div id="player" class="player"></div>
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
  overrideValue = null
) {
  let baseClass = includeDefault ? "card" : "";
  let emoji = "";
  switch (card.type) {
    case "monster":
      emoji = "👹";
      break;
    case "weapon":
      emoji = "🗡️";
      break;
    case "armor":
      emoji = "🛡️";
      break;
    case "potion":
      emoji = "💊";
      break;
    case "spell":
      emoji = "🔮";
      break;
    default:
      emoji = "❓";
  }
  // Si se pasa overrideValue, se muestra en lugar de card.value
  const displayValue = overrideValue !== null ? overrideValue : card.value;
  return `<div class="${baseClass} ${extraClass}" data-index="${index}" data-id="${card.id}" data-type="${card.type}" data-value="${card.value}">
            ${emoji}<span>${displayValue}</span>
          </div>`;
}

function drawDungeon() {
  const dungeonEl = document.getElementById("dungeon");
  dungeonEl.innerHTML = `
      <div class="dungeon-container">
        <div class="deck-pile">
          <div class="card-back">
            <span class="card-count">${gameState.dungeonDeck.length}</span>
          </div>
        </div>
        <div class="dungeon-title">
          <h2>Dungeon Attack!</h2>
        </div>
        <div class="discard-pile">
          <div class="card-back">
            <span class="card-count">${gameState.discardPile.length}</span>
          </div>
        </div>
      </div>
    `;
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
      slotsHtml += `<div class="card placeholder" data-index="${i}"></div>`;
    }
  }

  roomEl.innerHTML = `
    <h2>Habitación</h2>
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
    const strength = gameState.playerStats.strength;
    const effectiveValue = baseValue + strength;
    weaponHtml = `
      <div class="weapon-info">
        ${drawCard(
          gameState.playerEquipment.weapon,
          0,
          "equipped",
          false,
          effectiveValue
        )}
        <p class="weapon-value">
          <span class="formula">(${baseValue} + ${strength})</span>
        </p>
      </div>
    `;
  } else {
    weaponHtml = "-";
  }

  // Dibujo de la pila de monstruos derrotados
  const defeatedMonstersHtml = drawDefeatedMonsters();

  // Dibujo de la armadura equipada
  const armorHtml = gameState.playerEquipment.armor
    ? drawCard(gameState.playerEquipment.armor, 0, "equipped", false)
    : "-";

  // Dibujo el Mana equipado
  const manaHtml = gameState.playerEquipment.potion
    ? drawCard(gameState.playerEquipment.potion, 0, "equipped", false)
    : "-";

  playerEl.innerHTML = `
      <h2>Personaje</h2>
      <div class="equipment">
        <div class="equipped-weapon">
            <p>Armamento</p>
            <p>${weaponHtml}</p>
            <div class="defeated-monsters">
            ${defeatedMonstersHtml}
            </div>
        </div>
        <div class="equipped-armor">
            <p>Protección</p>
            <p>${armorHtml}</p>
        </div>
        <div class="equipped-potion">
            <p>Mana</p>
           <p>${manaHtml}</p>
        </div>
      </div>
      <div class="stats">
        <p>Fuerza: <span id="str">${gameState.playerStats.strength}</span></p>
        <p>Constitución: <span id="con">${gameState.playerStats.constitution}</span></p>
        <p>Inteligencia: <span id="int">${gameState.playerStats.intelligence}</span></p>
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
  // Recorremos la pila. A todos excepto el último se les muestra solo el valor (mini-card)
  gameState.weaponDefeatedMonsters.forEach((card, index) => {
    if (index < gameState.weaponDefeatedMonsters.length - 1) {
      html += `<div class="stack-card mini-card"><span>${card.value}</span></div>`;
    } else {
      // La última carta se muestra completa usando drawCard con una clase extra para el stack
      html += drawCard(card, 0, "stack-top");
    }
  });
  html += `</div>`;
  return html;
}

// MODAL

export function showModal(modalType, options = {}) {
  const modal = document.getElementById("gameModal");
  const modalContent = document.getElementById("modalContent");

  if (modalType === "monster") {
    // Esperamos que options incluya: monsterCard y weaponCard
    modalContent.innerHTML = `
        <h3>Enfrentar monstruo</h3>
        <div class="modal-monster">
          ${drawCard(options.monsterCard, 0, "modal-monster-card", false)}
        </div>
        <div class="modal-options">
          <div class="option" data-value="weapon">
            ${
              options.weaponCard
                ? drawCard(options.weaponCard, 0, "modal-weapon-card")
                : `<p>No arma equipada</p>`
            }
          </div>
          <div class="option" data-value="unarmed">
            <div class="fist-option card">
              <span style="font-size:2rem;">👊</span>
            </div>
          </div>
        </div>
      `;
  } else if (modalType === "potion") {
    modalContent.innerHTML = `
        <h3>Usar poción</h3>
        <div class="modal-potion">
          ${drawCard(options.potionCard, 0, "modal-potion-card", false)}
        </div>
        <div class="modal-options">
          <div class="option" data-value="use">
            <div class="fist-option card">
                <span style="font-size:2rem;">❤️‍🩹</span>
            </div>
          </div>
          <div class="option" data-value="equip">
            <div class="fist-option card">
             <span style="font-size:2rem;">🌀</span>
            </div>
          </div>
        </div>
        `;
  } else {
    // Otros tipos de modal pueden definirse acá
    modalContent.innerHTML = `<h3>Modal no implementado para el tipo ${modalType}</h3>`;
  }

  modal.style.display = "flex";

  return new Promise((resolve) => {
    // Get all option elements within the modal content
    const optionElements = modalContent.querySelectorAll(".option");
    // Iterate over each option element
    optionElements.forEach((optionEl) => {
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
        console.log("Modal choiceeee:", choice);
        // Resolve the promise with the selected choice
        resolve(choice);
      });
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
  console.log(gameState.playerHealth.prev);
}

// animacion de nueva carta en la mesa
function applyPopAnimation(selector) {
  const elements = document.querySelectorAll(selector);
  elements.forEach((el) => {
    el.classList.add("pop");
    setTimeout(() => {
      el.classList.remove("pop");
    }, 500); // tiempo en milisegundos igual a la duración de la animación
  });
}
