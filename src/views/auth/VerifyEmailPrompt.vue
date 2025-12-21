<template>
  <div class="container py-5">
    <div class="row justify-content-center">
      <div class="col-md-6 col-lg-5">
        <div class="card border-0 shadow-lg text-center">
          <div class="card-body p-5">
            <div class="mb-4 text-warning">
              <i class="bi bi-envelope-exclamation display-1"></i>
            </div>
            
            <h2 class="h3 mb-3 font-playfair">Verifique su correo</h2>
            
            <p class="text-muted mb-4">
              Hemos enviado un enlace de confirmación a su dirección de correo electrónico. 
              Para acceder a todas las funcionalidades de Elite Advisors, es necesario que verifique su cuenta.
            </p>

            <div class="alert alert-light border small text-muted mb-4">
              ¿No recibió el correo? Revise su carpeta de spam o promociones.
            </div>

            <div class="d-grid gap-2">
              <button 
                @click="resendEmail" 
                class="btn btn-primary" 
                :disabled="resendLoading || cooldown > 0"
              >
                <span v-if="resendLoading" class="spinner-border spinner-border-sm me-2"></span>
                <span v-else-if="cooldown > 0">Reenviar en {{ cooldown }}s</span>
                <span v-else>Reenviar correo de verificación</span>
              </button>
              
              <div v-if="resendMessage" class="alert mt-2 mb-0 small" :class="resendError ? 'alert-danger' : 'alert-success'">
                {{ resendMessage }}
              </div>

              <button @click="logout" class="btn btn-outline-secondary mt-2">
                <i class="bi bi-box-arrow-left me-2"></i>Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '../../stores/auth'
import { useRouter } from 'vue-router'
import axios from 'axios'

const auth = useAuthStore()
const router = useRouter()

const resendLoading = ref(false)
const resendMessage = ref('')
const resendError = ref(false)
const cooldown = ref(0)

async function resendEmail() {
  if (cooldown.value > 0) return
  
  resendLoading.value = true
  resendMessage.value = ''
  resendError.value = false
  
  try {
    await axios.post('/auth/verify-resend')
    resendMessage.value = 'Correo enviado correctamente. Revise su bandeja.'
    startCooldown()
  } catch (e) {
    resendError.value = true
    if (e.response?.status === 400 && e.response?.data?.error === 'already_verified') {
      resendMessage.value = 'Su cuenta ya está verificada. Intente recargar la página.'
    } else {
      resendMessage.value = 'Error al enviar el correo. Intente más tarde.'
    }
  } finally {
    resendLoading.value = false
  }
}

function startCooldown() {
  cooldown.value = 60
  const interval = setInterval(() => {
    cooldown.value--
    if (cooldown.value <= 0) clearInterval(interval)
  }, 1000)
}

async function logout() {
  await auth.logout()
  router.push('/login')
}
</script>

<style scoped>
.font-playfair {
  font-family: 'Playfair Display', serif;
  font-weight: 700;
}
</style>