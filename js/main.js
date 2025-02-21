import { resetGameState, loadGameState } from "./gameState.js";

document.addEventListener("DOMContentLoaded", () => {
  // Chequear si hay un estado guardado en localStorage
  const savedState = localStorage.getItem("dungeonAttackState");
  const continueBtn = document.getElementById("continueBtn");
  if (savedState) {
    continueBtn.style.display = "block";
  } else {
    continueBtn.style.display = "none";
  }

  document.getElementById("startBtn").addEventListener("click", () => {
    // Reiniciar el estado del juego y borrar el almacenamiento local.
    localStorage.removeItem("dungeonAttackState");
    resetGameState();
    // Luego, redirigir a game.html (que se cargará una sola vez y no se refrescará)
    window.location.href = "game.html";
  });

  document.getElementById("continueBtn").addEventListener("click", () => {
    // Cargar el estado guardado
    const loaded = loadGameState();
    if (loaded) {
      window.location.href = "game.html";
    } else {
      // Si por alguna razón no se pudo cargar, quizás mostrar un mensaje o reiniciar.
      alert("No se pudo cargar el juego guardado. Se iniciará un nuevo juego.");
      localStorage.removeItem("dungeonAttackState");
      resetGameState();
      window.location.href = "game.html";
    }
  });
});
