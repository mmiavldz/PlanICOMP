
const STORAGE_KEY = 'icomp_plan_v1';

let aprobadas = new Set();
let nombresSelectivas = {};

// ── Persistencia ────────────────────────────────────────────────────────────

export function cargarEstado() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const datos = raw ? JSON.parse(raw) : {};
    aprobadas = new Set(datos.aprobadas || []);
    nombresSelectivas = datos.selectivas || {};
  } catch {
    aprobadas = new Set();
    nombresSelectivas = {};
  }
}

function guardarEstado() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      aprobadas: [...aprobadas],
      selectivas: nombresSelectivas,
    }));
  } catch {
    
  }
}



export function aprobar(id) {
  aprobadas.add(id);
  guardarEstado();
}

export function desaprobar(id) {
  aprobadas.delete(id);
  guardarEstado();
}

export function estaAprobada(id) {
  return aprobadas.has(id);
}

export function cantAprobadas() {
  return aprobadas.size;
}



export function estaDisponible(materia) {
  const requisitosOk = !materia.requisitos.some(id => !aprobadas.has(id));
  const cantidadOk   = !materia.requisitoCantidad || aprobadas.size >= materia.requisitoCantidad;
  return requisitosOk && cantidadOk;
}

export function obtenerEstado(materia) {
  if (aprobadas.has(materia.id)) return 'approved';
  if (estaDisponible(materia))   return 'available';
  return 'locked';
}

// ── Correlativas faltantes ──────────────────────────────────────────────────

export function correlativasFaltantes(materia) {
  const ids = materia.requisitos.filter(id => !aprobadas.has(id));

  let cantidadFaltante = 0;
  if (materia.requisitoCantidad && aprobadas.size < materia.requisitoCantidad) {
    cantidadFaltante = materia.requisitoCantidad - aprobadas.size;
  }

  return { ids, cantidadFaltante };
}



export function getNombreSelectiva(id) {
  return nombresSelectivas[id] || '';
}

export function setNombreSelectiva(id, valor) {
  nombresSelectivas[id] = valor;
  guardarEstado();
}


export function resetearProgreso() {
  aprobadas = new Set();
  nombresSelectivas = {};
  guardarEstado();
}
