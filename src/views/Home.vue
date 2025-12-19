<script setup>
const appTitle = import.meta.env.VITE_APP_TITLE
</script>

<template>
  <div>
    <!-- Hero Section -->
    <section class="hero-section text-center text-white d-flex align-items-center">
      <div class="container position-relative z-1">
        <h1 class="display-3 mb-4 fw-bold">Excelencia Legal a su Servicio</h1>
        <p class="lead mb-5 mx-auto" style="max-width: 700px;">
          Acceda a asesoría jurídica de primer nivel, diseñada para proteger su patrimonio y garantizar su tranquilidad.
        </p>
        <div class="d-flex justify-content-center gap-3">
          <router-link to="/memberships" class="btn btn-primary btn-lg px-5">Ver Planes</router-link>
          <router-link to="/register" class="btn btn-outline-light btn-lg px-5">Registrarse</router-link>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="py-5">
      <div class="container py-5">
        <div class="row text-center g-4">
          <div class="col-md-4">
            <div class="p-4 h-100">
              <div class="icon-box mb-4 text-primary">
                <i class="bi bi-shield-check display-4"></i>
              </div>
              <h3 class="h4 mb-3">Protección Total</h3>
              <p class="text-muted">Cobertura integral para sus asuntos legales personales y empresariales.</p>
            </div>
          </div>
          <div class="col-md-4">
            <div class="p-4 h-100">
              <div class="icon-box mb-4 text-primary">
                <i class="bi bi-clock-history display-4"></i>
              </div>
              <h3 class="h4 mb-3">Disponibilidad 24/7</h3>
              <p class="text-muted">Nuestros expertos están disponibles cuando más los necesita.</p>
            </div>
          </div>
          <div class="col-md-4">
            <div class="p-4 h-100">
              <div class="icon-box mb-4 text-primary">
                <i class="bi bi-briefcase display-4"></i>
              </div>
              <h3 class="h4 mb-3">Expertos Certificados</h3>
              <p class="text-muted">Equipo multidisciplinario con años de experiencia en litigio y consultoría.</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Trust Section -->
    <section class="bg-light py-5">
      <div class="container py-5">
        <div class="row align-items-center">
          <div class="col-lg-6 mb-4 mb-lg-0">
            <h2 class="display-5 mb-4">¿Por qué elegir {{ appTitle }}?</h2>
            <p class="lead text-muted mb-4">
              Entendemos que los problemas legales pueden ser estresantes. Nuestro enfoque se centra en la prevención y la resolución eficiente.
            </p>
            <ul class="list-unstyled">
              <li class="mb-3 d-flex align-items-center">
                <i class="bi bi-check-circle-fill text-primary me-3"></i>
                <span>Atención personalizada y confidencial.</span>
              </li>
              <li class="mb-3 d-flex align-items-center">
                <i class="bi bi-check-circle-fill text-primary me-3"></i>
                <span>Costos transparentes mediante membresía.</span>
              </li>
              <li class="mb-3 d-flex align-items-center">
                <i class="bi bi-check-circle-fill text-primary me-3"></i>
                <span>Red de abogados especialistas en diversas ramas.</span>
              </li>
            </ul>
          </div>
          <div class="col-lg-6 text-center">
            <!-- Placeholder for an image -->
            <div class="bg-white p-5 shadow-sm rounded">
              <i class="bi bi-building text-muted" style="font-size: 8rem;"></i>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.hero-section {
  background: linear-gradient(rgba(15, 23, 42, 0.9), rgba(15, 23, 42, 0.8)), url('https://images.unsplash.com/photo-1589829085413-56de8ae18c73?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80');
  background-size: cover;
  background-position: center;
  min-height: 80vh;
}

.icon-box i {
  color: var(--secondary-color);
}
</style>
