<template>
  <div v-if="show" class="modal d-block" tabindex="-1" style="background: rgba(0,0,0,0.5); backdrop-filter: blur(4px);">
    <div class="modal-dialog modal-dialog-centered modal-sm">
      <div class="modal-content border-0 shadow-lg animate__animated animate__zoomIn animate__faster">
        <div class="modal-body text-center p-4">
          <!-- Icon -->
          <div class="mb-3">
            <div class="icon-circle">
              <i class="bi bi-exclamation-triangle-fill icon-triangle"></i>
            </div>
          </div>
          
          <!-- Text -->
          <h4 class="modal-title mb-2">{{ title }}</h4>
          <p class="modal-message mb-4">{{ message }}</p>
          
          <!-- Buttons -->
          <div class="d-grid gap-2">
            <button 
              type="button" 
              class="btn btn-custom-danger shadow-sm" 
              @click="$emit('confirm')"
              :disabled="loading"
            >
              <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
              {{ confirmText }}
            </button>
            <button 
              type="button" 
              class="btn btn-custom-cancel" 
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
.modal-content {
  border-radius: 1rem;
}

.icon-circle {
  background-color: #FEF2F2; /* Pale pink */
  width: 70px;
  height: 70px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  margin: 0 auto;
}

.icon-triangle {
  color: #DC2626; /* Red */
  font-size: 2rem;
}

.modal-title {
  font-family: 'Lato', sans-serif; /* Ensuring sans-serif as requested, overriding default serif headers if any */
  font-weight: 800;
  color: #111827;
  font-size: 1.25rem;
}

.modal-message {
  color: #6B7280;
  font-size: 0.95rem;
  line-height: 1.5;
}

.btn-custom-danger {
  background-color: #D84C4C; /* Specific red from design */
  border: none;
  color: white;
  border-radius: 0.5rem;
  font-weight: 700;
  padding: 0.75rem;
  font-size: 1rem;
  transition: background-color 0.2s;
}

.btn-custom-danger:hover {
  background-color: #B91C1C;
}

.btn-custom-danger:disabled {
  background-color: #FCA5A5;
  cursor: not-allowed;
}

.btn-custom-cancel {
  background-color: #F3F4F6;
  color: #374151;
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  padding: 0.75rem;
  font-size: 1rem;
  transition: background-color 0.2s;
}

.btn-custom-cancel:hover {
  background-color: #E5E7EB;
}

.animate__animated {
  animation-duration: 0.3s;
}
.animate__faster {
  animation-duration: 0.2s;
}
</style>
