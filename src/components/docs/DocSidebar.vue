<template>
  <ul class="list-unstyled ps-3 mb-0">
    <li v-for="item in children" :key="item.id" class="mb-1">
      <div 
        class="d-flex align-items-center py-2 px-2 rounded cursor-pointer item-row"
        :class="{ 'active-item': selectedId === item.id, 'text-muted': item.isLocked }"
        @click.stop="handleClick(item)"
      >
        <!-- Toggle Icon for Folders -->
        <span 
          v-if="item.type === 'folder'" 
          class="me-2 toggle-icon"
          @click.stop="toggleFolder(item.id)"
        >
          <i class="bi" :class="isOpen(item.id) ? 'bi-chevron-down' : 'bi-chevron-right'"></i>
        </span>
        <span v-else class="me-4"></span> <!-- Spacer -->

        <!-- Type Icon -->
        <i class="bi me-2" :class="getIcon(item)"></i>
        
        <!-- Title -->
        <span class="text-truncate flex-grow-1 user-select-none">{{ item.title }}</span>
        
        <!-- Badges -->
        <span v-if="item.isDraft" class="badge bg-warning text-dark ms-2" style="font-size: 0.6rem">Borrador</span>
        <i v-if="item.isLocked" class="bi bi-lock-fill ms-2 text-secondary" title="Requiere suscripción superior"></i>
      </div>
      
      <!-- Recursive Children -->
      <div v-if="item.type === 'folder' && isOpen(item.id)" class="ms-2 border-start border-secondary-subtle">
        <DocSidebar 
          :items="items" 
          :parentId="item.id" 
          :selectedId="selectedId"
          :openFolders="openFolders"
          @select="$emit('select', $event)"
          @toggle="$emit('toggle', $event)"
        />
      </div>
    </li>
    
    <li v-if="children.length === 0 && parentId !== null" class="text-muted small ps-4 py-1 fst-italic">
      (Vacío)
    </li>
  </ul>
</template>

<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  items: { type: Array, required: true },
  parentId: { type: String, default: null },
  selectedId: { type: String, default: null }
})

const emit = defineEmits(['select'])

const openFolders = ref(new Set())

const children = computed(() => {
  return props.items.filter(item => item.parentId === props.parentId)
})

function hasChildren(id) {
  return props.items.some(item => item.parentId === id)
}

function isOpen(id) {
  return openFolders.value.has(id)
}

function toggleFolder(id) {
  // Check if locked
  const item = props.items.find(i => i.id === id)
  if (item?.isLocked) return

  if (openFolders.value.has(id)) {
    openFolders.value.delete(id)
  } else {
    openFolders.value.add(id)
  }
}

function handleClick(item) {
  emit('select', item)
  if (item.type === 'folder') {
    toggleFolder(item.id)
  }
}

function getIcon(item) {
  if (item.type === 'folder') {
    return isOpen(item.id) ? 'bi-folder-open text-warning' : 'bi-folder text-warning'
  }
  return 'bi-file-text text-primary'
}
</script>

<style scoped>
.item-row {
  transition: background-color 0.2s;
}
.item-row:hover {
  background-color: rgba(0,0,0,0.05);
}
.active-item {
  background-color: var(--primary-color, #0f172a) !important;
  color: white !important;
}
.active-item .text-warning {
  color: #ffd700 !important;
}
.active-item .text-primary {
  color: #6ea8fe !important;
}
.toggle-icon {
  cursor: pointer;
  width: 16px;
  display: inline-block;
  text-align: center;
}
.cursor-pointer {
  cursor: pointer;
}
</style>
