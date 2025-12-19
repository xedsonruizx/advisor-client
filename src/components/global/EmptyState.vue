<template>
  <div class="text-center py-5 bg-light rounded shadow-sm">
    <i v-if="icon" :class="`bi ${icon} display-4 text-muted mb-3 d-block`"></i>
    <p class="text-muted mb-0">{{ message }}</p>
    <slot></slot>
  </div>
</template>

<script setup>
defineProps({
  icon: {
    type: String,
    default: ''
  },
  message: {
    type: String,
    default: 'No hay datos disponibles.'
  }
})
</script>
