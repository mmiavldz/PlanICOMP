/* ============================================================
   ui.js — Construcción y actualización del DOM
   Las preguntas de dominio ("¿está disponible esta materia?")
   las responde state.js, no este archivo. Acá solo se arma HTML.
   ============================================================ */

import { materias, estructuraCurricular, SELECTIVAS } from './data.js';
import {
  obtenerEstado,
  aprobar,
  desaprobar,
  getNombreSelectiva,
  setNombreSelectiva,
  cantAprobadas,
  correlativasFaltantes,
} from './state.js';

// ── Toast ─────────────────────────────────────────────────────────────────────

const toastEl = document.getElementById('toast');
let toastTimer = null;

export function mostrarToast(mensaje, tipo = 'success') {
  clearTimeout(toastTimer);
  toastEl.textContent = mensaje;
  toastEl.className = `toast toast--${tipo} toast--visible`;
  toastTimer = setTimeout(() => {
    toastEl.className = 'toast';
  }, 2600);
}

// ── Progreso ──────────────────────────────────────────────────────────────────

export function actualizarProgreso() {
  const total = materias.length;
  const count = cantAprobadas();
  const pct   = Math.round((count / total) * 100);

  document.getElementById('progress-label').textContent = `${count} / ${total} materias`;
  document.getElementById('progress-pct').textContent   = `${pct}%`;
  document.getElementById('progress-fill').style.width  = `${pct}%`;
  document.getElementById('progress-track').setAttribute('aria-valuenow', pct);
}

// ── Cards ─────────────────────────────────────────────────────────────────────

function agregarPulseRing(card) {
  const ring = document.createElement('span');
  ring.className = 'pulse-ring';
  ring.setAttribute('aria-hidden', 'true');
  card.appendChild(ring);
  setTimeout(() => ring.remove(), 600);
}

function construirInputSelectiva(materia) {
  const input = document.createElement('input');
  input.type        = 'text';
  input.className   = 'selectiva-input';
  input.placeholder = 'Nombre de la materia…';
  input.value       = getNombreSelectiva(materia.id);
  input.setAttribute('aria-label', `Nombre para ${materia.nombre}`);

  input.addEventListener('input', e => {
    setNombreSelectiva(materia.id, e.target.value);
  });
  input.addEventListener('click', e => e.stopPropagation());
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') e.stopPropagation();
  });

  return input;
}

// ── Tooltip de correlativas faltantes ────────────────────────────────────────

function describirFaltantes(materia) {
  const { ids, cantidadFaltante } = correlativasFaltantes(materia);

  const nombres = ids
    .map(id => materias.find(m => m.id === id))
    .filter(Boolean)
    .map(m => m.nombre);

  if (cantidadFaltante > 0) {
    nombres.push(`${cantidadFaltante} materia${cantidadFaltante === 1 ? '' : 's'} más aprobada${cantidadFaltante === 1 ? '' : 's'}`);
  }

  return nombres;
}

function construirTooltipFaltantes(materia) {
  const tooltip = document.createElement('div');
  tooltip.className = 'subject-card__tooltip';
  tooltip.setAttribute('role', 'tooltip');

  const titulo = document.createElement('p');
  titulo.className   = 'subject-card__tooltip-titulo';
  titulo.textContent  = 'Te falta aprobar:';
  tooltip.appendChild(titulo);

  const lista = document.createElement('ul');
  for (const nombre of describirFaltantes(materia)) {
    const item = document.createElement('li');
    item.textContent = nombre;
    lista.appendChild(item);
  }
  tooltip.appendChild(lista);

  return tooltip;
}

function cerrarTooltipsAbiertos(excepto = null) {
  document.querySelectorAll('.subject-card--tooltip-visible').forEach(card => {
    if (card !== excepto) card.classList.remove('subject-card--tooltip-visible');
  });
}

document.addEventListener('click', () => cerrarTooltipsAbiertos());

function construirCard(materia) {
  const estado = obtenerEstado(materia);
  const card   = document.createElement('article');

  card.className = `subject-card subject-card--${estado}`;
  card.setAttribute('role',     'button');
  card.setAttribute('tabindex', estado === 'locked' ? '-1' : '0');
  card.setAttribute('aria-label', materia.nombre);

  if (estado === 'approved')  card.setAttribute('aria-pressed', 'true');
  if (estado === 'available') card.setAttribute('aria-pressed', 'false');
  if (estado === 'locked')    card.setAttribute('aria-disabled', 'true');

  const idEl = document.createElement('span');
  idEl.className = 'subject-card__id';
  idEl.textContent = `#${materia.id}`;
  idEl.setAttribute('aria-hidden', 'true');
  card.appendChild(idEl);

  const nombreEl = document.createElement('span');
  nombreEl.textContent = materia.nombre;
  card.appendChild(nombreEl);

  if (SELECTIVAS.has(materia.id)) {
    card.appendChild(construirInputSelectiva(materia));
  }

  if (estado === 'locked') {
    card.appendChild(construirTooltipFaltantes(materia));

    card.addEventListener('click', e => {
      e.stopPropagation();
      cerrarTooltipsAbiertos(card);
      card.classList.toggle('subject-card--tooltip-visible');
    });
  }

  // Spotlight: posición del mouse dentro de la card
  card.addEventListener('mousemove', e => {
    const rect = card.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width  * 100).toFixed(1);
    const y = ((e.clientY - rect.top)  / rect.height * 100).toFixed(1);
    card.style.setProperty('--spotlight-x', `${x}%`);
    card.style.setProperty('--spotlight-y', `${y}%`);
  });

  if (estado !== 'locked') {
    const togglear = () => {
      if (estado === 'approved') {
        desaprobar(materia.id);
        mostrarToast(`${materia.nombre} → pendiente`, 'info');
      } else {
        aprobar(materia.id);
        agregarPulseRing(card);
        mostrarToast(`${materia.nombre} aprobada`, 'success');
      }
      render();
      actualizarProgreso();
    };

    card.addEventListener('click', togglear);
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        togglear();
      }
    });
  }

  return card;
}

// ── Grilla completa ───────────────────────────────────────────────────────────

export function render() {
  const grid = document.getElementById('main-grid');
  grid.innerHTML = '';

  for (const bloque of estructuraCurricular) {
    const col = document.createElement('div');
    col.className = 'year-column';

    const heading = document.createElement('h2');
    heading.className   = 'year-heading';
    heading.textContent = bloque.anio;
    col.appendChild(heading);

    for (const c of bloque.cuatrimestres) {
      const label = document.createElement('p');
      label.className   = 'semester-label';
      label.textContent = c === 0 ? 'CINEU' : `Cuatrimestre ${c}`;
      col.appendChild(label);

      for (const materia of materias.filter(m => m.cuatrimestre === c)) {
        col.appendChild(construirCard(materia));
      }
    }

    grid.appendChild(col);
  }
}
