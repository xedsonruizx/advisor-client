import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router.js'
import 'bootstrap/dist/css/bootstrap.min.css'
import './assets/main.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'
import axios from 'axios'

axios.defaults.withCredentials = true
axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL || '/api'

const app = createApp(App)
app.component('QuillEditor', QuillEditor)
app.use(createPinia())
app.use(router)
app.mount('#app')
