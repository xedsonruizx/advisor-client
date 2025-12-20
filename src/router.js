import { createRouter, createWebHistory } from 'vue-router'
import Home from './views/home/Home.vue'
import Login from './views/auth/Login.vue'
import Register from './views/auth/Register.vue'
import ForgotPassword from './views/auth/ForgotPassword.vue'
import Memberships from './views/membership/Memberships.vue'
import Dashboard from './views/dashboard/Dashboard.vue'
import Posts from './views/post/Posts.vue'
import PostDetail from './views/post/PostDetail.vue'
import Users from './views/admin/Users.vue'
import Payments from './views/admin/Payments.vue'
import FAQ from './views/faq/FAQ.vue'
import Profile from './views/account/Profile.vue'

const routes = [
  { path: '/', component: Home },
  { path: '/login', component: Login },
  { path: '/register', component: Register },
  { path: '/forgot-password', component: ForgotPassword },
  { path: '/memberships', component: Memberships },
  { path: '/dashboard', component: Dashboard },
  { path: '/profile', component: Profile },
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
