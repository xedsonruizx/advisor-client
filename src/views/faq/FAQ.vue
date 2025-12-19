<template>
  <div class="container py-5">
    <PageHeader 
      title="Preguntas Frecuentes" 
      subtitle="Resolvemos tus dudas sobre nuestros servicios"
    >
      <template #actions>
        <button v-if="isAdmin" class="btn btn-primary shadow-sm" @click="openModal">
          <i class="bi bi-plus-lg me-2"></i>Nueva Pregunta
        </button>
      </template>
    </PageHeader>

    <div class="row justify-content-center mb-5">
      <div class="col-lg-8">
        <SearchInput 
          v-model="searchQuery" 
          placeholder="Buscar por pregunta o contenido..." 
        />
      </div>
    </div>

    <div v-if="globalError" class="alert alert-danger alert-dismissible fade show mb-4" role="alert">
      <i class="bi bi-exclamation-octagon-fill me-2"></i>
      {{ globalError }}
      <button type="button" class="btn-close" @click="globalError = null"></button>
    </div>

    <LoadingSpinner v-if="loading" />

    <EmptyState 
      v-else-if="filteredFaqs.length === 0" 
      icon="bi-question-circle"
      message="No se encontraron preguntas frecuentes." 
    />

    <div v-else class="row justify-content-center">
      <div class="col-lg-10">
        <FaqAccordion 
          :faqs="filteredFaqs" 
          :is-admin="isAdmin" 
          @edit="editFaq" 
          @delete="confirmDelete" 
        />
      </div>
    </div>

    <BaseModal 
      :show="showModal" 
      :title="isEditing ? 'Editar Pregunta' : 'Nueva Pregunta'"
      @close="closeModal"
    >
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
    </BaseModal>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, reactive } from 'vue'
import axios from 'axios'
import { useAuthStore } from '../../stores/auth'
import PageHeader from '../../components/global/PageHeader.vue'
import SearchInput from '../../components/global/SearchInput.vue'
import LoadingSpinner from '../../components/global/LoadingSpinner.vue'
import EmptyState from '../../components/global/EmptyState.vue'
import BaseModal from '../../components/global/BaseModal.vue'
import FaqAccordion from '../../components/faq/FaqAccordion.vue'

const auth = useAuthStore()
const faqs = ref([])
const loading = ref(true)
const searchQuery = ref('')
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

const filteredFaqs = computed(() => {
  if (!searchQuery.value) return faqs.value
  const query = searchQuery.value.toLowerCase()
  return faqs.value.filter(faq => 
    faq.question.toLowerCase().includes(query) || 
    faq.answer.toLowerCase().includes(query)
  )
})

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
