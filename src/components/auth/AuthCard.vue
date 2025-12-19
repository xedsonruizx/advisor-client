<template>
  <div class="container py-5">
    <div class="row justify-content-center">
      <div class="col-md-6 col-lg-5">
        <div class="card border-0 shadow-lg">
          <div class="card-body p-5">
            <div class="text-center mb-4">
              <h2 class="h3 mb-3 font-playfair">{{ title }}</h2>
              <p class="text-muted small">{{ subtitle }}</p>
            </div>

            <slot></slot>

            <div v-if="$slots.footer" class="text-center mt-4 pt-3 border-top">
              <slot name="footer"></slot>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    required: true
  },
  subtitle: {
    type: String,
    default: ''
  }
})
</script>

<style scoped>
.font-playfair {
  font-family: 'Playfair Display', serif;
  font-weight: 700;
}
</style>
