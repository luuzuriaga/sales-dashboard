import Vue from 'vue'
import VueRouter from 'vue-router'
import store from '@/store'
import Dashboard from '@/views/Dashboard.vue'
import Reportes from '@/views/Reportes.vue'
import Vendedores from '@/views/Vendedores.vue'
import Login from '@/views/Login.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { title: 'Acceso', guest: true }
  },
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard,
    meta: { title: 'Dashboard', requiresAuth: true, requiredRole: 'gerente' }
  },
  {
    path: '/reportes',
    name: 'Reportes',
    component: Reportes,
    meta: { title: 'Reportes', requiresAuth: true, requiredRole: 'gerente' }
  },
  {
    path: '/vendedores',
    name: 'Vendedores',
    component: Vendedores,
    meta: { title: 'Vendedores', requiresAuth: true, requiredRole: 'gerente' }
  },
  {
    path: '/vendedor/panel',
    name: 'VendedorPanel',
    component: () => import('@/views/VendedorDashboard.vue'),
    meta: { title: 'Panel Vendedor', requiresAuth: true, requiredRole: 'vendedor' }
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

// Guard de navegación para proteger rutas
router.beforeEach((to, from, next) => {
  const isAuthenticated = store.getters.isAuthenticated

  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!isAuthenticated) {
      next('/login')
    } else {
      const userRole = store.getters.userRole
      const requiredRole = to.meta.requiredRole

      if (requiredRole && userRole !== requiredRole) {
        const redirectPath = userRole === 'gerente' ? '/dashboard' : '/vendedor/panel'
        // Solo redirigir si el destino es diferente para evitar el error de redundancia
        if (to.path !== redirectPath) {
          next(redirectPath)
        } else {
          next()
        }
      } else {
        next()
      }
    }
  } else if (to.matched.some(record => record.meta.guest)) {
    if (isAuthenticated) {
      const role = store.getters.userRole
      const redirectPath = role === 'gerente' ? '/dashboard' : '/vendedor/panel'
      if (to.path !== redirectPath) {
        next(redirectPath)
      } else {
        next()
      }
    } else {
      next()
    }
  } else {
    next()
  }
})

// Actualizar el título de la pestaña
router.afterEach((to) => {
  document.title = `${to.meta.title} | Sales Dashboard`
})

export default router
