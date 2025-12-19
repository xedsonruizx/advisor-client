<template>
  <div class="container py-5">
    <div class="text-center mb-5">
      <h2 class="display-5 mb-3">Nuestros Planes de Membresía</h2>
      <p class="lead text-muted mx-auto" style="max-width: 600px;">
        Elija el plan que mejor se adapte a sus necesidades legales. Sin costos ocultos, cancele cuando quiera.
      </p>
    </div>

    <div class="row justify-content-center g-4">
      <div v-for="p in plans" :key="p.id" class="col-12 col-md-6 col-lg-4">
        <div class="card h-100 pricing-card border-0">
          <div class="card-header text-center pt-4 pb-3">
            <h3 class="card-title h4 mb-0">{{ p.name }}</h3>
          </div>
          <div class="card-body d-flex flex-column">
            <div class="text-center mb-4">
              <span class="display-4 fw-bold">\${{ new Intl.NumberFormat('es-CL').format(p.price) }}</span>
              <span class="text-muted">/mes</span>
            </div>
            
            <ul class="list-unstyled mb-4 flex-grow-1">
              <li class="mb-3 d-flex align-items-start">
                <i class="bi bi-check2 text-primary me-2 mt-1"></i>
                <span>Asesoría legal ilimitada vía chat</span>
              </li>
              <li class="mb-3 d-flex align-items-start">
                <i class="bi bi-check2 text-primary me-2 mt-1"></i>
                <span>Revisión de contratos (hasta 3/mes)</span>
              </li>
              <li class="mb-3 d-flex align-items-start">
                <i class="bi bi-check2 text-primary me-2 mt-1"></i>
                <span>Acceso a biblioteca de documentos legales</span>
              </li>
              <li v-if="p.price > 2000" class="mb-3 d-flex align-items-start">
                <i class="bi bi-check2 text-primary me-2 mt-1"></i>
                <span>Representación en juzgados civiles</span>
              </li>
            </ul>

            <button class="btn btn-primary w-100 py-2" @click="purchase(p.id)" :disabled="!isLogged">
              {{ isLogged ? 'Seleccionar Plan' : 'Ingresar para Comprar' }}
            </button>
            <p v-if="!isLogged" class="mt-2 text-center text-muted small">
              <router-link to="/login">Inicia sesión</router-link> o <router-link to="/register">regístrate</router-link>
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import { useAuthStore } from '../stores/auth'

const auth = useAuthStore()
const isLogged = computed(() => !!auth.user)
const plans = ref([])

onMounted(async () => {
  try {
    const { data } = await axios.get('/memberships/plans')
    plans.value = data
  } catch (e) {
    console.error("Error cargando planes", e)
    // Datos dummy por si el backend falla o está vacío para visualizar el diseño
    if (plans.value.length === 0) {
      plans.value = [
        { id: 'price_basic', name: 'Básico', price: 25000, currency: 'clp' },
        { id: 'price_pro', name: 'Profesional', price: 55000, currency: 'clp' },
        { id: 'price_elite', name: 'Elite', price: 120000, currency: 'clp' }
      ]
    }
  }
})

async function purchase(planId) {
  if (!isLogged.value) return
  try {
    const { data } = await axios.post('/memberships/purchase', { planId })
    if (data.checkoutUrl) location.href = data.checkoutUrl
  } catch (error) {
    console.error(error)
    alert("Error al iniciar compra")
  }
}
</script>

<style scoped>
.pricing-card {
  transition: all 0.3s ease;
  box-shadow: 0 10px 30px rgba(0,0,0,0.05);
}

.pricing-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 20px 40px rgba(0,0,0,0.1);
  border-color: var(--secondary-color);
}

.card-header {
  background-color: transparent;
  border-bottom: 1px solid rgba(0,0,0,0.05);
}
</style>
