<template>
  <div class="accordion shadow-sm border-0 rounded overflow-hidden" id="faqAccordion">
    <div v-for="(faq, index) in faqs" :key="faq.id" class="accordion-item border-0 border-bottom">
      <h2 class="accordion-header">
        <button 
          class="accordion-button fw-bold text-dark py-4" 
          :class="{ collapsed: openId !== faq.id }"
          type="button" 
          @click="toggle(faq.id)"
        >
          <div class="d-flex align-items-center w-100 me-3">
            <span class="me-auto">{{ faq.question }}</span>
            
            <div v-if="isAdmin" class="btn-group ms-3">
              <button class="btn btn-sm btn-light text-primary" @click.stop="$emit('edit', faq)" title="Editar">
                <i class="bi bi-pencil-fill"></i>
              </button>
              <button class="btn btn-sm btn-light text-danger" @click.stop="$emit('delete', faq)" title="Eliminar">
                <i class="bi bi-trash-fill"></i>
              </button>
            </div>
          </div>
        </button>
      </h2>
      <div 
        class="accordion-collapse collapse" 
        :class="{ show: openId === faq.id }"
      >
        <div class="accordion-body text-muted lh-lg pb-4 ql-editor" v-html="faq.answer">
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

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

const openId = ref(null)

function toggle(id) {
  if (openId.value === id) {
    openId.value = null
  } else {
    openId.value = id
  }
}
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
