<template>
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
          <div class="bg-white p-5 shadow-sm rounded">
            <i class="bi bi-building text-muted" style="font-size: 8rem;"></i>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
const appTitle = import.meta.env.VITE_APP_TITLE
</script>
