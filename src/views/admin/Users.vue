<template>
  <div class="container py-5">
    <!-- Header Section -->
    <div class="d-flex flex-column flex-md-row justify-content-between align-items-center mb-5 gap-3">
      <div>
        <h2 class="display-6 fw-bold text-dark mb-1">Gestión de Usuarios</h2>
        <p class="text-muted mb-0">Administra accesos, roles y membresías</p>
      </div>
      <div class="d-flex gap-3 w-100 w-md-auto">
        <div class="input-group shadow-sm">
          <span class="input-group-text bg-white border-end-0"><i class="bi bi-search text-muted"></i></span>
          <input v-model="search" type="text" class="form-control border-start-0 ps-0" placeholder="Buscar por nombre o email...">
        </div>
        <button class="btn btn-primary shadow-sm text-nowrap" @click="openCreateModal">
          <i class="bi bi-person-plus-fill me-2"></i>Nuevo Usuario
        </button>
      </div>
    </div>

    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Cargando...</span>
      </div>
    </div>

    <!-- Users Table Card -->
    <div v-else class="card border-0 shadow-lg overflow-hidden">
      <div class="table-responsive">
        <table class="table table-hover mb-0 align-middle">
          <thead class="bg-light text-uppercase small fw-bold text-muted">
            <tr>
              <th class="ps-4 py-3">Usuario</th>
              <th class="py-3">Rol</th>
              <th class="py-3">Membresía</th>
              <th class="py-3 text-center">Pagos</th>
              <th class="py-3">Registro</th>
              <th class="pe-4 py-3 text-end">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in filteredUsers" :key="user.id" class="border-bottom-0">
              <td class="ps-4 py-3">
                <div class="d-flex align-items-center">
                  <div class="avatar rounded-circle bg-primary text-white d-flex justify-content-center align-items-center me-3 shadow-sm">
                    {{ user.name.charAt(0).toUpperCase() }}
                  </div>
                  <div>
                    <div class="fw-bold text-dark">{{ user.name }}</div>
                    <div class="text-muted small">{{ user.email }}</div>
                  </div>
                </div>
              </td>
              <td>
                <span class="badge rounded-pill" :class="getRoleBadge(user.role?.name)">
                  {{ user.role?.name || 'Sin Rol' }}
                </span>
              </td>
              <td>
                <span class="badge rounded-pill" :class="getPlanBadge(user.membershipPlan?.id)">
                  {{ user.membershipPlan?.name || 'Gratuito' }}
                </span>
              </td>
              <td class="text-center">
                <span class="badge bg-light text-dark border">
                  {{ user._count?.payments || 0 }}
                </span>
              </td>
              <td class="text-muted small">
                {{ new Date(user.createdAt).toLocaleDateString() }}
              </td>
              <td class="pe-4 text-end">
                <div class="btn-group shadow-sm rounded">
                  <button class="btn btn-sm btn-light" @click="editUser(user)" title="Editar">
                    <i class="bi bi-pencil-fill text-primary"></i>
                  </button>
                  <button class="btn btn-sm btn-light" @click="confirmDelete(user)" title="Eliminar">
                    <i class="bi bi-trash-fill text-danger"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <div v-if="showModal" class="modal d-block" style="background: rgba(0,0,0,0.5); backdrop-filter: blur(2px);">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow-lg">
          <div class="modal-header bg-dark text-white" style="background-color: var(--primary-color) !important;">
            <h5 class="modal-title fw-bold text-white">
              <i class="bi" :class="isEditing ? 'bi-pencil-square' : 'bi-person-plus-fill'"></i>
              {{ isEditing ? 'Editar Usuario' : 'Nuevo Usuario' }}
            </h5>
            <button type="button" class="btn-close btn-close-white" @click="closeModal"></button>
          </div>
          <div class="modal-body p-4">
            <form @submit.prevent="saveUser">
              <div class="mb-3">
                <label class="form-label text-muted small fw-bold text-uppercase">Nombre Completo</label>
                <input v-model="form.name" class="form-control" required placeholder="Ej. Juan Pérez">
              </div>
              
              <div class="mb-3" v-if="!isEditing">
                <label class="form-label text-muted small fw-bold text-uppercase">Correo Electrónico</label>
                <input v-model="form.email" type="email" class="form-control" required placeholder="nombre@ejemplo.com">
              </div>

              <div class="mb-3">
                <label class="form-label text-muted small fw-bold text-uppercase">
                  {{ isEditing ? 'Nueva Contraseña (Opcional)' : 'Contraseña' }}
                </label>
                <input v-model="form.password" type="password" class="form-control" :required="!isEditing" placeholder="••••••••">
                <small v-if="isEditing" class="text-muted">Dejar en blanco para mantener la actual.</small>
              </div>

              <div class="row">
                <div class="col-md-6 mb-3">
                  <label class="form-label text-muted small fw-bold text-uppercase">Rol</label>
                  <select v-model="form.roleId" class="form-select">
                    <option value="" disabled>Seleccionar Rol</option>
                    <option v-for="role in roles" :key="role.id" :value="role.id">
                      {{ role.name.charAt(0).toUpperCase() + role.name.slice(1) }}
                    </option>
                  </select>
                </div>
                <div class="col-md-6 mb-3">
                  <label class="form-label text-muted small fw-bold text-uppercase">Membresía</label>
                  <select v-model="form.membershipPlanId" class="form-select">
                    <option value="">Gratuito</option>
                    <option v-for="plan in plans" :key="plan.id" :value="plan.id">
                      {{ plan.name }}
                    </option>
                  </select>
                </div>
              </div>

              <div class="d-flex justify-content-end gap-2 mt-4">
                <button type="button" class="btn btn-light" @click="closeModal">Cancelar</button>
                <button type="submit" class="btn btn-primary px-4">
                  {{ isEditing ? 'Guardar Cambios' : 'Crear Usuario' }}
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
import { ref, onMounted, computed } from 'vue'
import axios from 'axios'

const users = ref([])
const plans = ref([])
const roles = ref([])
const loading = ref(true)
const search = ref('')
const showModal = ref(false)
const isEditing = ref(false)

const form = ref({
  id: null,
  name: '',
  email: '',
  password: '',
  roleId: '',
  membershipPlanId: ''
})

onMounted(async () => {
  await Promise.all([fetchUsers(), fetchPlans(), fetchRoles()])
})

async function fetchUsers() {
  loading.value = true
  try {
    const { data } = await axios.get('/users')
    users.value = data
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

async function fetchPlans() {
  try {
    const { data } = await axios.get('/memberships/plans')
    plans.value = data
    if (!plans.value.find(p => p.id === 'lifetime')) {
      plans.value.push({ id: 'lifetime', name: 'Membresía Vitalicia (Admin)' })
    }
  } catch (e) { console.error(e) }
}

async function fetchRoles() {
  try {
    const { data } = await axios.get('/users/roles')
    console.log('Roles loaded:', data) // Debug
    if (Array.isArray(data)) {
      roles.value = data
    } else {
      console.error('Roles response is not an array:', data)
    }
  } catch (e) { 
    console.error('Error loading roles:', e)
    // Fallback if API fails (temporary fix to ensure UI works)
    // Using hardcoded UUIDs from known seed/check_roles.js to ensure matches work even if API call fails
    roles.value = [
      { id: 'cfe5ac5d-6f42-464a-89e5-8e11fff58a7c', name: 'Client' },
      { id: 'a9abac90-1ec8-453a-855a-5fe4865648c3', name: 'Advisor' },
      { id: '2421938f-5930-45e7-920a-48b9954c8b7d', name: 'Admin' }
    ]
  }
}

const filteredUsers = computed(() => {
  if (!search.value) return users.value
  const s = search.value.toLowerCase()
  return users.value.filter(u => 
    u.name.toLowerCase().includes(s) || 
    u.email.toLowerCase().includes(s)
  )
})

function getRoleBadge(roleName) {
  switch(roleName) {
    case 'admin': return 'bg-danger text-white'
    case 'advisor': return 'bg-warning text-dark'
    case 'client': return 'bg-info text-white'
    default: return 'bg-secondary text-white'
  }
}

function getPlanBadge(planId) {
  switch(planId) {
    case 'lifetime': return 'bg-dark text-warning border border-warning'
    case 'enterprise': return 'bg-primary text-white'
    case 'pro': return 'bg-success text-white'
    case 'basic': return 'bg-secondary text-white'
    default: return 'bg-light text-muted border'
  }
}

function openCreateModal() {
  isEditing.value = false
  // Default to 'client' role if available, otherwise first role
  const clientRole = roles.value.find(r => r.name === 'client')
  
  form.value = {
    id: null,
    name: '',
    email: '',
    password: '',
    roleId: clientRole ? clientRole.id : (roles.value[0]?.id || ''),
    membershipPlanId: ''
  }
  showModal.value = true
}

function editUser(user) {
  isEditing.value = true
  form.value = {
    id: user.id,
    name: user.name,
    email: user.email, // Email usually read-only in edit for simplicity, but displayed
    password: '',
    roleId: user.role?.id || user.roleId || '',
    membershipPlanId: user.membershipPlanId || ''
  }
  showModal.value = true
}

function closeModal() {
  showModal.value = false
}

async function saveUser() {
  try {
    if (isEditing.value) {
      await axios.put(`/users/${form.value.id}`, {
        name: form.value.name,
        roleId: form.value.roleId,
        membershipPlanId: form.value.membershipPlanId,
        password: form.value.password || undefined // Only send if set
      })
    } else {
      await axios.post('/users', {
        name: form.value.name,
        email: form.value.email,
        password: form.value.password,
        roleId: form.value.roleId,
        membershipPlanId: form.value.membershipPlanId
      })
    }
    
    closeModal()
    await fetchUsers()
  } catch (e) {
    alert('Error: ' + (e.response?.data?.error || e.message))
  }
}

async function confirmDelete(user) {
  if (confirm(`¿Eliminar usuario ${user.name}? Esta acción no se puede deshacer.`)) {
    try {
      await axios.delete(`/users/${user.id}`)
      await fetchUsers()
    } catch (e) {
      alert('Error: ' + e.message)
    }
  }
}
</script>

<style scoped>
.avatar {
  width: 45px; 
  height: 45px; 
  font-size: 1.2rem;
  background-color: var(--secondary-color) !important;
}

.card {
  border-radius: 12px;
}

/* Custom Scrollbar for table */
.table-responsive::-webkit-scrollbar {
  height: 8px;
}
.table-responsive::-webkit-scrollbar-track {
  background: #f1f1f1; 
}
.table-responsive::-webkit-scrollbar-thumb {
  background: #cbd5e1; 
  border-radius: 4px;
}
.table-responsive::-webkit-scrollbar-thumb:hover {
  background: #94a3b8; 
}
</style>
