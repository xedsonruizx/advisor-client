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
      <!-- Visible Content (Dark Mode) -->
      <div class="col-lg-8" ref="resultsContent">
        <!-- PDF/Report Header (Visible always, styled for report) -->
        <div class="card border-0 shadow-lg mb-4">
          <div class="card-body p-5">
             <!-- User Details Header -->
            <div class="border-bottom border-secondary pb-4 mb-4" v-if="evaluation.user">
              <div class="row">
                <div class="col-md-6 text-start">
                   <h5 class="text-white mb-1">Reporte de Evaluación</h5>
                   <div class="text-muted small">Generado el {{ new Date().toLocaleDateString() }}</div>
                </div>
                <div class="col-md-6 text-md-end text-start mt-3 mt-md-0">
                   <h5 class="text-primary mb-1">{{ evaluation.user.name }}</h5>
                   <div class="text-muted">{{ evaluation.user.email }}</div>
                </div>
              </div>
            </div>

            <!-- Score Summary -->
            <div class="text-center">
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
                Realizado: {{ new Date(evaluation.completedAt).toLocaleDateString() }}
              </div>
            </div>
            
            <div class="mt-4 text-center" data-html2canvas-ignore="true">
              <router-link to="/dashboard" class="btn btn-outline-primary me-2" v-if="!viewingOtherUser">Volver al Panel</router-link>
              <router-link to="/admin/users" class="btn btn-outline-primary me-2" v-else>Volver a Usuarios</router-link>
              
              <button @click="downloadPDF" class="btn btn-outline-secondary me-2">
                <i class="bi bi-download me-1"></i> Descargar PDF
              </button>

              <button @click="restart" class="btn btn-outline-danger" v-if="!viewingOtherUser">Realizar Nueva Prueba</button>
            </div>
          </div>
        </div>
        
        <!-- Responses Detail -->
        <div class="card border-0 shadow-sm">
          <div class="card-header bg-dark text-white fw-bold py-3">Detalle de Respuestas</div>
          <div class="card-body p-0 bg-dark">
            <div class="list-group list-group-flush">
              <div v-for="item in groupedResponses" :key="item.question.id" class="list-group-item bg-dark text-white border-secondary p-3">
                <div class="d-flex justify-content-between align-items-start mb-2">
                   <div class="fw-bold text-light me-3">{{ item.question.text }}</div>
                   <div v-if="isAdmin" class="badge bg-secondary text-light">
                      Max: {{ item.maxScore }} pts
                   </div>
                </div>
                
                <!-- Loop through user answers for this question -->
                <div v-for="(resp, idx) in item.responses" :key="idx" class="ps-3 border-start border-secondary ms-1 mb-2">
                    <div class="text-white-50 d-flex justify-content-between align-items-center">
                      <div>
                        <span v-if="resp.option">{{ resp.option.text }}</span>
                        <span v-else-if="resp.textValue">{{ resp.textValue }}</span>
                        <span v-else class="fst-italic text-secondary">Sin respuesta</span>
                      </div>
                      
                      <span v-if="isAdmin" class="ms-2">
                         <span v-if="resp.option?.score" class="badge bg-success">+{{ resp.option.score }} pts</span>
                         <span v-else-if="resp.textValue" class="badge bg-success">+1 pt</span>
                      </span>
                    </div>
                    
                    <div v-if="resp.option?.penalty" class="alert alert-warning mt-1 mb-0 py-1 px-2 small bg-warning bg-opacity-10 border-warning text-warning">
                      <i class="bi bi-exclamation-triangle me-1"></i> <span v-html="resp.option.penalty"></span>
                    </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- PDF Template Overlay (Rendered specifically for PDF generation) -->
      <div v-show="isGeneratingPdf" ref="pdfTemplate" class="pdf-print-container">
           <!-- Header -->
              <div class="mb-5 border-bottom pb-3">
                <div class="row">
                  <div class="col-6">
                    <h2 class="fw-bold text-dark mb-0">Reporte de Evaluación</h2>
                    <div class="text-muted">Generado el {{ new Date().toLocaleDateString() }}</div>
                  </div>
                  <div class="col-6 text-end" v-if="evaluation.user">
                     <h4 class="text-primary mb-0">{{ evaluation.user.name }}</h4>
                     <div class="text-muted">{{ evaluation.user.email }}</div>
                  </div>
                </div>
              </div>
  
              <!-- Score Summary -->
              <div class="text-center mb-5 p-4 bg-light rounded border">
                 <h3 class="text-uppercase text-muted small fw-bold mb-3">Resultado General</h3>
                 <div class="display-3 fw-bold mb-2" :class="successPercentage < 66 ? (successPercentage < 33 ? 'text-danger' : 'text-warning') : 'text-success'">
                   {{ evaluation.score }} <span class="fs-4 text-muted text-dark">/ {{ evaluation.maxScore }}</span>
                 </div>
                 <div class="h4 mb-0" :class="successPercentage < 66 ? (successPercentage < 33 ? 'text-danger' : 'text-warning') : 'text-success'">
                   {{ successPercentage }}% de Éxito
                 </div>
              </div>
  
              <!-- Details -->
              <h4 class="mb-3 border-bottom pb-2">Detalle de Respuestas</h4>
              <div class="mb-3" v-for="item in groupedResponses" :key="'pdf-'+item.question.id">
                 <div class="d-flex justify-content-between align-items-center mb-2 bg-light p-2 rounded">
                    <span class="fw-bold">{{ item.question.text }}</span>
                    <span class="badge bg-secondary">Max: {{ item.maxScore }} pts</span>
                 </div>
                 
                 <div class="ps-3">
                    <div v-for="(resp, idx) in item.responses" :key="'pdf-r-'+idx" class="mb-2 border-start ps-2 border-3 border-primary">
                       <div class="d-flex justify-content-between">
                          <div>
                            <div v-if="resp.option" class="fw-medium">{{ resp.option.text }}</div>
                            <div v-else-if="resp.textValue" class="fw-medium">{{ resp.textValue }}</div>
                            <div v-else class="fst-italic text-muted">Sin respuesta</div>
                          </div>
                          <div>
                             <span v-if="resp.option?.score" class="fw-bold text-success">+{{ resp.option.score }} pts</span>
                             <span v-else-if="resp.textValue" class="fw-bold text-success">+1 pt</span>
                             <span v-else class="text-muted">0 pts</span>
                          </div>
                       </div>
                       <div v-if="resp.option?.penalty" class="mt-1 text-danger small">
                          <i class="bi bi-exclamation-triangle-fill me-1"></i> <span v-html="resp.option.penalty"></span>
                       </div>
                    </div>
                 </div>
              </div>
           </div>
       </div>
    </div>
</template>

<style scoped>
.pdf-print-container {
  /* Position on top of everything to ensure capture */
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 10000;
  background: white;
  color: black;
  padding: 20mm;
  overflow-y: auto;
}
</style>

<script setup>
import { ref, onMounted, computed, nextTick, watch } from 'vue'
import axios from 'axios'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import PageHeader from '../../components/global/PageHeader.vue'
import LoadingSpinner from '../../components/global/LoadingSpinner.vue'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()
const loading = ref(true)
const evaluation = ref(null)
const resultsContent = ref(null)
const pdfTemplate = ref(null)
const isGeneratingPdf = ref(false)

const isAdmin = computed(() => {
  return auth.user?.role === 'admin' || auth.user?.role === 'advisor'
})

// Check if we are viewing another user's result as admin
const viewingOtherUser = computed(() => {
  return route.params.userId && route.params.userId !== auth.user?.id
})

// Group responses by Question ID to handle checkboxes cleanly
const groupedResponses = computed(() => {
  if (!evaluation.value?.responses) return []
  
  const groups = new Map()
  
  // First pass: group responses
  evaluation.value.responses.forEach(resp => {
    if (!groups.has(resp.question.id)) {
      groups.set(resp.question.id, {
        question: resp.question,
        responses: [],
        maxScore: 0
      })
    }
    groups.get(resp.question.id).responses.push(resp)
  })
  
  // Calculate max score for each question group
  for (const group of groups.values()) {
    const q = group.question
    // Since we don't have the full options list in 'resp.question' (usually),
    // we can't perfectly calculate max score if the backend didn't send all options.
    // However, the backend 'evaluation.responses' include 'question' but NOT 'question.options' usually unless we requested it.
    // Wait, the backend include was: 
    // include: { responses: { include: { question: true, option: true } } }
    // It does NOT include all options of the question, only the selected option details.
    // This is a limitation. We can only show the max score if we fetch all questions or if backend sends it.
    
    // Workaround: We will use a rough estimate or simply hide it if we can't calculate it?
    // User requested "puntos maximos de la pregunta".
    // We strictly need the full question metadata to know the max score.
    // But we are in "Results" view.
    // Let's assume for now we might not have it accurate unless we change backend.
    // BUT: The backend endpoint I edited earlier DOES include `question: true`.
    // Does `question: true` include `options`? No, nested relations need explicit include.
    
    // For now, I will display "N/A" or try to infer. 
    // Actually, to do this correctly, I should update backend to include `options` in the question of the response.
    // OR fetch the full questionnaire. 
    // Given the constraint, I'll update the backend to include `options` in `question` for the results.
    
    // Logic for calculation (if options available):
    if (q.options && Array.isArray(q.options)) {
        if (['select', 'radio'].includes(q.type)) {
             group.maxScore = q.options.reduce((max, opt) => Math.max(max, opt.score), 0)
        } else if (q.type === 'checkbox') {
             group.maxScore = q.options.reduce((sum, opt) => sum + (opt.score > 0 ? opt.score : 0), 0)
        } else {
             group.maxScore = 1
        }
    } else {
        // Fallback if no options data (e.g. text/number or missing include)
        group.maxScore = 1 
    }
  }

  // Sort by order
  return Array.from(groups.values()).sort((a, b) => a.question.order - b.question.order)
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

// Watch for user to be loaded (e.g. on F5 refresh)
watch(() => auth.user, async (newUser) => {
  if (newUser) {
    await fetchResults()
  }
})

async function fetchResults() {
  loading.value = true
  try {
    let userId = auth.user.id
    if (viewingOtherUser.value && isAdmin.value) {
      userId = route.params.userId
    }
    
    const { data } = await axios.get(`/evaluations/results/${userId}`)
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

async function downloadPDF() {
  isGeneratingPdf.value = true
  
  // Wait for the template to be rendered in the DOM
  nextTick(async () => {
    try {
      // Get the full HTML content of the template
      const element = pdfTemplate.value
      if (!element) throw new Error("Template not found")
      
      // Clone the element to not mess with the view
      const clone = element.cloneNode(true)
      
      // We need to inject styles to ensure the PDF looks right
      // Since we are sending raw HTML, we need to make sure global styles or scoped styles are included.
      // Puppeteer might not see the Vite-injected styles easily if we just send innerHTML.
      // A robust way is to wrap it in a full HTML structure with Bootstrap CDN for this specific use case
      // OR send the innerHTML and let backend wrap it.
      
      // Let's grab the HTML and wrap it with necessary styles in the backend or here.
      // For simplicity, let's include a basic Bootstrap CDN link in the string we send.
      
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Reporte</title>
          <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
          <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.0/font/bootstrap-icons.css">
          <style>
            body { font-family: sans-serif; -webkit-print-color-adjust: exact; }
            .badge { print-color-adjust: exact; }
            .bg-dark { background-color: #212529 !important; color: white !important; }
            .bg-light { background-color: #f8f9fa !important; }
            .text-white { color: white !important; }
            .border-secondary { border-color: #6c757d !important; }
            /* Custom styles from component */
            .text-success { color: #198754 !important; }
            .text-danger { color: #dc3545 !important; }
            .text-warning { color: #ffc107 !important; }
          </style>
        </head>
        <body class="p-4">
          ${element.innerHTML}
        </body>
        </html>
      `
      
      const userId = evaluation.value.user?.id || 'unknown'
      
      const response = await axios.post('/evaluations/pdf', {
        htmlContent,
        userId
      }, {
        responseType: 'blob' // Important for file download
      })
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      const date = new Date(evaluation.value.completedAt).toLocaleDateString().replace(/\//g, '-')
      const userName = evaluation.value.user?.name || 'Usuario'
      link.setAttribute('download', `Evaluacion-${userName}-${date}.pdf`)
      document.body.appendChild(link)
      link.click()
      
      // Cleanup
      window.URL.revokeObjectURL(url)
      document.body.removeChild(link)
      
    } catch (e) {
      console.error('Error downloading PDF:', e)
      alert('Error al generar el PDF. Por favor intente nuevamente.')
    } finally {
      isGeneratingPdf.value = false
    }
  })
}
</script>
