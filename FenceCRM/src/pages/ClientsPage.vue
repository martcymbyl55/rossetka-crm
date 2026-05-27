<script setup>

import {
  collection,
  onSnapshot,
} from 'firebase/firestore'

import {
  ref,
  computed,
  onMounted,
} from 'vue'

import { db } from '../firebase'

const requests = ref([])

const loading = ref(true)

const search = ref('')

// =====================================
// LOAD
// =====================================

onMounted(() => {

  onSnapshot(
    collection(db, 'requests'),

    (snapshot) => {

      requests.value =
        snapshot.docs.map((doc) => ({

          id: doc.id,

          ...doc.data(),

        }))

      loading.value = false

    }

  )

})

// =====================================
// CLIENTS
// =====================================

const clients = computed(() => {

  const grouped = {}

  requests.value.forEach((request) => {

    const phone =

      request.clientPhone ||
      request.id

    if (!grouped[phone]) {

      grouped[phone] = {

        id: phone,

        clientName:
          request.clientName ||
          'Без имени',

        clientPhone:
          request.clientPhone || '-',

        clientEmail:
          request.clientEmail || '-',

        orders: 0,

        revenue: 0,

        averageCheck: 0,

      }

    }

    grouped[phone].orders += 1

    grouped[phone].revenue +=
      Number(request.totalPrice || 0)

    grouped[phone].averageCheck =
      Math.round(

        grouped[phone].revenue /
        grouped[phone].orders

      )

  })

  return Object.values(grouped)

    .sort(
      (a, b) =>
        b.revenue - a.revenue
    )

})

// =====================================
// FILTER
// =====================================

const filteredClients = computed(() => {

  return clients.value.filter((client) => {

    const value =
      search.value.toLowerCase()

    return (

      String(client.clientName || '')
        .toLowerCase()
        .includes(value)

      ||

      String(client.clientPhone || '')
        .toLowerCase()
        .includes(value)

      ||

      String(client.clientEmail || '')
        .toLowerCase()
        .includes(value)

    )

  })

})

// =====================================
// KPI
// =====================================

const totalRevenue = computed(() => {

  return clients.value.reduce(

    (sum, client) =>

      sum + client.revenue,

    0

  )

})

</script>

<template>

  <div class="space-y-8">

    <!-- HEADER -->

    <div>

      <h1 class="text-4xl font-bold text-gray-800">
        Клиенты
      </h1>

      <p class="text-gray-400 mt-2">
        База клиентов CRM системы
      </p>

    </div>

    <!-- KPI -->

    <div
      class="grid grid-cols-1 md:grid-cols-2 gap-5"
    >

      <div class="kpi-card">

        <div class="kpi-title">
          Всего клиентов
        </div>

        <div class="kpi-value">
          {{ clients.length }}
        </div>

      </div>

      <div class="kpi-card">

        <div class="kpi-title">
          Общая выручка
        </div>

        <div class="kpi-value">
          {{ totalRevenue.toLocaleString() }} ₽
        </div>

      </div>

    </div>

    <!-- SEARCH -->

    <div class="card">

      <input
        v-model="search"
        type="text"
        placeholder="Поиск клиента..."
        class="input"
      />

    </div>

    <!-- TABLE -->

    <div class="card overflow-x-auto">

      <div
        v-if="loading"
        class="text-center py-16 text-gray-400"
      >
        Загрузка клиентов...
      </div>

      <div
        v-else-if="!filteredClients.length"
        class="text-center py-16 text-gray-400"
      >
        Клиенты не найдены
      </div>

      <table
        v-else
        class="w-full"
      >

        <thead
          class="bg-gray-50 sticky top-0"
        >

          <tr>

            <th class="table-head">
              Клиент
            </th>

            <th class="table-head">
              Телефон
            </th>

            <th class="table-head">
              Email
            </th>

            <th class="table-head">
              Заказов
            </th>

            <th class="table-head">
              Средний чек
            </th>

            <th class="table-head">
              Общая сумма
            </th>

          </tr>

        </thead>

        <tbody>

          <tr
            v-for="client in filteredClients"
            :key="client.id"
            class="border-t border-gray-100 hover:bg-gray-50 transition"
          >

            <td
              class="table-cell font-semibold"
            >
              {{ client.clientName }}
            </td>

            <td class="table-cell">
              {{ client.clientPhone }}
            </td>

            <td class="table-cell">
              {{ client.clientEmail }}
            </td>

            <td class="table-cell">
              {{ client.orders }}
            </td>

            <td class="table-cell">

              {{
                client.averageCheck
                  .toLocaleString()
              }} ₽

            </td>

            <td
              class="table-cell font-bold text-[#0044AA]"
            >

              {{
                client.revenue
                  .toLocaleString()
              }} ₽

            </td>

          </tr>

        </tbody>

      </table>

    </div>

  </div>

</template>

<style scoped>

.card {
  @apply bg-white rounded-3xl p-6 border border-gray-100 shadow-sm;
}

.input {
  @apply w-full border border-gray-200 rounded-2xl px-5 py-4 outline-none focus:border-[#0044AA];
}

.table-head {
  @apply text-left px-6 py-5 text-sm font-semibold text-gray-500 whitespace-nowrap;
}

.table-cell {
  @apply px-6 py-5 text-gray-700 whitespace-nowrap;
}

.kpi-card {
  @apply bg-white rounded-3xl p-6 border border-gray-100 shadow-sm;
}

.kpi-title {
  @apply text-sm text-gray-400;
}

.kpi-value {
  @apply text-3xl font-bold mt-4 text-[#0044AA];
}

</style>