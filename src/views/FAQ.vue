<template>
  <div class="container py-5">
    <div class="d-flex justify-content-between align-items-center mb-5">
      <div>
        <h2 class="display-6 fw-bold text-dark mb-1">Preguntas Frecuentes</h2>
        <p class="text-muted mb-0">Resolvemos tus dudas sobre nuestros servicios</p>
      </div>
      <button v-if="isAdmin" class="btn btn-primary shadow-sm" @click="openModal">
        <i class="bi bi-plus-lg me-2"></i>Nueva Pregunta
      </button>
    </div>

    <!-- Error Alert (Global) -->
    <div v-if="globalError" class="alert alert-danger alert-dismissible fade show mb-4" role="alert">
      <i class="bi bi-exclamation-octagon-fill me-2"></i>
      {{ globalError }}
      <button type="button" class="btn-close" @click="globalError = null"></button>
    </div>

    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status"></div>
    </div>

    <div v-else-if="faqs.length === 0" class="text-center py-5 bg-light rounded shadow-sm">
      <i class="bi bi-question-circle display-4 text-muted mb-3 d-block"></i>
      <p class="text-muted mb-0">No hay preguntas frecuentes registradas aún.</p>
    </div>

    <div v-else class="row justify-content-center">
      <div class="col-lg-10">
        <div class="accordion shadow-sm border-0 rounded overflow-hidden" id="faqAccordion">
          <div v-for="(faq, index) in faqs" :key="faq.id" class="accordion-item border-0 border-bottom">
            <h2 class="accordion-header" :id="'heading' + index">
              <button 
                class="accordion-button collapsed fw-bold text-dark py-4" 
                type="button" 
                data-bs-toggle="collapse" 
                :data-bs-target="'#collapse' + index" 
                aria-expanded="false" 
                :aria-controls="'collapse' + index"
              >
                <div class="d-flex align-items-center w-100 me-3">
                  <span class="me-auto">{{ faq.question }}</span>
                  
                  <div v-if="isAdmin" class="btn-group ms-3" @click.stop>
                    <button class="btn btn-sm btn-light text-primary" @click="editFaq(faq)" title="Editar">
                      <i class="bi bi-pencil-fill"></i>
                    </button>
                    <button class="btn btn-sm btn-light text-danger" @click="confirmDelete(faq)" title="Eliminar">
                      <i class="bi bi-trash-fill"></i>
                    </button>
                  </div>
                </div>
              </button>
            </h2>
            <div 
              :id="'collapse' + index" 
              class="accordion-collapse collapse" 
              :aria-labelledby="'heading' + index" 
              data-bs-parent="#faqAccordion"
            >
              <div class="accordion-body text-muted lh-lg pb-4">
                {{ faq.answer }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <div v-if="showModal" class="modal d-block" style="background: rgba(0,0,0,0.5); backdrop-filter: blur(2px);">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow-lg">
          <div class="modal-header bg-dark text-white" style="background-color: var(--primary-color) !important;">
            <h5 class="modal-title fw-bold text-white">
              <i class="bi" :class="isEditing ? 'bi-pencil-square' : 'bi-plus-circle-fill'"></i>
              {{ isEditing ? 'Editar Pregunta' : 'Nueva Pregunta' }}
            </h5>
            <button type="button" class="btn-close btn-close-white" @click="closeModal"></button>
          </div>
          <div class="modal-body p-4">
            
            <!-- Modal Error -->
            <div v-if="modalError" class="alert alert-danger d-flex align-items-center mb-3" role="alert">
              <i class="bi bi-exclamation-triangle-fill me-2"></i>
              <div>{{ modalError }}</div>
            </div>

            <form @submit.prevent="saveFaq" novalidate>
              <div class="mb-3">
                <label class="form-label text-muted small fw-bold text-uppercase">Pregunta</label>
                <input 
                  v-model="form.question" 
                  class="form-control" 
                  :class="{ 'is-invalid': errors.question }"
                  required 
                  placeholder="Ej. ¿Cómo puedo cancelar mi suscripción?"
                  @input="clearError('question')"
                >
                <div class="invalid-feedback">
                  {{ errors.question }}
                </div>
              </div>
              
              <div class="mb-3">
                <label class="form-label text-muted small fw-bold text-uppercase">Respuesta</label>
                <textarea 
                  v-model="form.answer" 
                  class="form-control" 
                  rows="4" 
                  :class="{ 'is-invalid': errors.answer }"
                  required 
                  placeholder="Escribe la respuesta detallada aquí..."
                  @input="clearError('answer')"
                ></textarea>
                <div class="invalid-feedback">
                  {{ errors.answer }}
                </div>
              </div>

              <div class="mb-3">
                <label class="form-label text-muted small fw-bold text-uppercase">Orden (Prioridad)</label>
                <input v-model.number="form.order" type="number" class="form-control" placeholder="0">
                <small class="text-muted">Menor número aparece primero.</small>
              </div>

              <div class="d-flex justify-content-end gap-2 mt-4">
                <button type="button" class="btn btn-light" @click="closeModal">Cancelar</button>
                <button type="submit" class="btn btn-primary px-4">
                  {{ isEditing ? 'Guardar Cambios' : 'Crear Pregunta' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, reactive } from 'vue'
import axios from 'axios'
import { useAuthStore } from '../stores/auth'

const auth = useAuthStore()
const faqs = ref([])
const loading = ref(true)
const showModal = ref(false)
const isEditing = ref(false)
const globalError = ref(null)
const modalError = ref(null)
const errors = reactive({})

const form = ref({
  id: null,
  question: '',
  answer: '',
  order: 0
})

const isAdmin = computed(() => auth.user?.role === 'admin')

onMounted(async () => {
  await fetchFaqs()
})

async function fetchFaqs() {
  loading.value = true
  globalError.value = null
  try {
    const { data } = await axios.get('/faqs')
    faqs.value = data
  } catch (e) {
    console.error(e)
    globalError.value = "Error al cargar las preguntas frecuentes."
  } finally {
    loading.value = false
  }
}

function openModal() {
  isEditing.value = false
  form.value = { id: null, question: '', answer: '', order: 0 }
  modalError.value = null
  Object.keys(errors).forEach(key => delete errors[key])
  showModal.value = true
}

function editFaq(faq) {
  isEditing.value = true
  form.value = { ...faq }
  modalError.value = null
  Object.keys(errors).forEach(key => delete errors[key])
  showModal.value = true
}

function closeModal() {
  showModal.value = false
}

function clearError(field) {
  if (errors[field]) delete errors[field]
  if (modalError.value) modalError.value = null
}

function validateForm() {
  let isValid = true
  Object.keys(errors).forEach(key => delete errors[key])

  if (!form.value.question || form.value.question.trim().length < 5) {
    errors.question = 'La pregunta debe tener al menos 5 caracteres.'
    isValid = false
  }

  if (!form.value.answer || form.value.answer.trim().length < 10) {
    errors.answer = 'La respuesta debe tener al menos 10 caracteres.'
    isValid = false
  }

  return isValid
}

async function saveFaq() {
  if (!validateForm()) return

  try {
    if (isEditing.value) {
      await axios.put(`/faqs/${form.value.id}`, form.value)
    } else {
      await axios.post('/faqs', form.value)
    }
    closeModal()
    await fetchFaqs()
  } catch (e) {
    modalError.value = e.response?.data?.error === 'missing_fields' 
      ? 'Por favor completa todos los campos requeridos.' 
      : 'Error al guardar. Inténtalo de nuevo.'
  }
}

async function confirmDelete(faq) {
  if (confirm('¿Eliminar esta pregunta frecuente?')) {
    try {
      await axios.delete(`/faqs/${faq.id}`)
      await fetchFaqs()
    } catch (e) {
      globalError.value = 'No se pudo eliminar la pregunta. Inténtalo más tarde.'
    }
  }
}
</script>

<style scoped>
.accordion-button:not(.collapsed) {
  color: var(--primary-color);
  background-color: rgba(197, 160, 89, 0.1); /* Gold tint */
  box-shadow: none;
}
.accordion-button:focus {
  box-shadow: none;
  border-color: rgba(0,0,0,0.1);
}
</style>
