<template>
  <div class="container py-5">
    <PageHeader 
      title="Mi Perfil" 
      subtitle="Actualiza tus datos personales y credenciales"
    />
    
    <div class="row justify-content-center">
      <div class="col-lg-8">
        <div v-if="globalError" class="alert alert-danger mb-3">
          {{ globalError }}
        </div>
        <div v-if="successMsg" class="alert alert-success mb-3">
          {{ successMsg }}
        </div>
        
        <div class="card border-0 shadow-sm">
          <div class="card-body p-4">
            <form @submit.prevent="submit" novalidate>
              <div class="mb-3">
                <label class="form-label text-muted small fw-bold text-uppercase">Nombre</label>
                <input 
                  v-model="form.name" 
                  class="form-control" 
                  :class="{ 'is-invalid': errors.name }"
                  required 
                  placeholder="Tu nombre"
                  @input="clearError('name')"
                />
                <div class="invalid-feedback">{{ errors.name }}</div>
              </div>
              
              <div class="mb-3">
                <label class="form-label text-muted small fw-bold text-uppercase">Email</label>
                <input 
                  v-model="form.email" 
                  type="email"
                  class="form-control" 
                  :class="{ 'is-invalid': errors.email }"
                  required 
                  placeholder="tu@correo.com"
                  @input="clearError('email')"
                />
                <div class="invalid-feedback">{{ errors.email }}</div>
              </div>
              
              <div class="form-check form-switch mb-3">
                <input class="form-check-input" type="checkbox" id="changePassword" v-model="changePassword">
                <label class="form-check-label" for="changePassword">Cambiar contraseña</label>
              </div>
              
              <div v-if="changePassword">
                <div class="mb-3">
                  <label class="form-label text-muted small fw-bold text-uppercase">Contraseña actual</label>
                  <input 
                    v-model="form.currentPassword"
                    type="password"
                    class="form-control"
                    :class="{ 'is-invalid': errors.currentPassword }"
                    placeholder="Ingresa tu contraseña actual"
                    @input="clearError('currentPassword')"
                  />
                  <div class="invalid-feedback">{{ errors.currentPassword }}</div>
                </div>
                
                <div class="mb-3">
                  <label class="form-label text-muted small fw-bold text-uppercase">Nueva contraseña</label>
                  <input 
                    v-model="form.password"
                    type="password"
                    class="form-control"
                    :class="{ 'is-invalid': errors.password }"
                    placeholder="Mínimo 8 caracteres"
                    @input="clearError('password')"
                  />
                  <div class="invalid-feedback">{{ errors.password }}</div>
                  <small class="text-muted">Usa una frase larga y única.</small>
                </div>
              </div>
              
              <div class="d-flex justify-content-end gap-2 mt-3">
                <router-link to="/dashboard" class="btn btn-light">Cancelar</router-link>
                <button type="submit" class="btn btn-primary" :disabled="loading">
                  <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useAuthStore } from '../../stores/auth'
import PageHeader from '../../components/global/PageHeader.vue'

const auth = useAuthStore()
const loading = ref(false)
const globalError = ref('')
const successMsg = ref('')
const errors = ref({})
const changePassword = ref(false)

const form = ref({
  name: '',
  email: '',
  currentPassword: '',
  password: ''
})

onMounted(() => {
  if (auth.user) {
    form.value.name = auth.user.name || ''
    form.value.email = auth.user.email || ''
  }
})

function clearError(field) {
  if (errors.value[field]) delete errors.value[field]
  globalError.value = ''
}

function validate() {
  errors.value = {}
  let ok = true
  if (!form.value.name || form.value.name.trim().length < 2) {
    errors.value.name = 'El nombre debe tener al menos 2 caracteres'
    ok = false
  }
  if (!form.value.email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.value.email)) {
    errors.value.email = 'Email inválido'
    ok = false
  }
    if (changePassword.value) {
      if (!form.value.currentPassword) {
        errors.value.currentPassword = 'Ingresa tu contraseña actual'
        ok = false
      }
    if (!form.value.password || form.value.password.length < 8) {
      errors.value.password = 'La nueva contraseña debe tener mínimo 8 caracteres'
      ok = false
    }
  }
  return ok
}

async function submit() {
  if (!validate()) return
  loading.value = true
  globalError.value = ''
  successMsg.value = ''
  try {
    const payload = {
      name: form.value.name,
      email: form.value.email
    }
    if (changePassword.value) {
      payload.currentPassword = form.value.currentPassword
      payload.password = form.value.password
    }
    const { data } = await axios.put('/auth/me', payload)
    auth.user = data
    successMsg.value = 'Perfil actualizado correctamente'
    form.value.currentPassword = ''
    form.value.password = ''
    changePassword.value = false
  } catch (e) {
    const err = e.response?.data?.error
    if (err === 'email_in_use') {
      errors.value.email = 'Ese email ya está en uso'
    } else if (err === 'invalid_current_password') {
      errors.value.currentPassword = 'La contraseña actual es incorrecta'
    } else if (err === 'invalid_input') {
      if (changePassword.value && !form.value.currentPassword) {
        errors.value.currentPassword = 'Ingresa tu contraseña actual'
      }
      if (changePassword.value && (!form.value.password || form.value.password.length < 8)) {
        errors.value.password = 'La nueva contraseña debe tener mínimo 8 caracteres'
      }
      globalError.value = 'Datos inválidos, revisa los campos marcados'
    } else if (err === 'unauthorized') {
      globalError.value = 'Inicia sesión para actualizar tu perfil'
    } else if (e.response?.status === 404) {
      globalError.value = 'Servidor no disponible o ruta no encontrada'
    } else {
      globalError.value = 'No se pudo actualizar el perfil'
    }
  } finally {
    loading.value = false
  }
}
</script>
