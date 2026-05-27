<script setup>

import {
  LayoutDashboard,
  ClipboardList,
  ShoppingCart,
  Users,
  BarChart3,
  Settings,
} from 'lucide-vue-next'

</script>

<template>

  <aside
    class="w-[280px] bg-white border-r border-gray-100 h-screen p-6 flex flex-col"
  >

    <!-- LOGO -->

    <div class="mb-10">

      <h1 class="text-3xl font-bold text-[#0044AA]">
        FenceCRM
      </h1>

      <p class="text-gray-400 text-sm mt-1">
        CRM система
      </p>

    </div>

    <!-- MENU -->

    <nav class="flex flex-col gap-2">

      <RouterLink
        to="/dashboard"
        class="menu-item"
        active-class="menu-active"
      >
        <LayoutDashboard size="20" />

        <span>
          Dashboard
        </span>
      </RouterLink>

      <RouterLink
        to="/requests"
        class="menu-item"
        active-class="menu-active"
      >
        <ClipboardList size="20" />

        <span>
          Заявки
        </span>
      </RouterLink>

      <RouterLink
        to="/orders"
        class="menu-item"
        active-class="menu-active"
      >
        <ShoppingCart size="20" />

        <span>
          Заказы
        </span>
      </RouterLink>

      <RouterLink
        to="/clients"
        class="menu-item"
        active-class="menu-active"
      >
        <Users size="20" />

        <span>
          Клиенты
        </span>
      </RouterLink>

      <RouterLink
        to="/analytics"
        class="menu-item"
        active-class="menu-active"
      >
        <BarChart3 size="20" />

        <span>
          Аналитика
        </span>
      </RouterLink>

      <RouterLink
        to="/settings"
        class="menu-item"
        active-class="menu-active"
      >
        <Settings size="20" />

        <span>
          Настройки
        </span>
      </RouterLink>

    </nav>

    <!-- USER -->

    <div
      class="mt-auto bg-gray-50 rounded-2xl p-4"
    >

      <div class="font-semibold text-gray-800">
        Менеджер
      </div>

      <div class="text-sm text-gray-400">
        admin@crm.ru
      </div>

    </div>

  </aside>

</template>

<style scoped>

.menu-item {
  @apply flex items-center gap-3 px-5 py-4 rounded-2xl text-gray-600 hover:bg-gray-100 transition font-medium;
}

.menu-active {
  @apply bg-[#0044AA] text-white hover:bg-[#0044AA];
}

</style>