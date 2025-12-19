<template>
  <div v-if="show" class="modal d-block" tabindex="-1" style="background: rgba(0,0,0,0.5); backdrop-filter: blur(2px);">
    <div class="modal-dialog modal-dialog-centered" :class="sizeClass">
      <div class="modal-content border-0 shadow-lg">
        <div class="modal-header bg-dark text-white" style="background-color: var(--primary-color) !important;">
          <h5 class="modal-title fw-bold text-white">
            <slot name="title">{{ title }}</slot>
          </h5>
          <button type="button" class="btn-close btn-close-white" @click="$emit('close')"></button>
        </div>
        <div class="modal-body p-4">
          <slot></slot>
        </div>
        <div v-if="$slots.footer" class="modal-footer border-0 pt-0 pb-4 px-4">
          <slot name="footer"></slot>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: ''
  },
  size: {
    type: String,
    default: 'md', // sm, md, lg, xl
    validator: (value) => ['sm', 'md', 'lg', 'xl'].includes(value)
  }
})

defineEmits(['close'])

const sizeClass = computed(() => {
  return props.size === 'md' ? '' : `modal-${props.size}`
})
</script>
