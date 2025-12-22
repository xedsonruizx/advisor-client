<template>
  <a 
    v-if="phoneNumber"
    :href="whatsappUrl" 
    target="_blank" 
    class="whatsapp-float"
    title="Contáctanos por WhatsApp"
  >
    <i class="bi bi-whatsapp"></i>
  </a>
</template>

<script setup>
import { computed } from 'vue'

const phoneNumber = import.meta.env.VITE_WHATSAPP_NUMBER

const whatsappUrl = computed(() => {
  if (!phoneNumber) return '#'
  // Remove non-numeric characters for the link
  const cleanNumber = phoneNumber.replace(/\D/g, '')
  return `https://wa.me/${cleanNumber}`
})
</script>

<style scoped>
.whatsapp-float {
  position: fixed;
  width: 60px;
  height: 60px;
  bottom: 40px;
  right: 40px;
  background-color: #25d366;
  color: #FFF;
  border-radius: 50px;
  text-align: center;
  font-size: 30px;
  box-shadow: 2px 2px 3px #999;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  text-decoration: none;
}

.whatsapp-float:hover {
  background-color: #128c7e;
  transform: scale(1.1);
  color: #FFF;
}

@media (max-width: 768px) {
  .whatsapp-float {
    width: 50px;
    height: 50px;
    bottom: 20px;
    right: 20px;
    font-size: 25px;
  }
}
</style>
