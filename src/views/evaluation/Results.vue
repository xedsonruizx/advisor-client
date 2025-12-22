<template>
  <div class="container py-5">
    <PageHeader 
      title="Resultados de la Evaluación" 
      subtitle="Resumen de su diagnóstico empresarial"
    />

    <LoadingSpinner v-if="loading" />

    <div v-else-if="!evaluation" class="alert alert-warning text-center">
      No se encontraron resultados para su usuario.
      <br>
      <router-link to="/evaluation" class="btn btn-primary mt-3">Iniciar Evaluación</router-link>
    </div>

    <div v-else class="row justify-content-center">
      <div class="col-lg-8">
        <!-- Score Card -->
        <div class="card border-0 shadow-lg mb-4 text-center">
          <div class="card-body p-5">
            <div class="d-flex justify-content-center align-items-center mb-3">
              <div class="display-1 fw-bold me-3" :class="scoreColorClass">{{ evaluation.score }}</div>
              <div class="text-start" v-if="evaluation.maxScore > 0">
                <div class="h5 text-muted mb-0">/ {{ evaluation.maxScore }}</div>
                <div class="badge rounded-pill" :class="scoreBadgeClass">
                  {{ successPercentage }}% de Éxito
                </div>
              </div>
            </div>
            
            <h3 class="text-muted mb-4">Puntos Totales</h3>
            
            <div class="alert alert-success d-inline-block px-4">
              Evaluación Completada: {{ new Date(evaluation.completedAt).toLocaleDateString() }}
            </div>
            
            <div class="mt-4">
              <router-link to="/dashboard" class="btn btn-outline-primary me-2">Volver al Panel</router-link>
              <button @click="restart" class="btn btn-outline-danger">Realizar Nueva Prueba</button>
            </div>
          </div>
        </div>
        
        <!-- Responses Detail -->
        <div class="card border-0 shadow-sm">
          <div class="card-header bg-dark text-white fw-bold py-3">Detalle de Respuestas</div>
          <div class="card-body p-0 bg-dark">
            <div class="list-group list-group-flush">
              <div v-for="resp in sortedResponses" :key="resp.id" class="list-group-item bg-dark text-white border-secondary p-3">
                <div class="fw-bold mb-1 text-light">{{ resp.question.text }}</div>
                <div class="text-white-50 d-flex justify-content-between align-items-center">
                  <div>
                    <span v-if="resp.option">{{ resp.option.text }}</span>
                    <span v-else-if="resp.textValue">{{ resp.textValue }}</span>
                    <span v-else class="fst-italic text-secondary">Sin respuesta</span>
                  </div>
                  
                  <span v-if="isAdmin && resp.option?.score" class="badge bg-success ms-2">+{{ resp.option.score }} pts</span>
                </div>
                
                <div v-if="resp.option?.penalty" class="alert alert-warning mt-2 mb-0 py-2 small bg-warning bg-opacity-10 border-warning text-warning">
                  <i class="bi bi-exclamation-triangle me-1"></i> <span v-html="resp.option.penalty"></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import PageHeader from '../../components/global/PageHeader.vue'
import LoadingSpinner from '../../components/global/LoadingSpinner.vue'

const router = useRouter()
const auth = useAuthStore()
const loading = ref(true)
const evaluation = ref(null)

const isAdmin = computed(() => {
  return auth.user?.role === 'admin' || auth.user?.role === 'advisor'
})

const sortedResponses = computed(() => {
  if (!evaluation.value?.responses) return []
  return [...evaluation.value.responses].sort((a, b) => a.question.order - b.question.order)
})

const successPercentage = computed(() => {
  if (!evaluation.value || !evaluation.value.maxScore) return 0
  return Math.round((evaluation.value.score / evaluation.value.maxScore) * 100)
})

const scoreColorClass = computed(() => {
  const p = successPercentage.value
  if (p < 33) return 'text-danger'
  if (p < 66) return 'text-warning'
  return 'text-success'
})

const scoreBadgeClass = computed(() => {
  const p = successPercentage.value
  if (p < 33) return 'bg-danger'
  if (p < 66) return 'bg-warning text-dark'
  return 'bg-success'
})

onMounted(async () => {
  if (auth.user) {
    await fetchResults()
  }
})

async function fetchResults() {
  loading.value = true
  try {
    const { data } = await axios.get(`/evaluations/results/${auth.user.id}`)
    evaluation.value = data
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

async function restart() {
  if (confirm('¿Desea realizar una nueva evaluación? Se eliminará el registro actual.')) {
    try {
      router.push('/evaluation')
    } catch (e) {
      console.error(e)
    }
  }
}
</script>
