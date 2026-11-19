<script setup>
import { computed, onMounted, ref } from 'vue'
import AppLogo from '../components/AppLogo.vue'
import LesionImage from '../components/LesionImage.vue'
import {
  DECISION_LABELS,
  PREDICTIONS,
  deleteCase,
  getCase,
  getPendingIds,
  labelCase,
  matchesApp,
} from '../services/cases.js'

defineProps({
  doctor: { type: Object, required: true },
})
defineEmits(['logout'])

const queue = ref([]) // IDs pendientes de esta sesión
const index = ref(0)
const current = ref(null)
const labels = ref([]) // decisiones de esta sesión, para "Deshacer" y el JSON
const loading = ref(true)
const busy = ref(false)
const errorMessage = ref('')
const notice = ref('')
const copied = ref(false)

const finished = computed(() => !loading.value && index.value >= queue.value.length)
const pending = computed(() => Math.max(queue.value.length - index.value, 0))
const comparable = computed(() => labels.value.filter((l) => l.matchesApp !== null).length)
const matching = computed(() => labels.value.filter((l) => l.matchesApp === true).length)
const matchRate = computed(() =>
  comparable.value ? `${Math.round((100 * matching.value) / comparable.value)}%` : '—',
)
const lastLabel = computed(() => labels.value.at(-1) ?? null)

function percent(value) {
  return `${Math.round(value * 100)}%`
}

async function run(task) {
  busy.value = true
  errorMessage.value = ''
  try {
    await task()
  } catch (error) {
    errorMessage.value = error.message
  } finally {
    busy.value = false
  }
}

async function loadCurrent() {
  current.value = null
  if (index.value < queue.value.length) {
    current.value = await getCase(queue.value[index.value])
  }
}

async function loadQueue() {
  loading.value = true
  await run(async () => {
    queue.value = await getPendingIds()
    index.value = 0
    labels.value = []
    await loadCurrent()
  })
  loading.value = false
}

function decide(decision) {
  const item = current.value
  if (!item || busy.value) return
  run(async () => {
    await labelCase(item.id, decision)
    labels.value.push({
      caseId: item.id,
      shortId: item.shortId,
      decision,
      appPrediction: item.prediction,
      matchesApp: matchesApp(item, decision),
      reviewedAt: new Date().toISOString(),
    })
    notice.value = ''
    index.value++
    copied.value = false
    await loadCurrent()
  })
}

function undo() {
  const last = labels.value.at(-1)
  if (!last || busy.value) return
  run(async () => {
    // La etiqueta ya guardada se corrige al volver a decidir sobre el mismo caso.
    labels.value.pop()
    index.value = queue.value.indexOf(last.caseId)
    await loadCurrent()
  })
}

function removeImage() {
  const item = current.value
  if (!item || busy.value) return
  const ok = window.confirm(
    'La imagen se borrará para siempre (por ejemplo, si se ve un rostro). ¿Continuar?',
  )
  if (!ok) return
  run(async () => {
    await deleteCase(item.id)
    queue.value.splice(index.value, 1)
    notice.value = `Caso #${item.shortId} eliminado.`
    await loadCurrent()
  })
}

async function copyLabels() {
  await navigator.clipboard.writeText(JSON.stringify(labels.value, null, 2))
  copied.value = true
}

onMounted(loadQueue)
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
          {{ doctor.usuario }} · {{ doctor.rol === 'medico' ? 'Médico' : doctor.rol }}
        </span>
        <button type="button" class="btn btn--text" @click="$emit('logout')">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="M16 17l5-5-5-5M21 12H9" /></svg>
          Cerrar sesión
        </button>
      </div>
    </header>

    <main class="content">
      <div v-if="errorMessage" class="banner banner--error" role="alert">
        <span>{{ errorMessage }}</span>
        <button type="button" class="btn btn--text" @click="loadQueue">Reintentar</button>
      </div>

      <div v-if="current && lastLabel" class="banner" role="status">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2E6B3F" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M8 12.5l3 3 5-6" /></svg>
        <span>Guardado: caso #{{ lastLabel.shortId }}, {{ DECISION_LABELS[lastLabel.decision] }}.</span>
        <button type="button" class="btn btn--text" :disabled="busy" @click="undo">Deshacer</button>
      </div>
      <div v-else-if="notice" class="banner" role="status">
        <span>{{ notice }}</span>
      </div>

      <p v-if="loading" class="loading">Cargando casos…</p>

      <template v-else-if="current">
        <div class="case-title">
          <h1>Caso #{{ current.shortId }}</h1>
          <span>Recibido el {{ current.receivedAt }} · quedan {{ pending }}</span>
        </div>

        <span class="eyebrow section-label">IMAGEN</span>
        <div class="card image-card">
          <LesionImage :key="current.id" :url="current.imageUrl" @reload="run(loadCurrent)" />
          <div class="image-card__footer">
            <span class="image-card__said">La app dijo:</span>
            <span class="pill" :class="`pill--${PREDICTIONS[current.prediction]?.tone ?? 'neutral'}`">
              {{ PREDICTIONS[current.prediction]?.label ?? current.prediction }} · confianza
              {{ percent(current.confidence) }}
            </span>
            <span class="pill pill--sand">Modelo {{ current.modelVersion }}</span>
          </div>
        </div>

        <div class="symptoms-head">
          <span class="eyebrow">SÍNTOMAS</span>
          <span v-if="current.hasAlarm" class="pill pill--alarm">Con signos de alarma</span>
          <span v-else class="pill pill--green">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
            Sin signos de alarma
          </span>
        </div>
        <dl class="card symptoms">
          <div v-for="s in current.symptoms" :key="s.question" class="symptom">
            <dt>{{ s.question }}</dt>
            <dd>{{ s.answer }}</dd>
          </div>
          <p v-if="!current.symptoms.length" class="symptoms__empty">Sin respuestas del cuestionario.</p>
        </dl>

        <h2 class="question">¿Es urticaria aguda?</h2>
        <p class="question-hint">Tu respuesta se usa para seguir entrenando el modelo.</p>
        <div class="decisions">
          <button type="button" class="decision decision--no" :disabled="busy" @click="decide('not_urticaria')">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" /></svg>
            No es urticaria
          </button>
          <button type="button" class="decision decision--yes" :disabled="busy" @click="decide('urticaria')">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
            Sí es urticaria
          </button>
        </div>
        <div class="secondary-actions">
          <button type="button" class="btn btn--text" :disabled="busy" @click="decide('unusable')">
            La foto no sirve para decidir
          </button>
          <button type="button" class="btn btn--text danger" :disabled="busy" @click="removeImage">
            Eliminar imagen (se ve un rostro u otro dato)
          </button>
        </div>
      </template>

      <div v-else-if="finished" class="card done">
        <span class="done__icon">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#2E6B3F" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M8 12.5l3 3 5-6" /></svg>
        </span>
        <h1>No hay casos pendientes</h1>
        <p v-if="labels.length">
          Revisaste {{ labels.length }} casos. La app coincidió con tu criterio en
          {{ matching }} de {{ comparable }}.
        </p>
        <p v-else>Cuando lleguen nuevas fotos donadas, aparecerán aquí.</p>
        <div class="done__actions">
          <button v-if="labels.length" type="button" class="btn btn--primary" @click="copyLabels">
            {{ copied ? '¡Copiado!' : 'Copiar etiquetas (JSON)' }}
          </button>
          <button v-if="labels.length" type="button" class="btn btn--secondary" @click="undo">
            Volver al último caso
          </button>
          <button type="button" class="btn btn--secondary" @click="loadQueue">Buscar casos nuevos</button>
        </div>
        <p class="done__note">Las etiquetas ya se guardaron en el servidor para reentrenar el modelo.</p>
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
.banner {
  margin-bottom: 16px;
  border-radius: 14px;
  background: var(--sand);
  padding: 4px 4px 4px 14px;
  min-height: 44px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 500;
}
.banner span {
  flex-grow: 1;
}
.banner--error {
  background: var(--alarm-bg);
  color: var(--alarm-text);
}
.loading {
  text-align: center;
  color: var(--muted);
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
.pill--alarm {
  background: var(--alarm-bg);
  color: var(--alarm-text);
}
.symptoms {
  margin: 8px 0 0;
  padding: 20px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 16px 24px;
}
.symptoms__empty {
  margin: 0;
  color: var(--muted);
  font-size: 14px;
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
.decision:disabled,
.btn:disabled {
  opacity: 0.6;
  cursor: wait;
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
.secondary-actions {
  margin-top: 8px;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 4px 12px;
}
.secondary-actions .btn {
  font-size: 13.5px;
}
.danger {
  color: var(--alarm);
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
