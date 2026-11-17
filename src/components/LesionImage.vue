<script setup>
// Shows the donated photo. While there are no real photos (image: null),
// it draws a placeholder lesion like the mockup.
import { computed, useId } from 'vue'

const props = defineProps({
  image: { type: String, default: null },
  prediction: { type: String, required: true },
  skinTone: { type: String, default: '#CF9C7E' },
})

const filterId = `blur-${useId()}`
const showDots = computed(() => props.prediction === 'not_compatible')
const blur = computed(() => (props.prediction === 'indeterminate' ? 5 : 2))

const dots = [
  [120, 90, 3], [132, 98, 2.2], [114, 106, 2.6], [140, 86, 2], [126, 114, 3.2],
  [146, 104, 2.4], [108, 94, 2], [136, 120, 2.2], [226, 126, 2.8], [238, 134, 2.2],
  [220, 140, 3], [244, 120, 2], [232, 148, 2.4], [250, 138, 2.6],
]
</script>

<template>
  <div class="lesion">
    <img v-if="image" :src="image" alt="Foto donada de la lesión" />
    <svg v-else viewBox="0 0 346 200" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <filter :id="filterId" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur :stdDeviation="blur" />
        </filter>
      </defs>
      <rect width="346" height="200" :fill="skinTone" />
      <g v-if="showDots" fill="#B0504A" opacity="0.8" :filter="`url(#${filterId})`">
        <circle v-for="([cx, cy, r], i) in dots" :key="i" :cx="cx" :cy="cy" :r="r" />
      </g>
      <g v-else :filter="`url(#${filterId})`">
        <ellipse cx="130" cy="104" rx="56" ry="40" fill="#D7806C" opacity="0.75" />
        <ellipse cx="130" cy="104" rx="25" ry="17" fill="#EBC3AA" />
        <ellipse cx="236" cy="66" rx="36" ry="28" fill="#D7806C" opacity="0.7" />
        <ellipse cx="236" cy="66" rx="14" ry="10" fill="#EBC3AA" />
        <ellipse cx="228" cy="150" rx="30" ry="22" fill="#D7806C" opacity="0.65" />
      </g>
    </svg>

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
}
.lesion > img,
.lesion > svg {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
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
