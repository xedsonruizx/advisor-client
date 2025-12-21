<template>
  <div class="container py-5">
    <div class="row justify-content-center">
      <div class="col-md-6 col-lg-5">
        <div class="card border-0 shadow-lg">
          <div class="card-body p-5">
            <div class="text-center mb-4">
              <h2 class="h3 mb-3 font-playfair">Restablecer Contraseña</h2>
              <p class="text-muted small">
                Ingresa tu nueva contraseña para completar el proceso.
              </p>
            </div>
            <form @submit.prevent="submit">
              <div class="mb-4">
                <label for="password" class="form-label text-muted small text-uppercase fw-bold">Nueva contraseña</label>
                <div class="input-group">
                  <span class="input-group-text bg-light border-end-0">
                    <i class="bi bi-shield-lock text-muted"></i>
                  </span>
                  <input
                    id="password"
                    v-model="password"
                    class="form-control bg-light border-start-0 ps-0"
                    type="password"
                  placeholder="Mínimo 8 caracteres"
                  required
                />
                </div>
              </div>
              <div class="mb-4">
                <label for="confirm" class="form-label text-muted small text-uppercase fw-bold">Confirmar contraseña</label>
                <div class="input-group">
                  <span class="input-group-text bg-light border-end-0">
                    <i class="bi bi-check2 text-muted"></i>
                  </span>
                  <input
                    id="confirm"
                    v-model="confirm"
                    class="form-control bg-light border-start-0 ps-0"
                    type="password"
                    placeholder="Repite tu contraseña"
                    required
                  />
                </div>
              </div>
              <div v-if="error" class="alert alert-danger small" role="alert">
                <i class="bi bi-exclamation-triangle me-2"></i> {{ error }}
              </div>
              <button class="btn btn-primary w-100 mb-4 py-2" :disabled="loading">
                <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Restablecer Contraseña
              </button>
              <div class="text-center">
                <router-link to="/login" class="text-decoration-none small text-muted">
                  <i class="bi bi-arrow-left me-1"></i> Volver a Ingresar
                </router-link>
              </div>
            </form>
            <div v-if="success" class="alert alert-success mt-4 mb-0 small text-center" role="alert">
              <i class="bi bi-check-circle me-2"></i> Contraseña actualizada correctamente. Ya puedes ingresar.
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'

const route = useRoute()
const router = useRouter()
const token = ref('')
const password = ref('')
const confirm = ref('')
const loading = ref(false)
const success = ref(false)
const error = ref('')

onMounted(() => {
  token.value = route.query.token || ''
})

async function submit() {
  error.value = ''
  success.value = false
  if (!token.value) {
    error.value = 'Enlace inválido o expirado.'
    return
  }
  if (!password.value || password.value.length < 8) {
    error.value = 'La contraseña debe tener al menos 8 caracteres.'
    return
  }
  if (password.value !== confirm.value) {
    error.value = 'Las contraseñas no coinciden.'
    return
  }
  loading.value = true
  try {
    const { data } = await axios.post('/auth/reset', { token: String(token.value).trim(), password: String(password.value).trim() })
    if (data && data.ok) {
      success.value = true
      password.value = ''
      confirm.value = ''
      setTimeout(() => router.push('/login'), 2000)
    } else {
      const code = data?.error
      if (code === 'token_expired') error.value = 'El enlace expiró. Solicita uno nuevo.'
      else if (code === 'invalid_token') error.value = 'El enlace no es válido.'
      else if (code === 'password_too_short') error.value = 'La contraseña debe tener al menos 8 caracteres.'
      else if (code === 'invalid_input') error.value = 'El enlace no es válido.'
      else error.value = 'No se pudo actualizar la contraseña.'
    }
  } catch (e) {
    const code = e?.response?.data?.error
    if (code === 'token_expired') error.value = 'El enlace expiró. Solicita uno nuevo.'
    else if (code === 'invalid_token') error.value = 'El enlace no es válido.'
    else if (code === 'password_too_short') error.value = 'La contraseña debe tener al menos 8 caracteres.'
    else if (code === 'invalid_input') error.value = 'El enlace no es válido.'
    else error.value = 'No se pudo actualizar la contraseña.'
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
