import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from './stores/auth'
import Home from './views/home/Home.vue'
import Login from './views/auth/Login.vue'
import Register from './views/auth/Register.vue'
import ForgotPassword from './views/auth/ForgotPassword.vue'
import ResetPassword from './views/auth/ResetPassword.vue'
import VerifyEmailPrompt from './views/auth/VerifyEmailPrompt.vue'
import Memberships from './views/membership/Memberships.vue'
import Dashboard from './views/dashboard/Dashboard.vue'
import Posts from './views/post/Posts.vue'
import PostDetail from './views/post/PostDetail.vue'
import Users from './views/admin/Users.vue'
import Payments from './views/admin/Payments.vue'
import Evaluations from './views/admin/Evaluations.vue'
import Evaluation from './views/evaluation/Evaluation.vue'
import Results from './views/evaluation/Results.vue'
import FAQ from './views/faq/FAQ.vue'
import Profile from './views/account/Profile.vue'

const routes = [
  { path: '/', component: Home },
  { path: '/login', component: Login },
  { path: '/register', component: Register },
  { path: '/forgot-password', component: ForgotPassword },
  { path: '/reset-password', component: ResetPassword },
  { path: '/verify-email', component: VerifyEmailPrompt },
  { path: '/evaluation', component: Evaluation },
  { path: '/evaluation/results', component: Results },
  { path: '/memberships', component: Memberships },
  { path: '/dashboard', component: Dashboard },
  { path: '/profile', component: Profile },
  { path: '/posts', component: Posts },
  { path: '/posts/:id', component: PostDetail },
  { path: '/faq', component: FAQ },
  { path: '/admin/users', component: Users },
  { path: '/admin/payments', component: Payments },
  { path: '/admin/evaluations', component: Evaluations },
  { path: '/admin/results/:userId', component: Results }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach(async (to, from, next) => {
  const auth = useAuthStore()
  
  // Wait for user to be loaded if not yet loaded (e.g. on page refresh)
  if (auth.loading) {
    // Basic spin wait or rely on app initialization, but fetchMe usually runs in App.vue onMounted
    // A better approach is checking if user is null and we haven't tried fetching yet.
    // However, App.vue runs fetchMe. Let's assume store state is eventual consistent.
    // For now, proceed. If user is loaded later, the UI will react or next nav will catch it.
  }

  const publicPages = ['/login', '/register', '/forgot-password', '/reset-password', '/verify-email', '/', '/faq', '/memberships', '/posts']
  const authRequired = !publicPages.includes(to.path) && !to.path.startsWith('/posts/')

  // If user is logged in but email not verified
  if (auth.user && !auth.user.emailVerified) {
    // Allow access only to verify prompt and logout (logout handled in component)
    if (to.path !== '/verify-email') {
      return next('/verify-email')
    }
  }

  // If user is verified and tries to access verify prompt, send home
  if (auth.user && auth.user.emailVerified && to.path === '/verify-email') {
    return next('/')
  }

  next()
})

export default router
