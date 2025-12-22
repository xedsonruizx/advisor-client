<template>
  <div class="d-flex flex-column min-vh-100">
    <nav class="navbar navbar-expand-lg navbar-dark navbar-custom sticky-top">
      <div class="container">
        <a class="navbar-brand" href="#">
          <i class="bi bi-shield-check me-2"></i>{{ appTitle }}	
        </a>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#nav" aria-controls="nav" aria-expanded="false" aria-label="Toggle navigation">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="nav">
          <ul class="navbar-nav ms-auto mb-2 mb-lg-0 align-items-center">
            <li class="nav-item"><router-link class="nav-link" to="/">Inicio</router-link></li>
            <li class="nav-item"><router-link class="nav-link" to="/memberships">Membresías</router-link></li>
            <li class="nav-item"><router-link class="nav-link" to="/docs">Biblioteca</router-link></li>
            <li class="nav-item"><router-link class="nav-link" to="/posts">Avisos</router-link></li>
            <li class="nav-item"><router-link class="nav-link" to="/faq">Preguntas</router-link></li>
            
            <li v-if="!user" class="nav-item ms-lg-3"><router-link class="btn btn-outline-primary btn-sm px-4" to="/login">Ingresar</router-link></li>
            <li v-if="!user" class="nav-item ms-2"><router-link class="btn btn-primary btn-sm px-4" to="/register">Registrarse</router-link></li>
            
            <li v-if="user" class="nav-item dropdown ms-lg-3">
              <a class="nav-link dropdown-toggle d-flex align-items-center" href="#" id="userDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                <div class="rounded-circle bg-secondary text-white d-flex justify-content-center align-items-center me-2" style="width: 32px; height: 32px; font-size: 0.9rem;">
                  {{ user.name.charAt(0).toUpperCase() }}
                </div>
                <span>{{ user.name }}</span>
              </a>
              <ul class="dropdown-menu dropdown-menu-end shadow-sm border-0" aria-labelledby="userDropdown">
                <li><router-link class="dropdown-item" to="/dashboard">Mi Panel</router-link></li>
                <li v-if="isAdmin"><router-link class="dropdown-item" to="/admin/users">Usuarios</router-link></li>
                <li v-if="isAdmin"><router-link class="dropdown-item" to="/admin/evaluations">Evaluaciones</router-link></li>
                <li><router-link class="dropdown-item" to="/profile">Perfil</router-link></li>
                <li><hr class="dropdown-divider"></li>
                <li><button class="dropdown-item text-danger" @click="logout">Cerrar Sesión</button></li>
              </ul>
            </li>
          </ul>
        </div>
      </div>
    </nav>

    <main class="flex-grow-1">
      <router-view />
    </main>

    <WhatsAppButton />

    <footer class="footer">
      <div class="container">
        <div class="row">
          <div class="col-md-4 mb-4">
            <h5>{{ appTitle }}</h5>
            <p class="small text-muted">Asesoría legal de primer nivel al alcance de su mano. Protegemos sus intereses con profesionalismo y excelencia.</p>
          </div>
          <div class="col-md-2 mb-4">
            <h5>Enlaces</h5>
            <ul class="list-unstyled">
              <li><router-link to="/">Inicio</router-link></li>
              <li><router-link to="/memberships">Planes</router-link></li>
              <li><router-link to="/faq">Preguntas</router-link></li>
              <li><router-link to="/login">Ingresar</router-link></li>
            </ul>
          </div>
          <div class="col-md-2 mb-4">
            <h5>Legal</h5>
            <ul class="list-unstyled">
              <li><a href="#">Términos</a></li>
              <li><a href="#">Privacidad</a></li>
            </ul>
          </div>
          <div class="col-md-4 mb-4">
            <h5>Contacto</h5>
            <p class="small text-muted">
              Av. Reforma 222, CDMX<br>
              contacto@eliteadvisors.com<br>
              +52 55 1234 5678
            </p>
          </div>
        </div>
        <div class="border-top border-secondary pt-4 mt-4 text-center small text-muted">
          &copy; {{ new Date().getFullYear() }} {{ appTitle }}. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { useAuthStore } from './stores/auth'
import { computed, onMounted } from 'vue'
import router from './router.js'
import WhatsAppButton from './components/global/WhatsAppButton.vue'

const auth = useAuthStore()
const user = computed(() => auth.user)
const isAdmin = computed(() => user.value?.role === 'admin')
const appTitle = import.meta.env.VITE_APP_TITLE
 
async function logout() { 
  await auth.logout()
  router.push('/')
}
onMounted(() => auth.fetchMe())
</script>
