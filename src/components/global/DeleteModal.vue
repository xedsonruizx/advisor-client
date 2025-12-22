<template>
  <div v-if="show" class="modal d-block" tabindex="-1" style="background: rgba(0,0,0,0.5); backdrop-filter: blur(2px);">
    <div class="modal-dialog modal-dialog-centered modal-sm">
      <div class="modal-content border-0 shadow-lg animate__animated animate__zoomIn animate__faster">
        <div class="modal-body text-center p-4">
          <div class="mb-3">
            <div class="d-inline-flex align-items-center justify-content-center bg-danger bg-opacity-10 rounded-circle" style="width: 80px; height: 80px;">
              <i class="bi bi-exclamation-triangle-fill text-danger display-4"></i>
            </div>
          </div>
          <h4 class="fw-bold text-dark mb-2">{{ title }}</h4>
          <p class="text-muted mb-4">{{ message }}</p>
          
          <div class="d-grid gap-2">
            <button 
              type="button" 
              class="btn btn-danger btn-lg shadow-sm" 
              @click="$emit('confirm')"
              :disabled="loading"
            >
              <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
              {{ confirmText }}
            </button>
            <button 
              type="button" 
              class="btn btn-light" 
              @click="$emit('close')"
              :disabled="loading"
            >
              {{ cancelText }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  show: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: '¿Estás seguro?'
  },
  message: {
    type: String,
    default: 'Esta acción no se puede deshacer.'
  },
  confirmText: {
    type: String,
    default: 'Sí, Eliminar'
  },
  cancelText: {
    type: String,
    default: 'Cancelar'
  },
  loading: {
    type: Boolean,
    default: false
  }
})

defineEmits(['close', 'confirm'])
</script>

<style scoped>
/* Optional animations if not globally available */
.animate__animated {
  animation-duration: 0.3s;
}
.animate__faster {
  animation-duration: 0.2s;
}
</style>