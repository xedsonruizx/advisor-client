<template>
  <div class="container py-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2 class="mb-0">Avisos y Noticias</h2>
      <button v-if="canCreate" class="btn btn-primary" @click="openCreateModal">
        <i class="bi bi-plus-lg me-2"></i>Nuevo Aviso
      </button>
    </div>

    <!-- Posts List -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Cargando...</span>
      </div>
    </div>
    
    <div v-else-if="posts.length === 0" class="text-center py-5 bg-light rounded">
      <p class="text-muted mb-0">No hay publicaciones disponibles.</p>
    </div>

    <div v-else class="row g-4">
      <div v-for="post in posts" :key="post.id" class="col-12 col-md-6 col-lg-4 d-flex align-items-stretch">
        <div class="card shadow-sm border-0 w-100" :class="{ 'opacity-75': post.isLocked }">
          
          <!-- Admin Controls -->
          <div v-if="canCreate" class="position-absolute top-0 end-0 p-2 z-index-10">
            <div class="btn-group shadow-sm">
              <button class="btn btn-light" @click="editPost(post)" title="Editar" style="border-radius: 50% 0 0 50%;">
                <i class="bi bi-pencil-fill text-primary"></i>
              </button>
              <button class="btn btn-light" @click="confirmDelete(post)" title="Eliminar" style="border-radius: 0 50% 50% 0;">
                <i class="bi bi-trash-fill text-danger"></i>
              </button>
            </div>
          </div>

          <!-- Locked Overlay Header for Media -->
          <div v-if="post.isLocked" class="card-img-top bg-secondary text-white d-flex align-items-center justify-content-center" style="height: 200px;">
            <div class="text-center">
              <i class="bi bi-lock-fill fs-1 mb-2"></i>
              <p class="mb-0 fw-bold">Contenido Bloqueado</p>
            </div>
          </div>

          <!-- Media Content (Only if unlocked and available) -->
          <div v-else-if="post.mediaUrl" class="card-img-top bg-dark text-center overflow-hidden position-relative" style="height: 200px;">
            <img v-if="post.mediaType === 'image'" :src="getProcessedMediaUrl(post.mediaUrl)" class="w-100 h-100" style="object-fit: cover;" :alt="post.title" @error="$event.target.style.display='none'">
            <div v-if="post.mediaType === 'image'" class="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-secondary text-white" style="z-index: -1;">
               <i class="bi bi-image fs-1"></i>
            </div>

            <video v-else-if="post.mediaType === 'video'" controls class="w-100 h-100" style="object-fit: contain;">
              <source :src="getProcessedMediaUrl(post.mediaUrl)">
              Tu navegador no soporta video.
            </video>
          </div>
          
          <div class="card-body d-flex flex-column p-4">
            <div class="d-flex justify-content-between align-items-start mb-2">
              <span v-if="post.minPlan" class="badge bg-primary mb-2">
                Plan {{ post.minPlan.name }}
              </span>
              <span v-else class="badge bg-success mb-2">Público</span>
              <small class="text-muted">{{ new Date(post.createdAt).toLocaleDateString() }}</small>
            </div>

            <h5 class="card-title fw-bold text-dark">
              <router-link v-if="!post.isLocked" :to="'/posts/' + post.id" target="_blank" class="text-decoration-none text-dark stretched-link">
                {{ post.title }}
              </router-link>
              <span v-else class="text-dark">
                {{ post.title }}
              </span>
            </h5>
            
            <p class="card-text text-muted mb-3 position-relative z-index-10">{{ post.shortDescription }}</p>
            
            <div v-if="!post.isLocked" class="card-text text-dark flex-grow-1 position-relative z-index-10" style="white-space: pre-line; font-size: 0.95rem;">
              {{ post.content }}
            </div>
            
            <div v-else class="mt-auto text-center pt-3 border-top position-relative z-index-10">
               <div class="alert alert-warning d-flex align-items-center justify-content-center p-2 mb-3" role="alert">
                 <i class="bi bi-exclamation-triangle-fill me-2"></i>
                 <small>Debes tener una suscripción activa para ver este contenido.</small>
               </div>
               <p class="small text-muted mb-2">
                 Este contenido requiere el <strong>Plan {{ post.minPlan.name }}</strong> o superior.
               </p>
               <router-link v-if="!auth.isAuthenticated" to="/login" class="btn btn-outline-primary btn-sm w-100">
                 Iniciar Sesión para ver
               </router-link>
               <router-link v-else to="/dashboard" class="btn btn-outline-primary btn-sm w-100">
                 Mejorar mi Plan
               </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Create/Edit Post Modal -->
    <div v-if="showModal" class="modal d-block" tabindex="-1" style="background: rgba(0,0,0,0.5)">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ isEditing ? 'Editar Aviso' : 'Crear Nuevo Aviso' }}</h5>
            <button type="button" class="btn-close" @click="closeModal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="savePost" novalidate>
              <div class="mb-3">
                <label class="form-label">Título</label>
                <input 
                  v-model="postForm.title" 
                  class="form-control" 
                  :class="{ 'is-invalid': errors.title }"
                  required
                  @input="clearError('title')"
                >
                <div class="invalid-feedback">{{ errors.title }}</div>
              </div>
              
              <div class="mb-3">
                <label class="form-label">Descripción Corta</label>
                <input 
                  v-model="postForm.shortDescription" 
                  class="form-control" 
                  :class="{ 'is-invalid': errors.shortDescription }"
                  required
                  @input="clearError('shortDescription')"
                >
                <div class="invalid-feedback">{{ errors.shortDescription }}</div>
              </div>
              
              <div class="mb-3">
                <label class="form-label">Contenido Completo</label>
                <textarea 
                  v-model="postForm.content" 
                  class="form-control" 
                  rows="5" 
                  :class="{ 'is-invalid': errors.content }"
                  required
                  @input="clearError('content')"
                ></textarea>
                <div class="invalid-feedback">{{ errors.content }}</div>
              </div>
              
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label class="form-label">URL Multimedia (Drive/YouTube/Imagen)</label>
                  <input 
                    v-model="postForm.mediaUrl" 
                    class="form-control" 
                    placeholder="https://..."
                    :class="{ 'is-invalid': errors.mediaUrl }"
                    @input="clearError('mediaUrl')"
                  >
                  <div class="invalid-feedback">{{ errors.mediaUrl }}</div>
                </div>
                <div class="col-md-6 mb-3">
                  <label class="form-label">Tipo de Medio</label>
                  <select 
                    v-model="postForm.mediaType" 
                    class="form-select"
                    :class="{ 'is-invalid': errors.mediaType }"
                    @change="clearError('mediaType')"
                  >
                    <option value="">Ninguno</option>
                    <option value="image">Imagen</option>
                    <option value="video">Video</option>
                  </select>
                  <div class="invalid-feedback">{{ errors.mediaType }}</div>
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
                <button type="submit" class="btn btn-primary">{{ isEditing ? 'Guardar Cambios' : 'Publicar' }}</button>
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
import { getProcessedMediaUrl } from '../utils/helpers'

const auth = useAuthStore()
const posts = ref([])
const loading = ref(true)
const showModal = ref(false)
const plans = ref([])
const errors = reactive({})

const postForm = ref({
  id: null,
  title: '',
  shortDescription: '',
  content: '',
  mediaUrl: '',
  mediaType: '',
  minPlanId: ''
})

const canCreate = computed(() => {
  return auth.user?.role === 'admin' || auth.user?.role === 'advisor'
})

const isEditing = computed(() => !!postForm.value.id)

onMounted(async () => {
  await fetchPosts()
  if (canCreate.value) {
    await fetchPlans()
  }
})

async function fetchPosts() {
  loading.value = true
  try {
    const { data } = await axios.get('/posts')
    posts.value = data
  } catch (e) {
    console.error("Error fetching posts", e)
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

function openCreateModal() {
  resetForm()
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  resetForm()
}

function resetForm() {
  postForm.value = { id: null, title: '', shortDescription: '', content: '', mediaUrl: '', mediaType: '', minPlanId: '' }
  Object.keys(errors).forEach(key => delete errors[key])
}

function editPost(post) {
  postForm.value = {
    id: post.id,
    title: post.title,
    shortDescription: post.shortDescription,
    content: post.content, // Note: if locked, this might be null. Admin view should probably fetch full details if not available.
    mediaUrl: post.mediaUrl || '',
    mediaType: post.mediaType || '',
    minPlanId: post.minPlanId || '' // Check if API returns minPlanId in list. 
    // Wait, the list API returns 'minPlan' object, not 'minPlanId' directly usually, unless included.
    // The previous API call: include: { minPlan: true }. It doesn't explicitly select minPlanId, but prisma returns scalars by default.
    // So post.minPlanId should be there.
  }
  
  // If content is null (locked), we can't edit it properly from the list view.
  // We should fetch the single post details first to be safe.
  if (post.isLocked) {
     // Fetch full details
     axios.get(`/posts/${post.id}`).then(({ data }) => {
       postForm.value = {
         id: data.id,
         title: data.title,
         shortDescription: data.shortDescription,
         content: data.content,
         mediaUrl: data.mediaUrl || '',
         mediaType: data.mediaType || '',
         minPlanId: data.minPlanId || ''
       }
       showModal.value = true
     }).catch(e => alert("Error cargando detalles: " + e.message))
  } else {
    showModal.value = true
  }
}

async function confirmDelete(post) {
  if (confirm('¿Estás seguro de que quieres eliminar esta publicación?')) {
    try {
      await axios.delete(`/posts/${post.id}`)
      await fetchPosts()
    } catch (e) {
      alert('Error al eliminar: ' + (e.response?.data?.error || e.message))
    }
  }
}

function clearError(field) {
  if (errors[field]) delete errors[field]
}

function validateForm() {
  let isValid = true
  Object.keys(errors).forEach(key => delete errors[key])

  if (!postForm.value.title || postForm.value.title.length < 3) {
    errors.title = 'El título debe tener al menos 3 caracteres'
    isValid = false
  }

  if (!postForm.value.shortDescription || postForm.value.shortDescription.length < 5) {
    errors.shortDescription = 'La descripción debe tener al menos 5 caracteres'
    isValid = false
  }

  if (!postForm.value.content || postForm.value.content.length < 10) {
    errors.content = 'El contenido debe tener al menos 10 caracteres'
    isValid = false
  }

  if (postForm.value.mediaUrl && !postForm.value.mediaType) {
    errors.mediaType = 'Debes seleccionar un tipo de medio si proporcionas una URL'
    isValid = false
  }

  if (!postForm.value.mediaUrl && postForm.value.mediaType) {
    errors.mediaUrl = 'Debes proporcionar una URL si seleccionas un tipo de medio'
    isValid = false
  }

  return isValid
}

// NOTE: Moved logic to utils/helpers.js but kept here if local usage was preferred. 
// Now importing from helpers, so this local function is removed to avoid conflicts/duplication.
/* 
function getProcessedMediaUrl(url) {
 ...
} 
*/

async function savePost() {
  if (!validateForm()) return

  try {
    const payload = { ...postForm.value }
    if (!payload.mediaUrl) payload.mediaUrl = undefined
    if (!payload.mediaType) payload.mediaType = undefined
    if (!payload.minPlanId) payload.minPlanId = undefined
    
    // Remove id from payload for create/update body
    const id = payload.id
    delete payload.id

    if (isEditing.value) {
      await axios.put(`/posts/${id}`, payload)
    } else {
      await axios.post('/posts', payload)
    }
    
    closeModal()
    await fetchPosts()
  } catch (e) {
    alert('Error al guardar: ' + (e.response?.data?.error || e.message))
  }
}
</script>

<style scoped>
.z-index-10 {
  z-index: 10;
}
</style>
