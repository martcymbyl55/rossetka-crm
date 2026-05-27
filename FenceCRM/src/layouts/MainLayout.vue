<script setup>

import logo from '../assets/logo.png'

import {
  LayoutDashboard,
  ClipboardList,
  ShoppingCart,
  Users,
  BarChart3,
  Settings,
  PlusCircle,
} from 'lucide-vue-next'

import {
  signOut,
} from 'firebase/auth'

import {
  useRouter,
  RouterLink,
} from 'vue-router'

import { auth }
from '../firebase'

import { authStore }
from '../stores/authStore'

const router = useRouter()

const logout = async () => {

  await signOut(auth)

  router.push('/login')

}

</script>

<template>

  <div class="flex h-screen bg-[#F5F7FB] overflow-hidden">

    <!-- SIDEBAR -->

    <aside
      class="w-[290px] bg-white border-r border-gray-100 flex flex-col"
    >

      <!-- LOGO -->

      <div
        class="h-[90px] border-b border-gray-100 px-6 flex items-center gap-4"
      >

        <img
          :src="logo"
          alt="Logo"
          class="w-14 h-14 object-contain"
        />

        <div>

          <h1 class="text-2xl font-bold text-[#0044AA]">
            Россетка CRM
          </h1>

        </div>

      </div>

      <!-- MENU -->

      <nav class="flex-1 p-4 space-y-2 overflow-auto">

        <RouterLink
          to="/dashboard"
          class="menu-link"
        >

          <LayoutDashboard size="20" />

          <span>
            Dashboard
          </span>

        </RouterLink>

        <RouterLink
          to="/requests"
          class="menu-link"
        >

          <ClipboardList size="20" />

          <span>
            Заявки
          </span>

        </RouterLink>

        <RouterLink
          to="/requests/create"
          class="menu-link"
        >

          <PlusCircle size="20" />

          <span>
            Создать заявку
          </span>

        </RouterLink>

        <RouterLink
          to="/orders"
          class="menu-link"
        >

          <ShoppingCart size="20" />

          <span>
            Заказы
          </span>

        </RouterLink>

        <RouterLink
          to="/clients"
          class="menu-link"
        >

          <Users size="20" />

          <span>
            Клиенты
          </span>

        </RouterLink>

        <!-- ANALYTICS -->

        <RouterLink
          v-if="
            authStore.role === 'admin'
            ||
            authStore.role === 'director'
          "
          to="/analytics"
          class="menu-link"
        >

          <BarChart3 size="20" />

          <span>
            Аналитика
          </span>

        </RouterLink>

        <!-- SETTINGS -->

        <RouterLink
          v-if="authStore.role === 'admin'"
          to="/settings"
          class="menu-link"
        >

          <Settings size="20" />

          <span>
            Настройки
          </span>

        </RouterLink>

      </nav>

      <!-- USER -->

      <div
        class="p-4 border-t border-gray-100"
      >

        <div
          class="bg-gray-50 rounded-2xl p-4"
        >

          <div class="flex items-center gap-4">

            <div
              class="w-12 h-12 rounded-full bg-[#0044AA] text-white flex items-center justify-center font-bold text-lg"
            >
              {{
                authStore.email?.charAt(0)?.toUpperCase()
              }}
            </div>

            <div>

              <div class="font-semibold text-gray-800">

                {{
                  authStore.role === 'admin'
                    ? 'Администратор'
                    : authStore.role === 'director'
                    ? 'Директор'
                    : 'Менеджер'
                }}

              </div>

              <div class="text-sm text-gray-400">
                {{ authStore.email }}
              </div>

            </div>

          </div>

          <button
            @click="logout"
            class="logout-btn"
          >
            Выйти
          </button>

        </div>

      </div>

    </aside>

    <!-- CONTENT -->

    <div class="flex-1 flex flex-col overflow-hidden">

      <!-- HEADER -->

      <header
        class="bg-white border-b border-gray-200 px-8 py-5 flex items-center justify-between shrink-0"
      >

        <div>

          <h2
            class="text-3xl font-bold text-gray-800"
          >
            CRM система управления
          </h2>

          <p class="text-gray-400 mt-1">
            Автоматизация заявок и заказов
          </p>

          <div class="mt-4">

            <input
              type="text"
              placeholder="Быстрый поиск..."
              class="w-[300px] border border-gray-200 rounded-2xl px-5 py-3 outline-none focus:border-cyan-500"
            />

          </div>

        </div>

        <div
          class="flex items-center gap-4"
        >

          <div
            class="hidden md:flex flex-col text-right"
          >

            <span class="font-semibold text-gray-700">
              Добро пожаловать
            </span>

            <span class="text-sm text-gray-400">

              {{
                authStore.role === 'admin'
                  ? 'Администратор'
                  : authStore.role === 'director'
                  ? 'Директор'
                  : 'Менеджер'
              }}

            </span>

          </div>

          <div
            class="w-12 h-12 rounded-full bg-[#0044AA] text-white flex items-center justify-center font-bold"
          >
            {{
              authStore.email?.charAt(0)?.toUpperCase()
            }}
          </div>

        </div>

      </header>

      <!-- PAGE -->

      <main class="flex-1 overflow-auto bg-gray-100">

        <div class="p-8">
          <router-view />
        </div>

      </main>

    </div>

  </div>

</template>

<style scoped>

.menu-link {
  @apply flex items-center gap-3 px-5 py-4 rounded-2xl text-gray-600 font-medium transition;
}

.menu-link:hover {
  @apply bg-gray-100 text-[#0044AA];
}

.router-link-active {
  @apply bg-[#0044AA] text-white shadow-lg;
}

.logout-btn {
  @apply mt-4 w-full border border-red-200 text-red-500 hover:bg-red-50 py-3 rounded-2xl font-semibold transition;
}

</style>