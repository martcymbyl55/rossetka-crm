import {
  createRouter,
  createWebHistory,
} from 'vue-router'

import MainLayout
from '../layouts/MainLayout.vue'

import DashboardPage
from '../pages/DashboardPage.vue'

import RequestsPage
from '../pages/RequestsPage.vue'

import CreateRequestPage
from '../pages/CreateRequestPage.vue'

import RequestDetailsPage
from '../pages/RequestDetailsPage.vue'

import ClientsPage
from '../pages/ClientsPage.vue'

import OrdersPage
from '../pages/OrdersPage.vue'

import AnalyticsPage
from '../pages/AnalyticsPage.vue'

import SettingsPage
from '../pages/SettingsPage.vue'

import LoginPage
from '../pages/LoginPage.vue'

import { auth }
from '../firebase'

// =====================================
// ROUTES
// =====================================

const routes = [

  // LOGIN

  {
    path: '/login',
    component: LoginPage,
  },

  // CRM

  {
    path: '/',
    component: MainLayout,

    meta: {
      requiresAuth: true,
    },

    children: [

      {
        path: '',
        redirect: '/dashboard',
      },

      {
        path: 'dashboard',
        component: DashboardPage,
      },

      {
        path: 'requests',
        component: RequestsPage,
      },

      {
        path: 'requests/create',
        component: CreateRequestPage,
      },

      {
        path: 'requests/:id',
        component: RequestDetailsPage,
      },

      {
        path: 'orders',
        component: OrdersPage,
      },

      {
        path: 'clients',
        component: ClientsPage,
      },

      {
        path: 'analytics',
        component: AnalyticsPage,
      },

      {
        path: 'settings',
        component: SettingsPage,
      },

    ],

  },

  // 404

  {
    path: '/:pathMatch(.*)*',
    redirect: '/dashboard',
  },

]

// =====================================
// ROUTER
// =====================================

const router = createRouter({

  history: createWebHistory(),

  routes,

})

// =====================================
// AUTH GUARD
// =====================================

router.beforeEach((to) => {

  const requiresAuth =
    to.matched.some(
      (record) => record.meta.requiresAuth
    )

  const user =
    auth.currentUser

  // НЕ АВТОРИЗОВАН

  if (
    requiresAuth &&
    !user
  ) {

    return '/login'

  }

  // УЖЕ АВТОРИЗОВАН

  if (
    to.path === '/login' &&
    user
  ) {

    return '/dashboard'

  }

})

export default router