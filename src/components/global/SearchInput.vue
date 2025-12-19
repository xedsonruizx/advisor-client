<template>
  <div class="input-group shadow-sm">
    <span class="input-group-text bg-white border-end-0 ps-3">
      <i class="bi bi-search text-muted"></i>
    </span>
    <input 
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
      type="text" 
      class="form-control border-start-0 ps-0 py-3" 
      :placeholder="placeholder"
    >
    <button 
      v-if="modelValue" 
      class="btn btn-white border-start-0 border-top border-bottom border-end pe-3" 
      @click="$emit('update:modelValue', '')" 
      style="border-color: #dee2e6 !important;"
      type="button"
    >
      <i class="bi bi-x-lg text-muted"></i>
    </button>
  </div>
</template>

<script setup>
defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: 'Buscar...'
  }
})

defineEmits(['update:modelValue'])
</script>

<style scoped>
.form-control:focus {
  box-shadow: none;
  border-color: #dee2e6;
}
</style>
