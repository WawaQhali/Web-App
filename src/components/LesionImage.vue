<script setup>
// Foto donada, leída con el enlace temporal del backend (vence en 5 minutos).
import { ref, watch } from 'vue'

const props = defineProps({
  url: { type: String, required: true },
})
const emit = defineEmits(['reload'])

const failed = ref(false)
watch(
  () => props.url,
  () => {
    failed.value = false
  },
)
</script>

<template>
  <div class="lesion">
    <img v-if="!failed" :src="url" alt="Foto donada de la lesión" @error="failed = true" />
    <div v-else class="lesion__error">
      <p>No se pudo cargar la imagen. El enlace dura 5 minutos.</p>
      <button type="button" class="btn btn--secondary" @click="emit('reload')">Volver a cargar</button>
    </div>

    <span class="lesion__badge">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <rect x="5" y="11" width="14" height="10" rx="2" />
        <path d="M8 11V8a4 4 0 0 1 8 0v3" />
      </svg>
      Anónima · sin rostro
    </span>
  </div>
</template>

<style scoped>
.lesion {
  position: relative;
  height: 380px;
  background: var(--sand);
}
.lesion > img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.lesion__error {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 20px;
  text-align: center;
  color: var(--muted);
  font-size: 14px;
}
.lesion__badge {
  position: absolute;
  left: 14px;
  top: 14px;
  display: flex;
  align-items: center;
  gap: 6px;
  background: var(--paper);
  color: var(--brown);
  font-size: 12px;
  font-weight: 700;
  border-radius: 999px;
  padding: 7px 12px;
}
@media (max-width: 600px) {
  .lesion { height: 260px; }
}
</style>
