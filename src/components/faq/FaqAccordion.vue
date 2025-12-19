<template>
  <div class="accordion shadow-sm border-0 rounded overflow-hidden" id="faqAccordion">
    <div v-for="(faq, index) in faqs" :key="faq.id" class="accordion-item border-0 border-bottom">
      <h2 class="accordion-header" :id="'heading' + index">
        <button 
          class="accordion-button collapsed fw-bold text-dark py-4" 
          type="button" 
          data-bs-toggle="collapse" 
          :data-bs-target="'#collapse' + index" 
          aria-expanded="false" 
          :aria-controls="'collapse' + index"
        >
          <div class="d-flex align-items-center w-100 me-3">
            <span class="me-auto">{{ faq.question }}</span>
            
            <div v-if="isAdmin" class="btn-group ms-3" @click.stop>
              <button class="btn btn-sm btn-light text-primary" @click="$emit('edit', faq)" title="Editar">
                <i class="bi bi-pencil-fill"></i>
              </button>
              <button class="btn btn-sm btn-light text-danger" @click="$emit('delete', faq)" title="Eliminar">
                <i class="bi bi-trash-fill"></i>
              </button>
            </div>
          </div>
        </button>
      </h2>
      <div 
        :id="'collapse' + index" 
        class="accordion-collapse collapse" 
        :aria-labelledby="'heading' + index" 
        data-bs-parent="#faqAccordion"
      >
        <div class="accordion-body text-muted lh-lg pb-4">
          {{ faq.answer }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  faqs: {
    type: Array,
    required: true
  },
  isAdmin: {
    type: Boolean,
    default: false
  }
})

defineEmits(['edit', 'delete'])
</script>

<style scoped>
.accordion-button:not(.collapsed) {
  color: var(--primary-color);
  background-color: rgba(197, 160, 89, 0.1); /* Gold tint */
  box-shadow: none;
}
.accordion-button:focus {
  box-shadow: none;
  border-color: rgba(0,0,0,0.1);
}
</style>
