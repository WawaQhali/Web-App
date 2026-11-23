// Casos de revisión: imágenes ya verificadas que esperan la etiqueta del médico.
import { request } from './api.js'
import preguntas from '../data/preguntas.json'

export const PREDICTIONS = {
  compatible: { label: 'Compatible con urticaria aguda', tone: 'high' },
  no_compatible: { label: 'No compatible', tone: 'neutral' },
  indeterminado: { label: 'Indeterminado', tone: 'warning' },
}

// Decisión en pantalla -> etiqueta final del backend
export const LABELS = {
  urticaria: 'compatible',
  not_urticaria: 'no_compatible',
  unusable: 'no_evaluable',
}

export const DECISION_LABELS = {
  urticaria: 'sí es urticaria',
  not_urticaria: 'no es urticaria',
  unusable: 'la foto no sirve',
}

const PAGE_SIZE = 100

/** IDs de las imágenes pendientes, de la más antigua a la más nueva. */
export async function getPendingIds() {
  const page = await request(`/v1/revision/pendientes?tamano=${PAGE_SIZE}`)
  return page.items.map((item) => item.id)
}

function formatDate(iso) {
  const d = new Date(iso)
  const two = (n) => String(n).padStart(2, '0')
  return `${two(d.getDate())}/${two(d.getMonth() + 1)}/${d.getFullYear()} a las ${two(d.getHours())}:${two(d.getMinutes())}`
}

/** «Niña · 3 años». null si la donación es de una versión de la app que no los pedía. */
function childText(prelim) {
  const parts = []
  if (prelim.sexo) parts.push(prelim.sexo === 'femenino' ? 'Niña' : 'Niño')
  if (prelim.edad_anios) parts.push(`${prelim.edad_anios} ${prelim.edad_anios === 1 ? 'año' : 'años'}`)
  return parts.length ? parts.join(' · ') : null
}

function answerText(question, value) {
  if (question.respuesta === 'si_no') return value ? 'Sí' : 'No'
  return question.opciones.find((o) => o.id === value)?.texto ?? value
}

/** Detalle de una imagen, con un enlace de lectura que vence en 5 minutos. */
export async function getCase(id) {
  const data = await request(`/v1/revision/${id}`)
  const prelim = data.etiqueta_preliminar
  const respuestas = prelim.respuestas ?? {}
  const answered = (tipo) =>
    preguntas.preguntas.filter((q) => q.tipo === tipo && q.id in respuestas)

  return {
    id: data.id,
    shortId: data.id.slice(0, 8),
    imageUrl: data.url,
    receivedAt: formatDate(data.recibida_en),
    prediction: prelim.clase,
    confidence: prelim.confianza,
    modelVersion: prelim.version_modelo,
    child: childText(prelim),
    hasAlarm: answered('riesgo').some((q) => respuestas[q.id] === true),
    symptoms: answered('normal').map((q) => ({
      question: q.texto,
      answer: answerText(q, respuestas[q.id]),
    })),
  }
}

export async function labelCase(id, decision, comment = null) {
  await request(`/v1/revision/${id}/etiqueta`, {
    method: 'POST',
    body: { etiqueta: LABELS[decision], comentario: comment },
  })
}

export async function deleteCase(id) {
  await request(`/v1/revision/${id}/eliminar`, { method: 'POST' })
}

/** null cuando no se puede comparar (foto inútil o la app no estaba segura). */
export function matchesApp(caseItem, decision) {
  if (decision === 'unusable' || caseItem.prediction === 'indeterminado') return null
  return (decision === 'urticaria') === (caseItem.prediction === 'compatible')
}
