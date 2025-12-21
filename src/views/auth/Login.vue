<template>
  <AuthCard 
    title="Bienvenido" 
    subtitle="Ingrese a su cuenta para gestionar sus asesorías"
  >
    <form @submit.prevent="submit">
      <div v-if="verifySuccess" class="alert alert-success d-flex align-items-center small mb-4" role="alert">
        <i class="bi bi-check-circle-fill me-2"></i>
        <div v-if="isRedirecting">Correo verificado con éxito. Redirigiendo al inicio...</div>
        <div v-else>¡Correo verificado con éxito! Ahora puede ingresar.</div>
      </div>

      <div v-if="verifyError" class="alert alert-warning d-flex align-items-center small mb-4" role="alert">
        <i class="bi bi-exclamation-triangle-fill me-2"></i>
        <div>{{ verifyError }}</div>
      </div>

      <div class="mb-3">
        <label for="email" class="form-label text-muted small text-uppercase fw-bold">Email</label>
        <div class="input-group">
          <span class="input-group-text bg-light border-end-0">
            <i class="bi bi-envelope text-muted"></i>
          </span>
          <input 
            id="email"
            v-model="email" 
            class="form-control bg-light border-start-0 ps-0" 
            type="email" 
            placeholder="ejemplo@correo.com" 
            required 
          />
        </div>
      </div>

      <div class="mb-4">
        <div class="d-flex justify-content-between align-items-center mb-1">
          <label for="password" class="form-label text-muted small text-uppercase fw-bold mb-0">Contraseña</label>
          <router-link to="/forgot-password" class="small text-muted text-decoration-none">¿Olvidó su contraseña?</router-link>
        </div>
        <div class="input-group">
          <span class="input-group-text bg-light border-end-0">
            <i class="bi bi-lock text-muted"></i>
          </span>
          <input 
            id="password"
            v-model="password" 
            class="form-control bg-light border-start-0 border-end-0 ps-0" 
            :type="showPassword ? 'text' : 'password'" 
            placeholder="••••••••••••" 
            required 
          />
          <button class="btn btn-light border border-start-0 text-muted" type="button" @click="showPassword = !showPassword">
            <i class="bi" :class="showPassword ? 'bi-eye-slash' : 'bi-eye'"></i>
          </button>
        </div>
      </div>

      <div class="mb-4 form-check">
        <input type="checkbox" class="form-check-input" id="rememberMe" v-model="rememberMe">
        <label class="form-check-label small text-muted" for="rememberMe">Recordar usuario</label>
      </div>

      <button class="btn btn-primary w-100 mb-4 py-2" :disabled="loading">
        <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
        Ingresar
      </button>

      <div v-if="error" class="alert alert-danger d-flex align-items-center small" role="alert">
        <i class="bi bi-exclamation-circle-fill me-2"></i>
        <div>{{ error }}</div>
      </div>
    </form>

    <template #footer>
      <p class="small text-muted mb-0">
        ¿No tiene una cuenta? <router-link to="/register" class="fw-bold text-decoration-none">Regístrese aquí</router-link>
      </p>
    </template>
  </AuthCard>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import AuthCard from '../../components/auth/AuthCard.vue'

const router = useRouter()
const auth = useAuthStore()
const email = ref('')
const password = ref('')
const rememberMe = ref(false)
const showPassword = ref(false)

const loading = computed(() => auth.loading)
const error = computed(() => auth.error)

const route = useRoute()
const verifySuccess = ref(false)
const verifyError = ref('')
const isRedirecting = ref(false)

onMounted(async () => {
  if (route.query.verified === 'true') {
    verifySuccess.value = true
    // Force refresh user data to ensure emailVerified is true in store
    await auth.fetchMe()
  } else if (route.query.error) {
    if (route.query.error === 'invalid_or_expired_token') {
      verifyError.value = 'El enlace de verificación no es válido o ya ha sido utilizado.'
    } else {
      verifyError.value = 'Hubo un problema al verificar su correo.'
    }
  }

  // If already logged in (and verified), redirect to home
  if (auth.user) {
    if (auth.user.emailVerified) {
      if (verifySuccess.value) {
        // If we just verified, wait a bit so user sees the success message
        isRedirecting.value = true
        setTimeout(() => {
          router.push('/')
        }, 2000)
      } else {
        router.push('/')
      }
    }
  }
})

async function submit() {
  await auth.login({ email: email.value, password: password.value, rememberMe: rememberMe.value })
  if (!error.value) {
    router.push('/')
  }
}
</script>

<style scoped>
.form-control:focus, .input-group-text {
  border-color: var(--secondary-color);
  box-shadow: none;
}

.input-group-text {
  border-right: none;
}
</style>
