<template>
  <div class="container">
    <h2 class="mb-3">Panel</h2>
    <div class="alert alert-warning" v-if="!user">Ingresa para ver tu estado.</div>
    <div v-else class="card">
      <div class="card-body">
        <p class="mb-1">Usuario: <strong>{{ user.email }}</strong></p>
        <p class="mb-0">Membresía: <strong>{{ status?.membership ?? 'Sin membresía activa' }}</strong></p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import axios from 'axios'
import { useAuthStore } from '../stores/auth'
const auth = useAuthStore()
const user = computed(() => auth.user)
const status = ref(null)
onMounted(async () => {
  try {
    const { data } = await axios.get('/memberships/status')
    status.value = data
  } catch {}
})
</script>
