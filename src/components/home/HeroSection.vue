<template>
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
</template>

<style scoped>
.hero-section {
  background: linear-gradient(rgba(15, 23, 42, 0.9), rgba(15, 23, 42, 0.8)), url('https://images.unsplash.com/photo-1589829085413-56de8ae18c73?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80');
  background-size: cover;
  background-position: center;
  min-height: 80vh;
}
</style>
