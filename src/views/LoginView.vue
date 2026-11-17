<script setup>
import { ref } from 'vue'
import AppLogo from '../components/AppLogo.vue'
import { login } from '../services/auth.js'

const emit = defineEmits(['logged-in'])

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const hasError = ref(false)

function submit() {
  const doctor = login(email.value, password.value)
  if (!doctor) {
    hasError.value = true
    return
  }
  hasError.value = false
  emit('logged-in', doctor)
}
</script>

<template>
  <div class="login">
    <section class="login__intro">
      <AppLogo />
      <div class="login__pitch">
        <svg width="120" height="150" viewBox="0 0 120 150" aria-hidden="true">
          <ellipse cx="60" cy="144" rx="40" ry="5" fill="#DCC6A8" />
          <path d="M60 12c22 0 36 16 36 38v56c0 20-16 32-36 32S24 126 24 106V50c0-22 14-38 36-38z" fill="#8A8558" />
          <circle cx="60" cy="50" r="21" fill="#EBC9A4" />
          <path d="M51 48q3 3 6 0M63 48q3 3 6 0" stroke="#5A3E2B" stroke-width="1.6" fill="none" stroke-linecap="round" />
          <path d="M56 58q4 3 8 0" stroke="#5A3E2B" stroke-width="1.6" fill="none" stroke-linecap="round" />
          <circle cx="48.5" cy="55" r="3.2" fill="#E3A58A" opacity="0.6" />
          <circle cx="71.5" cy="55" r="3.2" fill="#E3A58A" opacity="0.6" />
          <path d="M27 80c22-7 46 4 66 22" stroke="#6F6B45" stroke-width="2" fill="none" />
          <path d="M30 100l6-6 6 6 6-6 6 6 6-6 6 6 6-6 6 6 6-6 6 6" stroke="#F3E6CF" stroke-width="2" fill="none" stroke-linejoin="round" />
          <path d="M30 116l6-6 6 6 6-6 6 6 6-6 6 6 6-6 6 6 6-6 6 6" stroke="#C9B48E" stroke-width="2" fill="none" stroke-linejoin="round" />
        </svg>
        <h2>Revisión médica</h2>
        <p>Revisa las fotos que donan las familias y ayuda a que Wawa Qhali oriente mejor.</p>
        <ul class="login__features">
          <li>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8C5A3A" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></svg>
            Fotos anónimas, cifradas y sin rostro
          </li>
          <li>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8C5A3A" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 2.8l7.5 2.8v5.8c0 4.7-3.2 8.1-7.5 9.8-4.3-1.7-7.5-5.1-7.5-9.8V5.6z" /><path d="M8.5 12l2.5 2.5 4.5-5" /></svg>
            Solo profesionales de salud autorizados
          </li>
          <li>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8C5A3A" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 19V5M4 19h16" /><path d="M7 15l4-4 3 3 5-6" /></svg>
            Tus decisiones ayudan a entrenar el modelo
          </li>
        </ul>
      </div>
      <span></span>
    </section>

    <section class="login__form-side">
      <form class="login__form" @submit.prevent="submit">
        <div class="login__heading">
          <h1>Ingresa a tu cuenta</h1>
          <span>Usa las credenciales que te dio el equipo de Wawa Qhali.</span>
        </div>

        <div v-if="hasError" role="alert" class="login__error">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#A33A2A" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M12 7.5v5.5M12 16.5h.01" /></svg>
          <span>Correo o contraseña incorrectos. Revisa tus datos e inténtalo de nuevo.</span>
        </div>

        <div class="field">
          <label for="email">Correo</label>
          <input
            id="email"
            v-model="email"
            type="email"
            autocomplete="username"
            placeholder="nombre@correo.com"
            class="field__box"
            :class="{ 'field__box--error': hasError }"
            required
          />
        </div>

        <div class="field">
          <label for="password">Contraseña</label>
          <div class="field__box field__box--with-button" :class="{ 'field__box--error': hasError }">
            <input
              id="password"
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              autocomplete="current-password"
              required
            />
            <button
              type="button"
              class="field__toggle"
              :aria-label="showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
              @click="showPassword = !showPassword"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6B5D50" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" /></svg>
            </button>
          </div>
        </div>

        <button type="submit" class="btn btn--primary login__submit">Ingresar</button>
        <span class="login__help">¿Olvidaste tu contraseña? Escribe al equipo de Wawa Qhali para restablecerla.</span>
      </form>
    </section>
  </div>
</template>

<style scoped>
.login {
  min-height: 100vh;
  display: flex;
  flex-wrap: wrap;
}
.login__intro {
  flex: 5 1 360px;
  background: var(--sand);
  padding: 48px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 32px;
}
.login__pitch {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.login__pitch h2 {
  margin: 12px 0 0;
  font-size: 38px;
}
.login__pitch p {
  margin: 0;
  max-width: 420px;
  font-size: 15px;
  line-height: 1.5;
  color: var(--ink-soft);
}
.login__features {
  margin: 8px 0 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.login__features li {
  display: flex;
  gap: 12px;
  align-items: center;
  font-size: 14px;
  font-weight: 500;
}
.login__form-side {
  flex: 6 1 360px;
  padding: 48px 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.login__form {
  width: 100%;
  max-width: 420px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.login__heading {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
}
.login__heading h1 {
  margin: 0;
  font-size: 30px;
}
.login__heading span {
  font-size: 14px;
  color: var(--muted);
}
.login__error {
  border-radius: 14px;
  background: var(--alarm-bg);
  border: 1px solid var(--alarm-line);
  padding: 14px;
  display: flex;
  gap: 10px;
  align-items: flex-start;
  font-size: 13px;
  line-height: 1.45;
  color: var(--alarm-text);
}
.login__error svg {
  flex-shrink: 0;
}
.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.field label {
  font-size: 12.5px;
  font-weight: 600;
  color: var(--ink-soft);
}
.field__box {
  height: 52px;
  border: 1.5px solid var(--line);
  border-radius: 14px;
  background: var(--paper);
  padding: 0 16px;
  font-family: inherit;
  font-size: 14px;
  color: var(--ink);
}
.field__box--error {
  border-color: var(--alarm);
}
.field__box--with-button {
  display: flex;
  align-items: center;
  padding: 0 6px 0 16px;
}
.field__box--with-button input {
  flex-grow: 1;
  min-width: 0;
  border: none;
  background: none;
  font: inherit;
  color: inherit;
  outline: none;
}
.field__box--with-button:focus-within {
  outline: 3px solid var(--toast);
  outline-offset: 2px;
}
.field__toggle {
  width: 44px;
  height: 44px;
  border: none;
  border-radius: 10px;
  background: none;
  display: flex;
  align-items: center;
  justify-content: center;
}
.login__submit {
  margin-top: 8px;
  height: 54px;
  border-radius: 16px;
  font-size: 15px;
}
.login__help {
  font-size: 12.5px;
  text-align: center;
  color: var(--muted);
}
@media (max-width: 600px) {
  .login__intro { padding: 28px 16px; }
  .login__pitch h2 { font-size: 30px; }
  .login__form-side { padding: 32px 16px; }
}
</style>
