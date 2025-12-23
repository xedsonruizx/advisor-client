<template>
  <div class="container-fluid py-4 h-100 d-flex flex-column">
    <div class="row flex-grow-1 g-0 shadow-sm border rounded overflow-hidden" style="min-height: 80vh;">
      
      <!-- Sidebar (Desktop) -->
      <div class="col-md-3 bg-light border-end d-none d-md-flex flex-column">
        <div class="p-3 border-bottom bg-white d-flex justify-content-between align-items-center">
          <h5 class="mb-0 fw-bold text-primary">Biblioteca</h5>
          <button v-if="isAdmin" class="btn btn-sm btn-primary" @click="openCreateModal(null)">
            <i class="bi bi-plus-lg"></i>
          </button>
        </div>
        
        <div class="overflow-auto flex-grow-1 p-2 custom-scrollbar">
          <div v-if="loading" class="text-center py-4">
            <div class="spinner-border text-primary spinner-border-sm" role="status"></div>
          </div>
          <div v-else-if="items.length === 0" class="text-center py-4 text-muted">
            No hay documentos disponibles.
          </div>
          <DocSidebar 
            v-else
            :items="items" 
            :parentId="null" 
            :selectedId="selectedItem?.id"
            @select="selectItem"
          />
        </div>
      </div>

      <!-- Mobile Sidebar (Offcanvas) -->
      <div class="offcanvas offcanvas-start" tabindex="-1" id="mobileSidebar" ref="mobileSidebarRef">
        <div class="offcanvas-header border-bottom">
          <h5 class="offcanvas-title text-primary fw-bold">Biblioteca</h5>
          <button type="button" class="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
        </div>
        <div class="offcanvas-body p-0 d-flex flex-column">
           <div class="p-3 border-bottom bg-light d-flex justify-content-between align-items-center" v-if="isAdmin">
              <span class="text-muted small">Administración</span>
              <button class="btn btn-sm btn-primary" @click="openCreateModal(null)">
                <i class="bi bi-plus-lg"></i> Nuevo
              </button>
           </div>
           <div class="overflow-auto flex-grow-1 p-2">
              <div v-if="loading" class="text-center py-4">
                <div class="spinner-border text-primary spinner-border-sm" role="status"></div>
              </div>
              <DocSidebar 
                v-else
                :items="items" 
                :parentId="null" 
                :selectedId="selectedItem?.id"
                @select="selectItemMobile"
              />
           </div>
        </div>
      </div>

      <!-- Content Area -->
      <div class="col-md-9 bg-white d-flex flex-column">
        <!-- Toolbar / Header -->
        <div class="p-3 border-bottom d-flex align-items-center bg-white">
          <!-- Mobile Toggle -->
          <button class="btn btn-outline-secondary d-md-none me-3" type="button" data-bs-toggle="offcanvas" data-bs-target="#mobileSidebar">
            <i class="bi bi-list"></i>
          </button>

          <nav aria-label="breadcrumb" class="flex-grow-1" v-if="selectedItem">
            <ol class="breadcrumb mb-0">
              <li class="breadcrumb-item text-primary fw-bold d-none d-sm-inline">Biblioteca</li>
              <li class="breadcrumb-item active text-truncate" style="max-width: 200px;" aria-current="page">{{ selectedItem.title }}</li>
            </ol>
          </nav>
          <div v-else class="flex-grow-1 text-muted">Biblioteca</div>
          
          <div v-if="isAdmin && selectedItem">
            <button class="btn btn-sm btn-outline-primary me-2" @click="openCreateModal(selectedItem.id)" v-if="selectedItem.type === 'folder'">
              <i class="bi bi-folder-plus"></i>
            </button>
            <button class="btn btn-sm btn-outline-secondary me-2" @click="openEditModal(selectedItem)">
              <i class="bi bi-pencil"></i>
            </button>
            <button class="btn btn-sm btn-outline-danger" @click="deleteItem(selectedItem)">
              <i class="bi bi-trash"></i>
            </button>
          </div>
        </div>

        <!-- Main Content -->
        <div class="flex-grow-1 overflow-auto p-4 custom-scrollbar position-relative">
          <div v-if="!selectedItem" class="h-100 d-flex flex-column align-items-center justify-content-center text-muted">
            <i class="bi bi-journal-text display-1 mb-3 opacity-25"></i>
            <h4>Seleccione un documento</h4>
            <p>Navegue por las carpetas para ver el contenido.</p>
          </div>

          <div v-else>
             <!-- Content View -->
             <div v-if="!loadingContent">
                <div class="d-flex align-items-center mb-4">
                  <h1 class="display-6 fw-bold mb-0">{{ selectedItem.title }}</h1>
                  <span v-if="selectedItem.isLocked" class="badge bg-secondary ms-3">
                    <i class="bi bi-lock-fill me-1"></i> Contenido Bloqueado
                  </span>
                </div>

                <div v-if="selectedItem.isLocked" class="alert alert-warning">
                  <h4 class="alert-heading"><i class="bi bi-lock"></i> Acceso Restringido</h4>
                  <p>Este contenido está reservado para miembros con un plan superior.</p>
                  <router-link to="/memberships" class="btn btn-warning mt-2">Ver Planes</router-link>
                </div>

                <div v-else class="content-body q-editor-content">
                   <div v-if="selectedItem.content" v-html="selectedItem.content"></div>
                   <div v-else class="text-muted fst-italic">
                     {{ selectedItem.type === 'folder' ? 'Esta carpeta no tiene descripción.' : 'Este documento está vacío.' }}
                   </div>
                </div>
             </div>
             <div v-else class="text-center py-5">
               <div class="spinner-border text-primary" role="status"></div>
             </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Edit/Create Modal -->
    <div class="modal fade" id="docModal" tabindex="-1" ref="docModalRef">
      <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ isEditing ? 'Editar' : 'Crear' }} Documento</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="saveItem">
              <div class="mb-3">
                <label class="form-label">Título</label>
                <input type="text" class="form-control" v-model="form.title" required>
              </div>
              
              <div class="row mb-3">
                <div class="col-md-6">
                  <label class="form-label">Tipo</label>
                  <select class="form-select" v-model="form.type" :disabled="isEditing">
                    <option value="folder">Carpeta</option>
                    <option value="file">Archivo</option>
                  </select>
                </div>
                <div class="col-md-6">
                   <label class="form-label">Plan Mínimo (Opcional)</label>
                   <select class="form-select" v-model="form.minPlanId">
                     <option :value="null">Público / Sin Restricción</option>
                     <option v-for="plan in plans" :key="plan.id" :value="plan.id">
                       {{ plan.name }} (Nivel {{ plan.level }})
                     </option>
                   </select>
                </div>
              </div>

              <div class="mb-3 form-check">
                <input type="checkbox" class="form-check-input" id="isDraft" v-model="form.isDraft">
                <label class="form-check-label" for="isDraft">Borrador (Solo visible para Admin)</label>
              </div>

              <div class="mb-3">
                <label class="form-label">Contenido</label>
                <!-- Quill Editor -->
                <QuillEditor 
                  v-if="showEditor"
                  theme="snow" 
                  v-model:content="form.content" 
                  contentType="html"
                  toolbar="essential"
                  style="height: 300px"
                />
              </div>
              
              <div class="text-end mt-4">
                <button type="button" class="btn btn-secondary me-2" data-bs-dismiss="modal">Cancelar</button>
                <button type="submit" class="btn btn-primary" :disabled="saving">
                  {{ saving ? 'Guardando...' : 'Guardar' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Modal -->
    <DeleteModal
      :show="showDeleteModal"
      :title="'Eliminar ' + (itemToDelete?.type === 'folder' ? 'Carpeta' : 'Documento')"
      :message="itemToDelete?.type === 'folder' ? 'Se eliminará la carpeta y todo su contenido. Esta acción no se puede deshacer.' : '¿Estás seguro de eliminar este documento? Esta acción no se puede deshacer.'"
      :loading="deleteLoading"
      @close="showDeleteModal = false"
      @confirm="confirmDelete"
    />

  </div>
</template>

<script setup>
import { ref, onMounted, computed, nextTick, watch } from 'vue'
import axios from 'axios'
import { Modal, Offcanvas } from 'bootstrap'
import { useAuthStore } from '../../stores/auth'
import { useRouter, useRoute } from 'vue-router'
import DocSidebar from '../../components/docs/DocSidebar.vue'
import DeleteModal from '../../components/global/DeleteModal.vue'
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css';

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()
const isAdmin = computed(() => auth.user?.role === 'admin')

const items = ref([])
const plans = ref([])
const loading = ref(false)
const loadingContent = ref(false)
const selectedItem = ref(null)

// Tree State
const openFolders = ref(new Set())

// Delete Modal
const showDeleteModal = ref(false)
const itemToDelete = ref(null)
const deleteLoading = ref(false)

// Modal & Form
const docModalRef = ref(null)
const mobileSidebarRef = ref(null)
let modalInstance = null
let offcanvasInstance = null
const isEditing = ref(false)
const saving = ref(false)
const showEditor = ref(false) // Delay rendering editor to avoid modal layout issues

const form = ref({
  id: null,
  title: '',
  type: 'folder',
  content: '',
  isDraft: true,
  parentId: null,
  minPlanId: null
})

onMounted(async () => {
  await fetchTree()
  if (isAdmin.value) {
    await fetchPlans()
  }
  modalInstance = new Modal(docModalRef.value)
  offcanvasInstance = new Offcanvas(mobileSidebarRef.value)
  
  // Clean up modal on hide
  docModalRef.value.addEventListener('hidden.bs.modal', () => {
    showEditor.value = false
  })
})

// Sync URL with State (handles reload and navigation)
watch([() => route.params.id, items], ([newId, currentItems]) => {
  if (newId && currentItems.length > 0) {
     const item = currentItems.find(i => i.id === newId)
     if (item) {
        // Expand folders to show this item
        expandToItem(item)
        
        // Select item if not already selected
        if (selectedItem.value?.id !== newId) {
           selectItem(item, false)
        }
     }
  } else if (!newId && selectedItem.value) {
     // If navigating back to root /docs
     selectedItem.value = null
  }
}, { immediate: true, deep: false })

function toggleFolder(id) {
  // Check if locked
  const item = items.value.find(i => i.id === id)
  if (item?.isLocked) return

  if (openFolders.has(id)) {
    openFolders.delete(id)
  } else {
    openFolders.add(id)
  }
}

function expandToItem(item) {
  let current = item
  while (current.parentId) {
    openFolders.add(current.parentId)
    const parent = items.value.find(i => i.id === current.parentId)
    if (!parent) break
    current = parent
  }
}

async function fetchTree() {
  loading.value = true
  try {
    const { data } = await axios.get('/docs/tree')
    items.value = data
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

async function fetchPlans() {
  try {
    const { data } = await axios.get('/memberships/plans')
    plans.value = data
  } catch (e) {
    console.error(e)
  }
}

async function selectItemMobile(item) {
    await selectItem(item)
    offcanvasInstance.hide()
}

async function selectItem(item, updateUrl = true) {
  // If clicking the same item, do nothing
  if (selectedItem.value?.id === item.id) return
  
  selectedItem.value = item
  
  if (updateUrl) {
    const slug = item.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
    router.push(`/docs/${item.id}/${slug}`)
  }
  
  // If locked, we don't fetch content (or backend will reject)
  if (item.isLocked) return

  loadingContent.value = true
  try {
    const { data } = await axios.get(`/docs/${item.id}`)
    selectedItem.value = { ...item, ...data } // Merge detailed data
  } catch (e) {
    console.error(e)
    if (e.response?.status === 403) {
      alert('No tienes permiso para ver este contenido.')
    }
  } finally {
    loadingContent.value = false
  }
}

function openCreateModal(parentId) {
  isEditing.value = false
  offcanvasInstance.hide() // Close mobile sidebar if open
  form.value = {
    title: '',
    type: 'folder',
    content: '',
    isDraft: true,
    parentId: parentId,
    minPlanId: null
  }
  showEditor.value = true
  modalInstance.show()
}

async function openEditModal(item) {
  isEditing.value = true
  // We need full content to edit, ensure it's loaded
  if (!item.content && !loadingContent.value && item.type === 'file') {
     await selectItem(item) // Reload to be sure
  }
  
  form.value = {
    id: item.id,
    title: item.title,
    type: item.type,
    content: item.content || '',
    isDraft: item.isDraft,
    parentId: item.parentId,
    minPlanId: item.minPlanId
  }
  showEditor.value = true
  modalInstance.show()
}

async function saveItem() {
  saving.value = true
  try {
    if (isEditing.value) {
      const { data } = await axios.put(`/docs/${form.value.id}`, form.value)
      // Update local item
      const index = items.value.findIndex(i => i.id === data.id)
      if (index !== -1) items.value[index] = { ...items.value[index], ...data }
      
      // Update selected if same
      if (selectedItem.value?.id === data.id) {
        selectedItem.value = { ...selectedItem.value, ...data }
      }
    } else {
      const { data } = await axios.post('/docs', form.value)
      items.value.push(data)
    }
    modalInstance.hide()
    await fetchTree() // Refresh tree structure just in case
  } catch (e) {
    console.error(e)
    alert('Error al guardar')
  } finally {
    saving.value = false
  }
}

function deleteItem(item) {
  itemToDelete.value = item
  showDeleteModal.value = true
}

async function confirmDelete() {
  if (!itemToDelete.value) return
  
  deleteLoading.value = true
  try {
    await axios.delete(`/docs/${itemToDelete.value.id}`)
    selectedItem.value = null
    await fetchTree()
    showDeleteModal.value = false
    itemToDelete.value = null
  } catch (e) {
    console.error(e)
    alert('Error al eliminar')
  } finally {
    deleteLoading.value = false
  }
}
</script>

<style>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: #f1f1f1; 
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #ccc; 
  border-radius: 3px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #aaa; 
}
.q-editor-content img {
    max-width: 100%;
    height: auto;
}
</style>
