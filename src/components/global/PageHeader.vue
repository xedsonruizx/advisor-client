<template>
  <div class="d-flex flex-column flex-md-row justify-content-between align-items-center mb-4 gap-3">
    <div>
      <h2 class="display-6 fw-bold text-dark mb-1">{{ title }}</h2>
      <p v-if="subtitle" class="text-muted mb-0">{{ subtitle }}</p>
    </div>
    <div class="d-flex gap-2 w-100 w-md-auto justify-content-md-end">
      <slot name="actions"></slot>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    required: true
  },
  subtitle: {
    type: String,
    default: ''
  }
})
</script>
