<template>
  <div class="container py-5">
    <PageHeader title="Historial de Pagos" />
    
    <LoadingSpinner v-if="loading" />

    <div v-else class="card shadow-sm border-0">
      <div class="table-responsive">
        <table class="table table-hover mb-0">
          <thead class="bg-light">
            <tr>
              <th>ID Transacción</th>
              <th>Usuario</th>
              <th>Plan</th>
              <th>Monto</th>
              <th>Estado</th>
              <th>Fecha</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="payment in payments" :key="payment.id">
              <td class="font-monospace small">{{ payment.id.substring(0, 8) }}...</td>
              <td>
                <div class="fw-bold">{{ payment.user?.name }}</div>
                <div class="small text-muted">{{ payment.user?.email }}</div>
              </td>
              <td class="text-capitalize">{{ payment.planId || 'N/A' }}</td>
              <td class="fw-bold">
                {{ new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(payment.amount) }}
              </td>
              <td>
                <span class="badge" :class="payment.status === 'succeeded' ? 'bg-success' : 'bg-warning'">
                  {{ payment.status }}
                </span>
              </td>
              <td>{{ new Date(payment.createdAt).toLocaleString() }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import PageHeader from '../../components/global/PageHeader.vue'
import LoadingSpinner from '../../components/global/LoadingSpinner.vue'

const payments = ref([])
const loading = ref(true)

onMounted(async () => {
  try {
    const { data } = await axios.get('/payments')
    payments.value = data
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
})
</script>
