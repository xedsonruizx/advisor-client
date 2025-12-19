<template>
  <div class="card shadow-sm border-0 w-100" :class="{ 'opacity-75': post.isLocked }">
    
    <!-- Admin Controls -->
    <div v-if="canCreate" class="position-absolute top-0 end-0 p-2 z-index-10">
      <div class="btn-group shadow-sm">
        <button class="btn btn-light" @click="$emit('edit', post)" title="Editar" style="border-radius: 50% 0 0 50%;">
          <i class="bi bi-pencil-fill text-primary"></i>
        </button>
        <button class="btn btn-light" @click="$emit('delete', post)" title="Eliminar" style="border-radius: 0 50% 50% 0;">
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
      
      <div v-if="!post.isLocked" class="card-text text-dark flex-grow-1 position-relative z-index-10 ql-editor" style="font-size: 0.95rem; overflow: hidden; max-height: 200px;" v-html="post.content">
      </div>
      
      <div v-else class="mt-auto text-center pt-3 border-top position-relative z-index-10">
         <div class="alert alert-warning d-flex align-items-center justify-content-center p-2 mb-3" role="alert">
           <i class="bi bi-exclamation-triangle-fill me-2"></i>
           <small>Debes tener una suscripción activa para ver este contenido.</small>
         </div>
         <p class="small text-muted mb-2">
           Este contenido requiere el <strong>Plan {{ post.minPlan.name }}</strong> o superior.
         </p>
         <router-link v-if="!isAuthenticated" to="/login" class="btn btn-outline-primary btn-sm w-100">
           Iniciar Sesión para ver
         </router-link>
         <router-link v-else to="/dashboard" class="btn btn-outline-primary btn-sm w-100">
           Mejorar mi Plan
         </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { getProcessedMediaUrl } from '../../utils/helpers'

defineProps({
  post: {
    type: Object,
    required: true
  },
  canCreate: {
    type: Boolean,
    default: false
  },
  isAuthenticated: {
    type: Boolean,
    default: false
  }
})

defineEmits(['edit', 'delete'])
</script>

<style scoped>
.z-index-10 {
  z-index: 10;
}
</style>
