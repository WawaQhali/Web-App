<template>
  <div class="logo">
    <svg width="40" height="28" viewBox="0 0 40 28" aria-hidden="true">
      <path d="M1 26 L13 8 L19 16 L26 5 L39 26 Z" fill="#DCC6A8" />
      <path
        d="M4 19h8l2.5-5 3.5 9 3-6h14"
        stroke="#8C5A3A"
        stroke-width="2"
        fill="none"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
    <span class="logo__name">Wawa Qhali</span>
  </div>
</template>

<style scoped>
.logo {
  display: flex;
  align-items: center;
  gap: 10px;
}
.logo__name {
  font-family: var(--font-title);
  font-size: 22px;
  font-weight: 700;
}
</style>
