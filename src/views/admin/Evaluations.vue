<template>
  <div class="container py-5">
    <PageHeader 
      title="Gestión de Evaluaciones" 
      subtitle="Administra las preguntas y opciones de la prueba"
    >
      <template #actions>
        <button class="btn btn-primary shadow-sm text-nowrap" @click="openCreateModal">
          <i class="bi bi-plus-lg me-2"></i>Nueva Pregunta
        </button>
      </template>
    </PageHeader>

    <LoadingSpinner v-if="loading" />

    <div v-else class="card border-0 shadow-lg overflow-hidden">
      <div class="table-responsive">
        <table class="table table-hover mb-0 align-middle">
          <thead class="bg-light text-uppercase small fw-bold text-muted">
            <tr>
              <th class="ps-4 py-3">Orden</th>
              <th class="py-3">Pregunta</th>
              <th class="py-3">Tipo</th>
              <th class="py-3 text-center">Opciones</th>
              <th class="py-3 text-center">Requerida</th>
              <th class="pe-4 py-3 text-end">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="q in questions" :key="q.id">
              <td class="ps-4 fw-bold text-muted">{{ q.order }}</td>
              <td>
                <div class="fw-bold text-dark text-truncate" style="max-width: 300px;">{{ q.text }}</div>
                <div v-if="q.parentQuestion" class="small text-muted">
                  <i class="bi bi-arrow-return-right me-1"></i>
                  Depende de: {{ getQuestionText(q.parentQuestionId) }}
                </div>
              </td>
              <td>
                <span class="badge bg-light text-dark border">{{ getTypeLabel(q.type) }}</span>
              </td>
              <td class="text-center">
                <span class="badge rounded-pill bg-secondary">{{ q.options?.length || 0 }}</span>
              </td>
              <td class="text-center">
                <i v-if="q.required" class="bi bi-check-circle-fill text-success"></i>
                <i v-else class="bi bi-dash-circle text-muted"></i>
              </td>
              <td class="pe-4 text-end">
                <div class="btn-group shadow-sm rounded">
                  <button class="btn btn-sm btn-light" @click="editQuestion(q)" title="Editar">
                    <i class="bi bi-pencil-fill text-primary"></i>
                  </button>
                  <button class="btn btn-sm btn-light" @click="openDeleteModal(q)" title="Eliminar">
                    <i class="bi bi-trash-fill text-danger"></i>
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="questions.length === 0">
              <td colspan="6" class="text-center py-5 text-muted">
                No hay preguntas configuradas.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <BaseModal 
      :show="showModal" 
      :title="isEditing ? 'Editar Pregunta' : 'Nueva Pregunta'" 
      @close="closeModal"
      size="lg"
    >
      <form @submit.prevent="saveQuestion">
        <div class="row">
          <div class="col-md-8 mb-3">
            <label class="form-label small fw-bold text-uppercase text-muted">Texto de la Pregunta</label>
            <input v-model="form.text" class="form-control" required placeholder="Ej. ¿Cuántos empleados tiene la empresa?">
          </div>
          <div class="col-md-4 mb-3">
            <label class="form-label small fw-bold text-uppercase text-muted">Orden</label>
            <input v-model.number="form.order" type="number" class="form-control" required>
          </div>
        </div>

        <div class="row">
          <div class="col-md-6 mb-3">
            <label class="form-label small fw-bold text-uppercase text-muted">Tipo de Respuesta</label>
            <select :disabled="isEditing" v-model="form.type" class="form-select" required>
              <option value="text">Texto Libre</option>
              <option value="number">Numérico</option>
              <option value="select">Selección Única (Lista)</option>
              <option value="radio">Selección Única (Radio)</option>
              <option value="checkbox">Selección Múltiple</option>
              <option value="date">Fecha</option>
            </select>
          </div>
          <div class="col-md-6 mb-3 d-flex align-items-end">
            <div class="form-check mb-2">
              <input v-model="form.required" class="form-check-input" type="checkbox" id="requiredCheck">
              <label class="form-check-label" for="requiredCheck">Respuesta Obligatoria</label>
            </div>
          </div>
        </div>

        <!-- Dependency Section -->
        <div class="mb-4 p-3 bg-light rounded border">
          <label class="form-label small fw-bold text-uppercase text-muted mb-2">Lógica Condicional (Opcional)</label>
          <div class="row">
            <div class="col-md-4">
              <label class="form-label small">Depende de la pregunta:</label>
              <select v-model="form.parentQuestionId" class="form-select form-select-sm" @change="resetCondition">
                <option :value="null">Sin dependencia (Mostrar siempre)</option>
                <option v-for="q in availableParents" :key="q.id" :value="q.id">
                  {{ q.order }}. {{ q.text }}
                </option>
              </select>
            </div>
            
            <div class="col-md-4" v-if="form.parentQuestionId">
              <label class="form-label small">Condición:</label>
              <select v-model="form.conditionOperator" class="form-select form-select-sm">
                <option :value="null">Seleccionar condición...</option>
                <option v-for="op in availableOperators" :key="op.value" :value="op.value">
                  {{ op.label }}
                </option>
              </select>
            </div>

            <div class="col-md-4" v-if="form.parentQuestionId && form.conditionOperator && requiresValue(form.conditionOperator)">
              <label class="form-label small">Valor:</label>
              
              <!-- If parent is select/radio, show options dropdown -->
              <select v-if="['select', 'radio'].includes(parentQuestionType) && ['equals', 'not_equals'].includes(form.conditionOperator)" 
                      v-model="form.conditionValue" class="form-select form-select-sm">
                <option v-for="opt in parentQuestionOptions" :key="opt.id" :value="opt.id">
                  {{ opt.text }}
                </option>
              </select>

               <!-- If parent is checkbox, show options dropdown (checking if id is in array logic will be handled elsewhere, here we pick one option to check existence of) -->
               <!-- Wait, for checkbox 'contains', we check if the answer contains THIS option ID -->
               <select v-else-if="['checkbox'].includes(parentQuestionType) && ['contains', 'not_contains'].includes(form.conditionOperator)" 
                      v-model="form.conditionValue" class="form-select form-select-sm">
                <option v-for="opt in parentQuestionOptions" :key="opt.id" :value="opt.id">
                  {{ opt.text }}
                </option>
              </select>

              <!-- Otherwise show text/number input -->
              <input v-else v-model="form.conditionValue" class="form-control form-control-sm" :type="parentQuestionType === 'number' ? 'number' : 'text'">
            </div>
          </div>
        </div>

        <!-- Options Section (for select/radio/checkbox OR numeric rules) -->
        <div v-if="['select', 'radio', 'checkbox', 'number'].includes(form.type)" class="mb-4">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <label class="form-label small fw-bold text-uppercase text-muted mb-0">
              {{ form.type === 'number' ? 'Reglas de Puntuación / Multas' : 'Opciones de Respuesta' }}
            </label>
            <button type="button" class="btn btn-sm btn-outline-primary" @click="addOption">
              <i class="bi bi-plus-circle me-1"></i>Agregar {{ form.type === 'number' ? 'Regla' : 'Opción' }}
            </button>
          </div>

          <div v-for="(opt, idx) in form.options" :key="idx" class="card mb-2 border-light bg-light">
            <div class="card-body p-2">
              <div class="row g-2 align-items-center">
                <!-- Text/Label -->
                <div class="col-md-3">
                  <input v-model="opt.text" class="form-control form-control-sm" :placeholder="form.type === 'number' ? 'Nombre de regla' : 'Texto de opción'" required>
                </div>
                
                <!-- Numeric Rules Condition Fields -->
                <div class="col-md-4" v-if="form.type === 'number'">
                   <div class="input-group input-group-sm">
                      <select v-model="opt.conditionOperator" class="form-select" required>
                        <option :value="null">Operador...</option>
                        <!-- Fallback to 'number' operators if computed OPERATORS.number is not available in scope directly -->
                        <option v-for="op in OPERATORS.number" :key="op.value" :value="op.value">{{ op.label }}</option>
                      </select>
                      <input v-if="requiresValue(opt.conditionOperator)" v-model="opt.value" type="number" class="form-control" placeholder="Valor" required>
                   </div>
                </div>

                <!-- Points -->
                <div class="col-md-2" v-if="form.type !== 'number'">
                  <input v-model.number="opt.score" type="number" class="form-control form-control-sm" placeholder="Puntos">
                </div>
                
                <!-- Penalty -->
                <div :class="form.type === 'number' ? 'col-md-4' : 'col-md-2'">
                  <textarea v-model="opt.penalty" class="form-control form-control-sm" placeholder="Multa (HTML)" rows="1"></textarea>
                </div>
                
                <div class="col-md-1 text-end">
                  <button type="button" class="btn btn-sm btn-link text-danger p-0" @click="removeOption(idx)">
                    <i class="bi bi-x-lg"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="d-flex justify-content-end gap-2 mt-4">
          <button type="button" class="btn btn-light" @click="closeModal">Cancelar</button>
          <button type="submit" class="btn btn-primary px-4">
            {{ isEditing ? 'Guardar Cambios' : 'Crear Pregunta' }}
          </button>
        </div>
      </form>
    </BaseModal>

    <!-- Delete Modal -->
    <DeleteModal
      :show="showDeleteModal"
      :title="'Eliminar Pregunta'"
      :message="deleteMessage"
      :loading="deleting"
      @close="showDeleteModal = false"
      @confirm="deleteQuestion"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import axios from 'axios'
import PageHeader from '../../components/global/PageHeader.vue'
import LoadingSpinner from '../../components/global/LoadingSpinner.vue'
import BaseModal from '../../components/global/BaseModal.vue'
import DeleteModal from '../../components/global/DeleteModal.vue'

const questions = ref([])
const loading = ref(true)
const showModal = ref(false)
const isEditing = ref(false)

// Delete Modal State
const showDeleteModal = ref(false)
const deleting = ref(false)
const questionToDelete = ref(null)

const deleteMessage = computed(() => {
  if (!questionToDelete.value) return ''
  return `¿Estás seguro de que deseas eliminar la pregunta "${questionToDelete.value.text}"? Esta acción eliminará también todas las respuestas asociadas.`
})

const form = ref({
  id: null,
  text: '',
  type: 'text',
  order: 0,
  required: true,
  parentQuestionId: null,
  parentOptionId: null,
  conditionOperator: null,
  conditionValue: null,
  options: []
})

const OPERATORS = {
  text: [
    { value: 'equals', label: 'Igual a' },
    { value: 'not_equals', label: 'Distinto de' },
    { value: 'contains', label: 'Contiene' },
    { value: 'not_contains', label: 'No contiene' },
    { value: 'is_empty', label: 'Está vacío' },
    { value: 'is_not_empty', label: 'No está vacío' },
  ],
  number: [
    { value: 'equals', label: 'Igual a' },
    { value: 'not_equals', label: 'Distinto de' },
    { value: 'greater_than', label: 'Mayor que' },
    { value: 'less_than', label: 'Menor que' },
    { value: 'greater_than_or_equal', label: 'Mayor o igual a' },
    { value: 'less_than_or_equal', label: 'Menor o igual a' },
    { value: 'is_empty', label: 'Está vacío' },
    { value: 'is_not_empty', label: 'No está vacío' },
  ],
  select: [
    { value: 'equals', label: 'Igual a' },
    { value: 'not_equals', label: 'Distinto de' },
    { value: 'is_empty', label: 'Está vacío' },
    { value: 'is_not_empty', label: 'No está vacío' },
  ],
  radio: [
    { value: 'equals', label: 'Igual a' },
    { value: 'not_equals', label: 'Distinto de' },
  ],
  checkbox: [
    { value: 'contains', label: 'Contiene' },
    { value: 'not_contains', label: 'No contiene' },
    { value: 'is_empty', label: 'Ninguno seleccionado' },
    { value: 'is_not_empty', label: 'Al menos uno seleccionado' },
    { value: 'count_equals', label: 'Cantidad seleccionada igual a' },
    { value: 'count_greater_than', label: 'Cantidad seleccionada mayor que' },
    { value: 'count_less_than', label: 'Cantidad seleccionada menor que' },
  ],
  date: [
    { value: 'equals', label: 'Igual a' },
    { value: 'greater_than', label: 'Posterior a' },
    { value: 'less_than', label: 'Anterior a' },
    { value: 'is_empty', label: 'Está vacío' },
    { value: 'is_not_empty', label: 'No está vacío' },
  ]
}

onMounted(() => {
  fetchQuestions()
})

const availableParents = computed(() => {
  // Can only depend on questions that exist and are not itself
  return questions.value.filter(q => q.id !== form.value.id)
})

const parentQuestion = computed(() => {
  if (!form.value.parentQuestionId) return null
  return questions.value.find(q => q.id === form.value.parentQuestionId)
})

const parentQuestionOptions = computed(() => {
  return parentQuestion.value?.options || []
})

const parentQuestionType = computed(() => {
  return parentQuestion.value?.type || 'text'
})

const availableOperators = computed(() => {
  if (!parentQuestionType.value) return []
  return OPERATORS[parentQuestionType.value] || OPERATORS.text
})

function requiresValue(operator) {
  return !['is_empty', 'is_not_empty', 'is_email', 'is_rut', 'only_letters', 'only_numbers'].includes(operator)
}

function resetCondition() {
  form.value.conditionOperator = null
  form.value.conditionValue = null
  form.value.parentOptionId = null // clear legacy field
}

async function fetchQuestions() {
  loading.value = true
  try {
    const { data } = await axios.get('/evaluations/questions')
    questions.value = data
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

function getQuestionText(id) {
  const q = questions.value.find(q => q.id === id)
  return q ? `${q.order}. ${q.text}` : 'Pregunta desconocida'
}

function getTypeLabel(type) {
  const types = {
    text: 'Texto',
    number: 'Número',
    select: 'Lista',
    radio: 'Opción Única',
    checkbox: 'Múltiple',
    date: 'Fecha'
  }
  return types[type] || type
}

function openCreateModal() {
  isEditing.value = false
  const nextOrder = questions.value.length > 0 
    ? Math.max(...questions.value.map(q => q.order)) + 1 
    : 1
    
  form.value = {
    id: null,
    text: '',
    type: 'text',
    order: nextOrder,
    required: true,
    parentQuestionId: null,
    parentOptionId: null,
    conditionOperator: null,
    conditionValue: null,
    options: []
  }
  showModal.value = true
}

function editQuestion(q) {
  isEditing.value = true
  // Deep copy to avoid modifying original while editing
  form.value = JSON.parse(JSON.stringify(q))
  // Ensure options array exists
  if (!form.value.options) form.value.options = []
  
  showModal.value = true
}

function addOption() {
  form.value.options.push({
    text: '',
    score: 0,
    penalty: '',
    order: form.value.options.length,
    conditionOperator: null,
    value: null
  })
}

function removeOption(index) {
  form.value.options.splice(index, 1)
}

function closeModal() {
  showModal.value = false
}

async function saveQuestion() {
  try {
    const payload = { ...form.value }
    // Clean up options if type doesn't support them
    if (!['select', 'radio', 'checkbox', 'number'].includes(payload.type)) {
      delete payload.options
    }

    // Explicitly nullify empty strings for nullable fields to satisfy Zod
    if (!payload.parentQuestionId) payload.parentQuestionId = null
    if (!payload.conditionOperator) payload.conditionOperator = null
    if (!payload.conditionValue) payload.conditionValue = null
    if (!payload.parentOptionId) payload.parentOptionId = null

    // Sync legacy parentOptionId if condition is equals
    if (payload.conditionOperator === 'equals' && ['select', 'radio'].includes(parentQuestionType.value)) {
        payload.parentOptionId = payload.conditionValue
    }

    // Sanitize options
    if (payload.options && Array.isArray(payload.options)) {
      payload.options.forEach(opt => {
        if (!opt.value) opt.value = null
        if (opt.value !== null && opt.value !== undefined) opt.value = String(opt.value) // Ensure it's a string
        if (!opt.penalty) opt.penalty = null
        if (!opt.conditionOperator) opt.conditionOperator = null
      })
    }

    if (isEditing.value) {
      await axios.put(`/evaluations/questions/${payload.id}`, payload)
    } else {
      await axios.post('/evaluations/questions', payload)
    }
    
    closeModal()
    await fetchQuestions()
  } catch (e) {
    let errorMessage = e.message
    if (e.response?.data?.error) {
      if (typeof e.response.data.error === 'object') {
        // Pretty print Zod errors or other object errors
        errorMessage = JSON.stringify(e.response.data.error, null, 2)
      } else {
        errorMessage = e.response.data.error
      }
    }
    alert('Error al guardar: ' + errorMessage)
  }
}

function openDeleteModal(q) {
  questionToDelete.value = q
  showDeleteModal.value = true
}

async function deleteQuestion() {
  if (!questionToDelete.value) return
  
  deleting.value = true
  try {
    await axios.delete(`/evaluations/questions/${questionToDelete.value.id}`)
    await fetchQuestions()
    showDeleteModal.value = false
    questionToDelete.value = null
  } catch (e) {
    alert('Error: ' + e.message)
  } finally {
    deleting.value = false
  }
}
</script>