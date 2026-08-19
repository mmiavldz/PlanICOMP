
import { cargarEstado } from './state.js';
import { render, actualizarProgreso } from './ui.js';
import { initStarfield } from './starfield.js';

document.addEventListener('DOMContentLoaded', () => {
  cargarEstado();
  render();
  actualizarProgreso();
  initStarfield();
});
