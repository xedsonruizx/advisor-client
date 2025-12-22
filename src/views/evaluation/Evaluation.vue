<template>
  <div class="container py-5">
    <PageHeader 
      title="Evaluación Empresarial" 
      subtitle="Complete el cuestionario para obtener un diagnóstico de su empresa"
    />

    <LoadingSpinner v-if="loading" />

    <div v-else-if="questions.length === 0" class="alert alert-info text-center">
      No hay preguntas configuradas para la evaluación en este momento.
    </div>

    <div v-else class="row justify-content-center">
      <div class="col-lg-8">
        <!-- Progress Bar -->
        <div class="progress mb-4" style="height: 10px;">
          <div 
            class="progress-bar bg-primary" 
            role="progressbar" 
            :style="{ width: progressPercentage + '%' }"
            :aria-valuenow="progressPercentage" 
            aria-valuemin="0" 
            aria-valuemax="100"
          ></div>
        </div>

        <form @submit.prevent="submitEvaluation">
          <div v-for="q in visibleQuestions" :key="q.id" class="card mb-4 border-0 shadow-sm animate__animated animate__fadeIn">
            <div class="card-body p-4">
              <h5 class="card-title fw-bold text-primary mb-3">{{ q.order }}. {{ q.text }} <span v-if="q.required" class="text-danger">*</span></h5>
              
              <!-- Input Types -->
              <div v-if="q.type === 'text'">
                <input 
                  v-model="responses[q.id].textValue" 
                  type="text" 
                  class="form-control" 
                  :required="q.required"
                  @input="saveProgress"
                >
              </div>

              <div v-else-if="q.type === 'number'">
                <input 
                  v-model="responses[q.id].textValue" 
                  type="number" 
                  class="form-control" 
                  :required="q.required"
                  @input="saveProgress"
                >
              </div>

              <div v-else-if="q.type === 'date'">
                <input 
                  v-model="responses[q.id].textValue" 
                  type="date" 
                  class="form-control" 
                  :required="q.required"
                  @input="saveProgress"
                >
              </div>

              <div v-else-if="q.type === 'select'">
                <select 
                  v-model="responses[q.id].optionId" 
                  class="form-select" 
                  :required="q.required"
                  @change="saveProgress"
                >
                  <option :value="null" disabled>Seleccione una opción</option>
                  <option v-for="opt in q.options" :key="opt.id" :value="opt.id">
                    {{ opt.text }}
                  </option>
                </select>
              </div>

              <div v-else-if="q.type === 'radio'">
                <div v-for="opt in q.options" :key="opt.id" class="form-check mb-2">
                  <input 
                    class="form-check-input" 
                    type="radio" 
                    :name="'q_' + q.id" 
                    :id="'opt_' + opt.id"
                    :value="opt.id"
                    v-model="responses[q.id].optionId"
                    :required="q.required"
                    @change="saveProgress"
                  >
                  <label class="form-check-label" :for="'opt_' + opt.id">
                    {{ opt.text }}
                  </label>
                </div>
              </div>

              <div v-else-if="q.type === 'checkbox'">
                <div v-for="opt in q.options" :key="opt.id" class="form-check mb-2">
                  <input 
                    class="form-check-input" 
                    type="checkbox" 
                    :id="'opt_' + opt.id"
                    :value="opt.id"
                    v-model="responses[q.id].optionIds"
                    @change="saveProgress"
                  >
                  <label class="form-check-label" :for="'opt_' + opt.id">
                    {{ opt.text }}
                  </label>
                </div>
              </div>

              <!-- Penalty Warning -->
              <div v-if="getPenalty(q)" class="alert alert-warning mt-3 mb-0 d-flex align-items-start">
                <i class="bi bi-exclamation-triangle-fill me-2 mt-1"></i>
                <div v-html="getPenalty(q)"></div>
              </div>

            </div>
          </div>

          <div class="d-flex justify-content-between align-items-center mt-4 mb-5">
            <button type="button" class="btn btn-outline-danger" @click="resetEvaluation">
              <i class="bi bi-arrow-counterclockwise me-2"></i>Reiniciar
            </button>
            <button type="submit" class="btn btn-primary btn-lg px-5 shadow" :disabled="submitting">
              <span v-if="submitting" class="spinner-border spinner-border-sm me-2"></span>
              Finalizar y Enviar
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import PageHeader from '../../components/global/PageHeader.vue'
import LoadingSpinner from '../../components/global/LoadingSpinner.vue'

const router = useRouter()
const auth = useAuthStore()

const questions = ref([])
const loading = ref(true)
const submitting = ref(false)
const responses = ref({}) // Structure: { questionId: { textValue, optionId, optionIds: [] } }

onMounted(async () => {
  await fetchStructure()
  loadProgress()
})

async function fetchStructure() {
  loading.value = true
  try {
    const { data } = await axios.get('/evaluations/structure')
    questions.value = data
    
    // Initialize responses structure
    questions.value.forEach(q => {
      if (!responses.value[q.id]) {
        responses.value[q.id] = {
          questionId: q.id,
          textValue: '',
          optionId: null,
          optionIds: []
        }
      }
    })
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

// Logic to determine visible questions based on parentQuestionId
const visibleQuestions = computed(() => {
  // Sort by order first
  const sorted = [...questions.value].sort((a, b) => a.order - b.order)
  
  return sorted.filter(q => {
    if (!q.parentQuestionId) return true // Show if no parent
    
    // Check parent response
    const parentResp = responses.value[q.parentQuestionId]
    if (!parentResp) return false // Should not happen if initialized
    
    // If using new advanced conditions
    if (q.conditionOperator) {
      return checkCondition(q.conditionOperator, q.conditionValue, parentResp)
    }

    // If there is a specific option dependency (Legacy/Fallback)
    if (q.parentOptionId) {
      // Check if parent option matches
      if (parentResp.optionId === q.parentOptionId) return true
      if (parentResp.optionIds && parentResp.optionIds.includes(q.parentOptionId)) return true
      return false
    }
    
    // Simple logic: Show if parent has ANY value (answered) if no specific option required
    const hasValue = parentResp.textValue || parentResp.optionId || (parentResp.optionIds && parentResp.optionIds.length > 0)
    
    return hasValue
  })
})

function checkCondition(operator, value, response) {
  // Determine the actual value from response
  // Priority: optionIds (array) -> optionId (single) -> textValue (string/number)
  
  // Wait, if it's checkbox, it has optionIds. If select, optionId. If text, textValue.
  // We need to know what type the parent question is to know which field to look at?
  // Actually, we can infer from what is present.
  // BUT, 'optionId' might be present but null.
  
  let actualValue = null
  if (response.optionIds && response.optionIds.length > 0) {
    actualValue = response.optionIds // Array
  } else if (response.optionId) {
    actualValue = response.optionId // String (ID)
  } else {
    actualValue = response.textValue // String
  }

  // Handle "is_empty" / "is_not_empty" first as they don't need 'value' and handle nulls
  if (operator === 'is_empty') {
    return !actualValue || (Array.isArray(actualValue) && actualValue.length === 0) || actualValue === ''
  }
  if (operator === 'is_not_empty') {
    return actualValue && ((Array.isArray(actualValue) && actualValue.length > 0) || actualValue !== '')
  }

  if (actualValue === null || actualValue === undefined) return false

  // Normalize for comparison
  const strValue = String(actualValue).toLowerCase()
  const targetValue = String(value || '').toLowerCase()
  const numValue = Number(actualValue)
  const targetNum = Number(value)

  switch (operator) {
    case 'equals':
      if (Array.isArray(actualValue)) return false // Can't equal an array to a single value easily unless strict
      return strValue === targetValue
    case 'not_equals':
      return strValue !== targetValue
    case 'contains':
      if (Array.isArray(actualValue)) return actualValue.includes(value) // Check if ID is in array
      return strValue.includes(targetValue)
    case 'not_contains':
      if (Array.isArray(actualValue)) return !actualValue.includes(value)
      return !strValue.includes(targetValue)
    case 'greater_than':
      return !isNaN(numValue) && !isNaN(targetNum) && numValue > targetNum
    case 'less_than':
      return !isNaN(numValue) && !isNaN(targetNum) && numValue < targetNum
    case 'greater_than_or_equal':
      return !isNaN(numValue) && !isNaN(targetNum) && numValue >= targetNum
    case 'less_than_or_equal':
      return !isNaN(numValue) && !isNaN(targetNum) && numValue <= targetNum
    case 'count_equals':
      return Array.isArray(actualValue) && actualValue.length === targetNum
    case 'count_greater_than':
      return Array.isArray(actualValue) && actualValue.length > targetNum
    case 'count_less_than':
      return Array.isArray(actualValue) && actualValue.length < targetNum
    default:
      return false
  }
}

const progressPercentage = computed(() => {
  if (questions.value.length === 0) return 0
  const total = visibleQuestions.value.length
  if (total === 0) return 0
  
  const answered = visibleQuestions.value.filter(q => {
    const r = responses.value[q.id]
    return r && (r.textValue || r.optionId || (r.optionIds && r.optionIds.length > 0))
  }).length
  
  return Math.round((answered / total) * 100)
})

function getPenalty(question) {
  const r = responses.value[question.id]
  if (!r) return null
  
  // Single select / Radio
  if (r.optionId) {
    const opt = question.options?.find(o => o.id === r.optionId)
    return opt?.penalty || null
  }
  
  // Multi select
  if (r.optionIds && r.optionIds.length > 0) {
    // Show all penalties concatenated? Or just first?
    const penalties = question.options
      .filter(o => r.optionIds.includes(o.id) && o.penalty)
      .map(o => o.penalty)
    
    if (penalties.length > 0) return penalties.join('<br>')
  }
  
  return null
}

const STORAGE_KEY = 'elite_evaluation_progress'

function saveProgress() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(responses.value))
}

function loadProgress() {
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved) {
    try {
      const parsed = JSON.parse(saved)
      // Merge with initialized responses to ensure structure validity
      Object.keys(parsed).forEach(k => {
        if (responses.value[k]) {
          responses.value[k] = parsed[k]
        }
      })
    } catch (e) {
      console.error('Error loading progress', e)
    }
  }
}

function resetEvaluation() {
  if (confirm('¿Está seguro de reiniciar? Se perderá todo el progreso actual.')) {
    localStorage.removeItem(STORAGE_KEY)
    // Reset values
    Object.keys(responses.value).forEach(k => {
      responses.value[k] = {
        questionId: k,
        textValue: '',
        optionId: null,
        optionIds: []
      }
    })
    window.scrollTo(0, 0)
  }
}

async function submitEvaluation() {
  if (!auth.user || !auth.user.id) {
    alert('Error: No se ha identificado el usuario. Por favor inicie sesión nuevamente.')
    return
  }

  submitting.value = true
  try {
    // Transform responses for backend
    // Only send visible questions!
    const payload = {
      userId: auth.user.id,
      responses: visibleQuestions.value.map(q => {
        const r = responses.value[q.id]
        // Ensure values are properly formatted
        return {
          questionId: q.id,
          optionId: r.optionId || undefined,
          optionIds: r.optionIds?.length ? r.optionIds : undefined,
          // Explicitly convert to string if exists, to avoid number type issues with Zod
          textValue: (r.textValue !== null && r.textValue !== undefined && r.textValue !== '') ? String(r.textValue) : undefined
        }
      }).filter(r => r.optionId || r.optionIds || r.textValue !== undefined) 
    }
    
    const { data } = await axios.post('/evaluations/submit', payload)
    
    // Clear cache
    localStorage.removeItem(STORAGE_KEY)
    
    // Redirect to results
    router.push('/evaluation/results')
    
    } catch (e) {
    alert('Error al enviar: ' + (e.response?.data?.error || e.message))
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.animate__animated {
  animation-duration: 0.5s;
}
</style>