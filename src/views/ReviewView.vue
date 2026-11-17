<script setup>
import { computed, ref } from 'vue'
import AppLogo from '../components/AppLogo.vue'
import LesionImage from '../components/LesionImage.vue'
import {
  DECISION_LABELS,
  PREDICTIONS,
  RISK_LABELS,
  getPendingCases,
  matchesApp,
} from '../services/cases.js'

defineProps({
  doctor: { type: Object, required: true },
})
defineEmits(['logout'])

const cases = getPendingCases()
const index = ref(0)
// Labels stay in memory. Real version: save them to the training dataset.
const labels = ref([])
const copied = ref(false)

const current = computed(() => cases[index.value] ?? null)
const pending = computed(() => cases.length - index.value)
const comparable = computed(() => labels.value.filter((l) => l.matchesApp !== null).length)
const matching = computed(() => labels.value.filter((l) => l.matchesApp === true).length)
const matchRate = computed(() =>
  comparable.value ? `${Math.round((100 * matching.value) / comparable.value)}%` : '—',
)
const lastLabel = computed(() => labels.value.at(-1) ?? null)

function percent(value) {
  return `${Math.round(value * 100)}%`
}

function decide(decision) {
  const item = current.value
  if (!item) return
  labels.value.push({
    caseId: item.id,
    decision,
    appPrediction: item.prediction,
    matchesApp: matchesApp(item, decision),
    reviewedAt: new Date().toISOString(),
  })
  index.value++
  copied.value = false
}

function undo() {
  if (!labels.value.length) return
  labels.value.pop()
  index.value--
}

async function copyLabels() {
  await navigator.clipboard.writeText(JSON.stringify(labels.value, null, 2))
  copied.value = true
}
</script>

<template>
  <div class="review">
    <header class="topbar">
      <div class="topbar__brand">
        <AppLogo />
        <span class="pill pill--sand">Revisión médica</span>
      </div>
      <div class="topbar__info">
        <span class="pill pill--amber">Pendientes: {{ pending }}</span>
        <span class="pill pill--olive">Revisados: {{ labels.length }}</span>
        <span class="pill pill--green">Coincide con la app: {{ matchRate }}</span>
        <span class="topbar__doctor">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6B5D50" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9.5" /><circle cx="12" cy="10" r="3.2" /><path d="M6.5 18.2a6.5 6.5 0 0 1 11 0" /></svg>
          {{ doctor.name }} · CMP {{ doctor.cmp }}
        </span>
        <button type="button" class="btn btn--text" @click="$emit('logout')">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="M16 17l5-5-5-5M21 12H9" /></svg>
          Cerrar sesión
        </button>
      </div>
    </header>

    <main class="content">
      <div v-if="current && lastLabel" class="undo-bar" role="status">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2E6B3F" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M8 12.5l3 3 5-6" /></svg>
        <span>Guardado: caso #{{ lastLabel.caseId }}, {{ DECISION_LABELS[lastLabel.decision] }}.</span>
        <button type="button" class="btn btn--text" @click="undo">Deshacer</button>
      </div>

      <template v-if="current">
        <div class="case-title">
          <h1>Caso #{{ current.id }}</h1>
          <span>Donado el {{ current.donatedAt }} · quedan {{ pending }}</span>
        </div>

        <span class="eyebrow section-label">IMAGEN</span>
        <div class="card image-card">
          <LesionImage
            :key="current.id"
            :image="current.image"
            :prediction="current.prediction"
            :skin-tone="current.skinTone"
          />
          <div class="image-card__footer">
            <span class="image-card__said">La app dijo:</span>
            <span class="pill" :class="`pill--${PREDICTIONS[current.prediction].tone}`">
              {{ PREDICTIONS[current.prediction].label }} · confianza {{ percent(current.confidence) }}
            </span>
            <span class="pill pill--sand">Riesgo {{ RISK_LABELS[current.risk] }}</span>
          </div>
        </div>

        <div class="symptoms-head">
          <span class="eyebrow">SÍNTOMAS</span>
          <span class="pill pill--green">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
            Sin signos de alarma
          </span>
        </div>
        <dl class="card symptoms">
          <div v-for="s in current.symptoms" :key="s.question" class="symptom">
            <dt>{{ s.question }}</dt>
            <dd>{{ s.answer }}</dd>
          </div>
        </dl>

        <h2 class="question">¿Es urticaria aguda?</h2>
        <p class="question-hint">Tu respuesta se usa para seguir entrenando el modelo.</p>
        <div class="decisions">
          <button type="button" class="decision decision--no" @click="decide('not_urticaria')">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" /></svg>
            No es urticaria
          </button>
          <button type="button" class="decision decision--yes" @click="decide('urticaria')">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
            Sí es urticaria
          </button>
        </div>
        <button type="button" class="btn btn--text unusable" @click="decide('unusable')">
          La foto no sirve para decidir
        </button>
      </template>

      <div v-else class="card done">
        <span class="done__icon">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#2E6B3F" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M8 12.5l3 3 5-6" /></svg>
        </span>
        <h1>No hay casos pendientes</h1>
        <p>
          Revisaste {{ labels.length }} casos. La app coincidió con tu criterio en
          {{ matching }} de {{ comparable }}.
        </p>
        <div class="done__actions">
          <button type="button" class="btn btn--primary" @click="copyLabels">
            {{ copied ? '¡Copiado!' : 'Copiar etiquetas (JSON)' }}
          </button>
          <button v-if="labels.length" type="button" class="btn btn--secondary" @click="undo">
            Volver al último caso
          </button>
        </div>
        <p class="done__note">
          En la versión real, las etiquetas se guardan en el conjunto de datos para reentrenar el modelo.
        </p>
      </div>
    </main>
  </div>
</template>

<style scoped>
.review {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
.topbar {
  background: var(--paper);
  border-bottom: 1px solid var(--line);
  padding: 14px 24px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
.topbar__brand,
.topbar__info {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}
.topbar__brand {
  gap: 10px;
}
.topbar__doctor {
  margin-left: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 600;
}
.content {
  width: 100%;
  max-width: 760px;
  margin: 0 auto;
  padding: 28px 20px 40px;
  display: flex;
  flex-direction: column;
}
.undo-bar {
  margin-bottom: 16px;
  border-radius: 14px;
  background: var(--sand);
  padding: 4px 4px 4px 14px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 500;
}
.undo-bar span {
  flex-grow: 1;
}
.case-title {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: space-between;
  gap: 4px;
}
.case-title h1 {
  margin: 0;
  font-size: 28px;
}
.case-title span {
  font-size: 13px;
  color: var(--muted);
}
.section-label {
  margin-top: 18px;
}
.image-card {
  margin-top: 8px;
  overflow: hidden;
}
.image-card__footer {
  padding: 16px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
}
.image-card__said {
  font-size: 13px;
  color: var(--muted);
}
.symptoms-head {
  margin-top: 22px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.symptoms {
  margin: 8px 0 0;
  padding: 20px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 16px 24px;
}
.symptom dt {
  font-size: 12.5px;
  color: var(--muted);
}
.symptom dd {
  margin: 2px 0 0;
  font-size: 15px;
  font-weight: 700;
}
.question {
  margin: 30px 0 0;
  font-size: 24px;
  text-align: center;
}
.question-hint {
  margin: 4px 0 0;
  font-size: 13px;
  color: var(--muted);
  text-align: center;
}
.decisions {
  margin-top: 16px;
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}
.decision {
  flex: 1 1 220px;
  height: 64px;
  border-radius: 16px;
  font-size: 16px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
.decision--no {
  border: 1.5px solid var(--alarm-line);
  background: var(--paper);
  color: var(--alarm);
}
.decision--no:hover {
  background: var(--alarm-bg);
}
.decision--yes {
  border: none;
  background: var(--caramel);
  color: var(--on-caramel);
}
.decision--yes:hover {
  background: var(--caramel-dark);
}
.unusable {
  margin-top: 8px;
  align-self: center;
  font-size: 13.5px;
}
.done {
  padding: 40px 28px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  text-align: center;
}
.done__icon {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: var(--green-bg);
  display: flex;
  align-items: center;
  justify-content: center;
}
.done h1 {
  margin: 8px 0 0;
  font-size: 26px;
}
.done p {
  margin: 0;
  font-size: 14px;
  color: var(--muted);
}
.done__actions {
  margin-top: 14px;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 12px;
}
.done .done__note {
  margin-top: 10px;
  font-size: 12px;
}
@media (max-width: 600px) {
  .topbar { padding: 12px 16px; }
  .topbar__doctor { margin-left: 0; }
  .content { padding: 20px 16px 32px; }
}
</style>
