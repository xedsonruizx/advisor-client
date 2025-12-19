<template>
  <div v-if="loading" class="container py-5 text-center">
    <div class="spinner-border text-primary" role="status">
      <span class="visually-hidden">Cargando...</span>
    </div>
  </div>

  <div v-else-if="error" class="container py-5 text-center">
    <div class="alert alert-danger">{{ error }}</div>
    <router-link to="/posts" class="btn btn-secondary">Volver a Avisos</router-link>
  </div>

  <div v-else-if="post" class="container py-5">
    <!-- Admin Controls -->
    <div v-if="canEdit" class="d-flex justify-content-end mb-3 gap-2">
      <button class="btn btn-outline-primary" @click="openEditModal">
        <i class="bi bi-pencil-fill me-2"></i>Editar
      </button>
      <button class="btn btn-outline-danger" @click="confirmDelete">
        <i class="bi bi-trash-fill me-2"></i>Eliminar
      </button>
    </div>

    <div class="card shadow-lg border-0 overflow-hidden">
      <!-- Header / Banner -->
      <div class="bg-primary text-white p-4 p-md-5 position-relative" style="background-color: var(--primary-color) !important;">
        <div class="position-relative z-index-10">
          <div class="d-flex align-items-center gap-2 mb-3">
             <span v-if="post.minPlan" class="badge bg-white text-primary fs-6 border border-white" style="color: var(--primary-color) !important;">
                Plan {{ post.minPlan.name }}
              </span>
              <span v-else class="badge bg-success fs-6">Público</span>
              <span class="text-white-50 ms-2" style="color: rgba(255,255,255,0.7) !important;">
                <i class="bi bi-calendar3 me-1"></i>
                {{ new Date(post.createdAt).toLocaleDateString() }}
              </span>
          </div>
          <h1 class="display-4 fw-bold mb-2 font-serif">{{ post.title }}</h1>
          <p class="lead mb-0 text-white-50" style="color: rgba(255,255,255,0.7) !important;">{{ post.shortDescription }}</p>
        </div>
      </div>

      <!-- Locked State -->
      <div v-if="post.isLocked" class="card-body p-5 text-center bg-light">
        <div class="py-5">
          <i class="bi bi-lock-fill display-1 text-secondary mb-3"></i>
          <h2 class="h3 fw-bold text-secondary">Contenido Bloqueado</h2>
          
          <div class="alert alert-warning d-inline-block px-4 py-3 my-3" role="alert">
            <i class="bi bi-exclamation-triangle-fill me-2"></i>
            Debes tener una suscripción activa para ver este contenido.
          </div>

          <p class="text-muted mb-4">
            Este contenido es exclusivo para miembros del <strong>Plan {{ post.minPlan.name }}</strong> o superior.
          </p>
          <div class="d-flex justify-content-center gap-3">
             <router-link v-if="!auth.isAuthenticated" to="/login" class="btn btn-primary px-4">
               Iniciar Sesión
             </router-link>
             <router-link v-else to="/memberships" class="btn btn-primary px-4">
               Ver Planes
             </router-link>
             <router-link to="/posts" class="btn btn-outline-secondary px-4">
               Volver
             </router-link>
          </div>
        </div>
      </div>

      <!-- Content State -->
      <div v-else class="card-body p-0">
        <!-- Media Section -->
        <div v-if="post.mediaUrl" class="bg-dark text-center position-relative" style="max-height: 600px; overflow: hidden;">
          <img v-if="post.mediaType === 'image'" :src="getProcessedMediaUrl(post.mediaUrl)" class="img-fluid" style="max-height: 600px; width: 100%; object-fit: contain;" :alt="post.title" @error="$event.target.style.display='none'">
          <div v-if="post.mediaType === 'image'" class="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-secondary text-white" style="z-index: -1;">
             <i class="bi bi-image display-1"></i>
          </div>

          <div v-else-if="post.mediaType === 'video'" class="ratio ratio-16x9" style="max-height: 600px;">
             <video controls class="w-100 h-100">
              <source :src="getProcessedMediaUrl(post.mediaUrl)">
              Tu navegador no soporta video.
            </video>
          </div>
        </div>

        <!-- Text Content -->
        <div class="p-4 p-md-5">
          <div class="article-content ql-editor" style="font-size: 1.1rem; line-height: 1.8; color: #333;" v-html="post.content"></div>
          
          <div class="mt-5 pt-4 border-top">
            <router-link to="/posts" class="btn btn-outline-secondary">
              <i class="bi bi-arrow-left me-2"></i>Volver a la lista
            </router-link>
          </div>
        </div>
      </div>
    </div>

    <!-- Edit Modal (Simplified Duplicate for Stability) -->
    <div v-if="showModal" class="modal d-block" tabindex="-1" style="background: rgba(0,0,0,0.5)">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Editar Aviso</h5>
            <button type="button" class="btn-close" @click="closeModal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="savePost" novalidate>
              <div class="mb-3">
                <label class="form-label">Título</label>
                <input v-model="postForm.title" class="form-control" required>
              </div>
              <div class="mb-3">
                <label class="form-label">Descripción Corta</label>
                <input v-model="postForm.shortDescription" class="form-control" required>
              </div>
              <div class="mb-3">
                <label class="form-label">Contenido Completo</label>
                <div style="height: 300px; margin-bottom: 50px;">
                  <QuillEditor 
                    v-model:content="postForm.content" 
                    contentType="html" 
                    theme="snow"
                    toolbar="full"
                  />
                </div>
              </div>
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label class="form-label">URL Multimedia</label>
                  <input v-model="postForm.mediaUrl" class="form-control">
                </div>
                <div class="col-md-6 mb-3">
                  <label class="form-label">Tipo de Medio</label>
                  <select v-model="postForm.mediaType" class="form-select">
                    <option value="">Ninguno</option>
                    <option value="image">Imagen</option>
                    <option value="video">Video</option>
                  </select>
                </div>
              </div>
              <div class="mb-3">
                <label class="form-label">Plan Mínimo Requerido</label>
                <select v-model="postForm.minPlanId" class="form-select">
                  <option value="">Público (Todos)</option>
                  <option v-for="plan in plans" :key="plan.id" :value="plan.id">
                    {{ plan.name }} (Nivel {{ plan.level }})
                  </option>
                </select>
              </div>
              <div class="d-flex justify-content-end gap-2">
                <button type="button" class="btn btn-secondary" @click="closeModal">Cancelar</button>
                <button type="submit" class="btn btn-primary">Guardar Cambios</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import { useAuthStore } from '../../stores/auth'
import { getProcessedMediaUrl } from '../../utils/helpers'
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css';

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const post = ref(null)
const loading = ref(true)
const error = ref(null)
const plans = ref([])
const showModal = ref(false)

const canEdit = computed(() => {
  return auth.user?.role === 'admin' || auth.user?.role === 'advisor'
})

const postForm = ref({
  title: '',
  shortDescription: '',
  content: '',
  mediaUrl: '',
  mediaType: '',
  minPlanId: ''
})

onMounted(async () => {
  await fetchPost()
  if (canEdit.value) {
    fetchPlans()
  }
})

async function fetchPost() {
  loading.value = true
  error.value = null
  try {
    const { data } = await axios.get(`/posts/${route.params.id}`)
    post.value = data
  } catch (e) {
    error.value = "No se pudo cargar la publicación o no existe."
    console.error(e)
  } finally {
    loading.value = false
  }
}

async function fetchPlans() {
  try {
    const { data } = await axios.get('/memberships/plans')
    plans.value = data
  } catch (e) {
    console.error(e)
  }
}

function openEditModal() {
  postForm.value = {
    title: post.value.title,
    shortDescription: post.value.shortDescription,
    content: post.value.content,
    mediaUrl: post.value.mediaUrl || '',
    mediaType: post.value.mediaType || '',
    minPlanId: post.value.minPlanId || ''
  }
  showModal.value = true
}

function closeModal() {
  showModal.value = false
}

async function savePost() {
  try {
    const payload = { ...postForm.value }
    if (!payload.mediaUrl) payload.mediaUrl = undefined
    if (!payload.mediaType) payload.mediaType = undefined
    if (!payload.minPlanId) payload.minPlanId = undefined

    await axios.put(`/posts/${post.value.id}`, payload)
    showModal.value = false
    await fetchPost() // Refresh data
  } catch (e) {
    alert('Error al guardar: ' + (e.response?.data?.error || e.message))
  }
}

async function confirmDelete() {
  if (confirm('¿Estás seguro de que quieres eliminar esta publicación permanentemente?')) {
    try {
      await axios.delete(`/posts/${post.value.id}`)
      router.push('/posts')
    } catch (e) {
      alert('Error al eliminar: ' + (e.response?.data?.error || e.message))
    }
  }
}
</script>

<style scoped>
.z-index-10 {
  z-index: 10;
}
</style>
