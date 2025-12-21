<template>
  <div class="container py-5">
    <div class="row justify-content-center">
      <div class="col-md-6 col-lg-5">
        <div class="card border-0 shadow-lg">
          <div class="card-body p-5">
            <div class="text-center mb-4">
              <h2 class="h3 mb-3 font-playfair">Recuperar Contraseña</h2>
              <p class="text-muted small">
                Ingrese su correo electrónico y le enviaremos instrucciones para restablecer su contraseña.
              </p>
            </div>

            <form @submit.prevent="submit">
              <div class="mb-4">
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

              <!-- Recaptcha Enterprise -->
              <div class="mb-4">
                <button 
                  ref="recaptchaBtn"
                  class="g-recaptcha btn btn-outline-secondary w-100 d-none" 
                  :data-sitekey="siteKey" 
                  data-callback="onRecaptchaSubmitForgot" 
                  data-action="submit"
                >
                  Verificar
                </button>
                <div class="d-flex align-items-center p-3 border rounded bg-light">
                  <div class="small text-muted flex-grow-1">
                    Protegido por reCAPTCHA Enterprise
                  </div>
                  <img src="https://www.gstatic.com/recaptcha/api2/logo_48.png" alt="reCAPTCHA" style="height: 24px; opacity: 0.7;">
                </div>
              </div>

              <button class="btn btn-primary w-100 mb-4 py-2" :disabled="loading">
                <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Enviar Instrucciones
              </button>

              <div class="text-center">
                <router-link to="/login" class="text-decoration-none small text-muted">
                  <i class="bi bi-arrow-left me-1"></i> Volver a Ingresar
                </router-link>
              </div>
            </form>

            <div v-if="message" class="alert alert-success mt-4 mb-0 small text-center" role="alert">
              <i class="bi bi-check-circle me-2"></i> {{ message }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import axios from 'axios'

const email = ref('')
const loading = ref(false)
const message = ref('')
const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY

onMounted(() => {
  window.onRecaptchaSubmitForgot = async (token) => {
    await performSubmit(token)
  }
})

onUnmounted(() => {
  window.onRecaptchaSubmitForgot = null
})

async function submit() {
  loading.value = true
  message.value = ''
  
  if (window.grecaptcha && window.grecaptcha.enterprise) {
    window.grecaptcha.enterprise.execute(siteKey, { action: 'submit' }).then(token => {
      performSubmit(token)
    })
  } else {
    console.warn('Recaptcha not loaded')
    await performSubmit(null)
  }
}

async function performSubmit(token) {
  try {
    await axios.post('/auth/forgot', { email: email.value, recaptchaToken: token })
    message.value = 'Si el correo existe en nuestro sistema, recibirá un enlace de recuperación en breve.'
    email.value = ''
  } catch (e) {
    message.value = 'No se pudo enviar el correo de recuperación en este momento.'
  } finally {
    loading.value = false
  }
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
