import { createRouter, createWebHistory } from 'vue-router'
import Home from './views/Home.vue'
import Login from './views/Login.vue'
import Register from './views/Register.vue'
import ForgotPassword from './views/ForgotPassword.vue'
import Memberships from './views/Memberships.vue'
import Dashboard from './views/Dashboard.vue'
import Posts from './views/Posts.vue'
import PostDetail from './views/PostDetail.vue'
import Users from './views/admin/Users.vue'
import Payments from './views/admin/Payments.vue'
import FAQ from './views/FAQ.vue'

const routes = [
  { path: '/', component: Home },
  { path: '/login', component: Login },
  { path: '/register', component: Register },
  { path: '/forgot-password', component: ForgotPassword },
  { path: '/memberships', component: Memberships },
  { path: '/dashboard', component: Dashboard },
  { path: '/posts', component: Posts },
  { path: '/posts/:id', component: PostDetail },
  { path: '/faq', component: FAQ },
  { path: '/admin/users', component: Users },
  { path: '/admin/payments', component: Payments }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
