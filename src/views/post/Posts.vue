<template>
  <div class="container py-4">
    <PageHeader title="Avisos y Noticias">
      <template #actions>
        <button v-if="canCreate" class="btn btn-primary" @click="openCreateModal">
          <i class="bi bi-plus-lg me-2"></i>Nuevo Aviso
        </button>
      </template>
    </PageHeader>

    <!-- Posts List -->
    <LoadingSpinner v-if="loading" />
    
    <EmptyState 
      v-else-if="posts.length === 0" 
      message="No hay publicaciones disponibles." 
    />

    <div v-else class="row g-4">
      <div v-for="post in posts" :key="post.id" class="col-12 col-md-6 col-lg-4 d-flex align-items-stretch">
        <PostCard 
          :post="post" 
          :can-create="canCreate" 
          :is-authenticated="auth.isAuthenticated"
          @edit="editPost" 
          @delete="openDeleteModal" 
        />
      </div>
    </div>

    <!-- Create/Edit Post Modal -->
    <BaseModal 
      :show="showModal" 
      :title="isEditing ? 'Editar Aviso' : 'Crear Nuevo Aviso'" 
      size="lg"
      @close="closeModal"
    >
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
          <div style="height: 300px; margin-bottom: 50px;">
            <QuillEditor 
              v-model:content="postForm.content" 
              contentType="html" 
              theme="snow"
              toolbar="full"
            />
          </div>
          <div class="invalid-feedback d-block" v-if="errors.content">{{ errors.content }}</div>
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
    </BaseModal>

    <!-- Delete Modal -->
    <DeleteModal
      :show="showDeleteModal"
      :title="'Eliminar Aviso'"
      :message="deleteMessage"
      :loading="deleting"
      @close="showDeleteModal = false"
      @confirm="deletePost"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, computed, reactive } from 'vue'
import axios from 'axios'
import { useAuthStore } from '../../stores/auth'
import PageHeader from '../../components/global/PageHeader.vue'
import LoadingSpinner from '../../components/global/LoadingSpinner.vue'
import EmptyState from '../../components/global/EmptyState.vue'
import BaseModal from '../../components/global/BaseModal.vue'
import PostCard from '../../components/posts/PostCard.vue'
import DeleteModal from '../../components/global/DeleteModal.vue'
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css';

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

// Delete Modal State
const showDeleteModal = ref(false)
const deleting = ref(false)
const postToDelete = ref(null)

const deleteMessage = computed(() => {
  if (!postToDelete.value) return ''
  return `¿Estás seguro de que quieres eliminar la publicación "${postToDelete.value.title}"?`
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
    content: post.content, 
    mediaUrl: post.mediaUrl || '',
    mediaType: post.mediaType || '',
    minPlanId: post.minPlanId || '' 
  }
  
  if (post.isLocked) {
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

function openDeleteModal(post) {
  postToDelete.value = post
  showDeleteModal.value = true
}

async function deletePost() {
  if (!postToDelete.value) return

  deleting.value = true
  try {
    await axios.delete(`/posts/${postToDelete.value.id}`)
    await fetchPosts()
    showDeleteModal.value = false
    postToDelete.value = null
  } catch (e) {
    alert('Error al eliminar: ' + (e.response?.data?.error || e.message))
  } finally {
    deleting.value = false
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

async function savePost() {
  if (!validateForm()) return

  try {
    const payload = { ...postForm.value }
    if (!payload.mediaUrl) payload.mediaUrl = undefined
    if (!payload.mediaType) payload.mediaType = undefined
    if (!payload.minPlanId) payload.minPlanId = undefined
    
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