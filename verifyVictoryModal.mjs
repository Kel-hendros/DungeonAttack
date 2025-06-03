import { JSDOM } from 'jsdom';

const dom = new JSDOM(`<html><body><div id="gameModal" style="display:none"><div id="modalContent"></div></div></body></html>`, { url: 'http://localhost' });

globalThis.window = dom.window;
globalThis.document = dom.window.document;
globalThis.localStorage = dom.window.localStorage;

const { showVictoryModal } = await import('./js/ui.js');

showVictoryModal();

const heading = document.querySelector('.game-over-title h3').textContent;
console.log(heading);
