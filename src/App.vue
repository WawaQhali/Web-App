<script setup>
import { ref } from 'vue'
import LoginView from './views/LoginView.vue'
import ReviewView from './views/ReviewView.vue'

const doctor = ref(null)
</script>

<template>
  <LoginView v-if="!doctor" @logged-in="doctor = $event" />
  <ReviewView v-else :doctor="doctor" @logout="doctor = null" />
</template>
