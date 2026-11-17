// MOCK: donated cases come from db.json.
// Replace with the real dataset (e.g. Firestore + Storage) when it exists.
import db from '../data/db.json'

export const PREDICTIONS = {
  compatible: { label: 'Compatible con urticaria aguda', tone: 'high' },
  not_compatible: { label: 'No compatible', tone: 'neutral' },
  indeterminate: { label: 'Indeterminado', tone: 'warning' },
}

export const RISK_LABELS = {
  low: 'bajo',
  moderate: 'moderado',
}

export const DECISION_LABELS = {
  urticaria: 'sí es urticaria',
  not_urticaria: 'no es urticaria',
  unusable: 'la foto no sirve',
}

export function getPendingCases() {
  return db.cases.map((c) => ({
    ...c,
    symptoms: db.symptomQuestions.map((question, i) => ({
      question,
      answer: c.answers[i] ?? '—',
    })),
  }))
}

/** null when the case can't be compared (photo unusable or app was unsure). */
export function matchesApp(caseItem, decision) {
  if (decision === 'unusable' || caseItem.prediction === 'indeterminate') return null
  return (decision === 'urticaria') === (caseItem.prediction === 'compatible')
}
