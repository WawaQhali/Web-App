<script setup>
import { ref } from 'vue'
import LoginView from './views/LoginView.vue'
import ReviewView from './views/ReviewView.vue'
import { logout } from './services/auth.js'
import { setOnUnauthorized } from './services/api.js'

const doctor = ref(null)
const sessionExpired = ref(false)

function closeSession(expired = false) {
  logout()
  doctor.value = null
  sessionExpired.value = expired
}

// El JWT dura 1 hora: si vence, se vuelve al login.
setOnUnauthorized(() => closeSession(true))

function onLoggedIn(value) {
  sessionExpired.value = false
  doctor.value = value
}
</script>

<template>
  <LoginView v-if="!doctor" :session-expired="sessionExpired" @logged-in="onLoggedIn" />
  <ReviewView v-else :doctor="doctor" @logout="closeSession()" />
</template>
