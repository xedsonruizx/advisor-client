<template>
  <div class="container py-4">
    <!-- Admin Dashboard -->
    <div v-if="user?.role === 'admin'" class="mb-5">
      <h2 class="mb-4">Panel de Administración</h2>
      
      <div class="row g-4 mb-4">
        <!-- Stats Cards -->
        <div class="col-md-4">
          <div class="card bg-primary text-white h-100 shadow-sm">
            <div class="card-body">
              <h5 class="card-title text-white-50">Usuarios Totales</h5>
              <p class="display-5 fw-bold mb-0">{{ adminStats.totalUsers }}</p>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card bg-success text-white h-100 shadow-sm">
            <div class="card-body">
              <h5 class="card-title text-white-50">Ingresos Totales</h5>
              <p class="display-5 fw-bold mb-0">{{ formatCurrency(adminStats.totalRevenue) }}</p>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card bg-info text-white h-100 shadow-sm">
            <div class="card-body">
              <h5 class="card-title text-white-50">Membresías Activas</h5>
              <p class="display-5 fw-bold mb-0">{{ adminStats.activeMemberships }}</p>
            </div>
          </div>
        </div>
      </div>

      <div class="row g-4">
        <div class="col-md-6">
          <div class="card h-100 shadow-sm">
            <div class="card-body">
              <h5 class="card-title mb-3">Gestión Rápida</h5>
              <div class="d-grid gap-2">
                <router-link to="/admin/users" class="btn btn-outline-primary">
                  <i class="bi bi-people me-2"></i>Administrar Usuarios
                </router-link>
                <router-link to="/admin/payments" class="btn btn-outline-success">
                  <i class="bi bi-cash-stack me-2"></i>Ver Pagos
                </router-link>
                <router-link to="/posts" class="btn btn-outline-dark">
                  <i class="bi bi-megaphone me-2"></i>Gestionar Avisos
                </router-link>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-6">
          <div class="card h-100 shadow-sm">
             <div class="card-body">
               <h5 class="card-title mb-3">Últimas Transacciones</h5>
               <ul class="list-group list-group-flush">
                 <li v-for="payment in recentPayments" :key="payment.id" class="list-group-item d-flex justify-content-between align-items-center px-0">
                   <div>
                     <div class="fw-bold">{{ payment.user?.name }}</div>
                     <small class="text-muted">{{ new Date(payment.createdAt).toLocaleDateString() }}</small>
                   </div>
                   <span class="badge bg-success rounded-pill">
                     {{ formatCurrency(payment.amount) }}
                   </span>
                 </li>
               </ul>
             </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Client/Advisor Dashboard -->
    <div v-else>
      <h2 class="mb-4">Mi Panel</h2>
      <div class="alert alert-warning" v-if="!user">Ingresa para ver tu estado.</div>
      <div v-else class="card shadow-sm">
        <div class="card-body">
          <div class="row align-items-center">
            <div class="col-md-8">
              <h4 class="card-title mb-1">Bienvenido, {{ user.name }}</h4>
              <p class="text-muted mb-3">{{ user.email }}</p>
              
              <div class="d-flex align-items-center mb-3">
                <span class="text-muted me-2">Membresía Actual:</span>
                <span class="badge bg-primary fs-6">{{ status?.membership?.name ?? status?.membership ?? 'Gratuito' }}</span>
              </div>
              
              <p v-if="status?.membership?.name !== 'Enterprise' && status?.membership !== 'lifetime'" class="mb-0">
                <router-link to="/memberships" class="btn btn-sm btn-outline-primary">Mejorar Plan</router-link>
              </p>
            </div>
            <div class="col-md-4 text-center">
               <div class="rounded-circle bg-light d-inline-flex align-items-center justify-content-center" style="width: 100px; height: 100px;">
                 <i class="bi bi-person display-4 text-secondary"></i>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import axios from 'axios'
import { useAuthStore } from '../../stores/auth'

const auth = useAuthStore()
const user = computed(() => auth.user)
const status = ref(null)

const adminStats = ref({
  totalUsers: 0,
  totalRevenue: 0,
  activeMemberships: 0
})
const recentPayments = ref([])

onMounted(async () => {
  // Load User Status
  try {
    const { data } = await axios.get('/memberships/status')
    // Ensure we handle object or string response properly based on previous implementation
    // Route returns { membership: 'id' } or similar. 
    // Let's refetch plans to get name if it is just ID. 
    // Actually the route returns user.membershipPlan (object) OR id. 
    // Let's check route logic: `res.json({ membership: user?.membershipPlan?.id || null })`
    // It returns ID. We want name.
    // Let's improve the route later, for now we display ID or fetch full user info.
    // Actually, let's just display ID for client view or rely on store if it has it.
    status.value = data
  } catch {}

  // Load Admin Data if Admin
  if (user.value?.role === 'admin') {
    await fetchAdminData()
  }
})

async function fetchAdminData() {
  try {
    // We can fetch users and payments to calculate stats locally for now
    // In production, create specific stats endpoint.
    const [usersRes, paymentsRes] = await Promise.all([
      axios.get('/users'),
      axios.get('/payments')
    ])
    
    const users = usersRes.data
    const payments = paymentsRes.data
    
    adminStats.value.totalUsers = users.length
    adminStats.value.activeMemberships = users.filter(u => u.membershipPlanId).length
    adminStats.value.totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0)
    
    recentPayments.value = payments.slice(0, 5)
  } catch (e) {
    console.error("Error fetching admin stats", e)
  }
}

function formatCurrency(amount) {
  return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(amount)
}
</script>
