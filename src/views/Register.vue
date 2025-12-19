<template>
  <div class="container py-5">
    <div class="row justify-content-center">
      <div class="col-md-7 col-lg-6">
        <div class="card border-0 shadow-lg">
          <div class="card-body p-5">
            <div class="text-center mb-4">
              <h2 class="h3 mb-3 font-playfair">Crear Cuenta</h2>
              <p class="text-muted small">Únase a {{ appTitle }} y proteja su futuro hoy mismo</p>
            </div>

            <form @submit.prevent="submit">
              <div class="mb-3">
                <label for="name" class="form-label text-muted small text-uppercase fw-bold">Nombre Completo</label>
                <div class="input-group">
                  <span class="input-group-text bg-light border-end-0">
                    <i class="bi bi-person text-muted"></i>
                  </span>
                  <input 
                    id="name"
                    v-model="name" 
                    class="form-control bg-light border-start-0 ps-0" 
                    type="text" 
                    placeholder="Juan Pérez" 
                    required 
                  />
                </div>
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
                <div v-if="emailError" class="text-danger small mt-1">{{ emailError }}</div>
              </div>

              <div class="row">
                <div class="col-md-6 mb-3">
                  <label for="password" class="form-label text-muted small text-uppercase fw-bold">Contraseña</label>
                  <div class="input-group">
                    <span class="input-group-text bg-light border-end-0">
                      <i class="bi bi-lock text-muted"></i>
                    </span>
                    <input 
                      id="password"
                      v-model="password" 
                      class="form-control bg-light border-start-0 ps-0" 
                      type="password" 
                      placeholder="Min. 12 caracteres" 
                      required 
                    />
                  </div>
                </div>
                <div class="col-md-6 mb-3">
                  <label for="confirmPassword" class="form-label text-muted small text-uppercase fw-bold">Confirmar</label>
                  <div class="input-group">
                    <span class="input-group-text bg-light border-end-0">
                      <i class="bi bi-lock-fill text-muted"></i>
                    </span>
                    <input 
                      id="confirmPassword"
                      v-model="confirmPassword" 
                      class="form-control bg-light border-start-0 ps-0" 
                      type="password" 
                      placeholder="Confirmar" 
                      required 
                    />
                  </div>
                </div>
              </div>

              <!-- Mock Recaptcha -->
              <div class="mb-4">
                <div class="d-flex align-items-center p-3 border rounded bg-light">
                  <div class="form-check">
                    <input class="form-check-input" type="checkbox" id="recaptcha" v-model="recaptchaVerified" required>
                    <label class="form-check-label" for="recaptcha">
                      No soy un robot
                    </label>
                  </div>
                  <img src="https://www.gstatic.com/recaptcha/api2/logo_48.png" alt="reCAPTCHA" class="ms-auto" style="height: 32px; opacity: 0.5;">
                </div>
              </div>

              <button class="btn btn-primary w-100 mb-4 py-2" :disabled="loading || !isValid">
                <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Crear Cuenta
              </button>

              <div v-if="error" class="alert alert-danger d-flex align-items-center small" role="alert">
                <i class="bi bi-exclamation-circle-fill me-2"></i>
                <div>{{ error }}</div>
              </div>
              
              <div v-if="localError" class="alert alert-danger d-flex align-items-center small" role="alert">
                <i class="bi bi-exclamation-circle-fill me-2"></i>
                <div>{{ localError }}</div>
              </div>

              <div class="text-center mt-4 pt-3 border-top">
                <p class="small text-muted mb-0">
                  ¿Ya tiene una cuenta? <router-link to="/login" class="fw-bold text-decoration-none">Ingrese aquí</router-link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const auth = useAuthStore()
const appTitle = import.meta.env.VITE_APP_TITLE
const name = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const recaptchaVerified = ref(false)
const localError = ref('')
const emailError = ref('')

const loading = computed(() => auth.loading)
const error = computed(() => auth.error)

const isValidEmail = (email) => {
  return String(email)
    .toLowerCase()
    .match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
};

watch(email, (newVal) => {
  if (newVal && !isValidEmail(newVal)) {
    emailError.value = 'Por favor ingrese un correo válido.'
  } else {
    emailError.value = ''
  }
})

const isValid = computed(() => {
  return name.value && 
         email.value && 
         password.value && 
         confirmPassword.value && 
         recaptchaVerified.value && 
         !emailError.value
})

async function submit() {
  localError.value = ''
  
  if (!isValidEmail(email.value)) {
    localError.value = 'El correo electrónico no es válido.'
    return
  }

  if (password.value !== confirmPassword.value) {
    localError.value = 'Las contraseñas no coinciden.'
    return
  }
  
  if (password.value.length < 12) {
    localError.value = 'La contraseña debe tener al menos 12 caracteres.'
    return
  }

  if (!recaptchaVerified.value) {
    localError.value = 'Por favor confirme que no es un robot.'
    return
  }

  await auth.register({ name: name.value, email: email.value, password: password.value })
}
</script>

<style scoped>
.font-playfair {
  font-family: 'Playfair Display', serif;
  font-weight: 700;
}

.form-control:focus, .input-group-text {
  border-color: var(--secondary-color);
  box-shadow: none;
}

.input-group-text {
  border-right: none;
}
</style>
