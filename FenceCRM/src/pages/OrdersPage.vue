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

import { RouterLink } from 'vue-router'

import { db } from '../firebase'

// =====================================
// DATA
// =====================================

const requests = ref([])

const loading = ref(true)

const search = ref('')

const selectedStatus = ref('Все')

const selectedType = ref('Все')

// =====================================
// LOAD
// =====================================

onMounted(() => {

  onSnapshot(
    collection(db, 'requests'),
    (snapshot) => {

      requests.value = snapshot.docs.map((doc) => ({

        id: doc.id,

        ...doc.data(),

      }))

      loading.value = false

    },
    (error) => {

      console.log(error)

      loading.value = false

    }
  )

})

// =====================================
// FILTERS
// =====================================

const statuses = [

  'Все',

  'Новая заявка',

  'Требует уточнения',

  'Расчет выполнен',

  'КП отправлено',

  'Ожидает оплату',

  'Оплачен',

  'В производстве',

  'Готов к отгрузке',

  'Доставляется',

  'Завершен',

]

const types = [

  'Все',

  '3d',

  'gabion',

  'temporary',

  'welded',

]

// =====================================
// FORMATTING
// =====================================

const formatFenceType = (type) => {

  if (type === 'Все') {
    return 'Все типы'
  }

  if (type === '3d') {
    return '3D забор'
  }

  if (type === 'gabion') {
    return 'Габион'
  }

  if (type === 'temporary') {
    return 'Временное ограждение'
  }

  if (type === 'welded') {
    return 'Сварное ограждение'
  }

  return type || '-'

}

const formatPrice = (value) => {

  return Number(value || 0)
    .toLocaleString()

}

// =====================================
// FILTERED REQUESTS
// =====================================

const filteredRequests = computed(() => {

  return requests.value
    .filter((item) => {

      const searchValue =
        search.value.toLowerCase()

      const matchesSearch =

        (
          item.clientName || ''
        )
          .toLowerCase()
          .includes(searchValue)

        ||

        (
          item.clientPhone || ''
        )
          .toLowerCase()
          .includes(searchValue)

      const matchesStatus =

        selectedStatus.value === 'Все'

        ||

        item.status === selectedStatus.value

      const matchesType =

        selectedType.value === 'Все'

        ||

        item.type === selectedType.value

      return (

        matchesSearch &&
        matchesStatus &&
        matchesType

      )

    })
    .sort((a, b) => {

      const dateA =

        a.createdAt?.seconds
          ? a.createdAt.seconds * 1000
          : new Date(
              a.createdAt || 0
            ).getTime()

      const dateB =

        b.createdAt?.seconds
          ? b.createdAt.seconds * 1000
          : new Date(
              b.createdAt || 0
            ).getTime()

      return dateB - dateA

    })

})

// =====================================
// ANALYTICS
// =====================================

const totalOrders = computed(() => {

  return requests.value.length

})

const totalRevenue = computed(() => {

  return requests.value.reduce(
    (sum, item) => {

      return (
        sum +
        Number(item.totalPrice || 0)
      )

    },
    0
  )

})

const averageCheck = computed(() => {

  if (!requests.value.length) {
    return 0
  }

  return Math.round(

    totalRevenue.value /
    requests.value.length

  )

})

const newOrders = computed(() => {

  return requests.value.filter(

    (item) =>
      item.status ===
      'Новая заявка'

  ).length

})

// =====================================
// STATUS COLORS
// =====================================

const getStatusColor = (status) => {

  if (status === 'Новая заявка') {
    return 'bg-blue-100 text-blue-700'
  }

  if (status === 'Требует уточнения') {
    return 'bg-orange-100 text-orange-700'
  }

  if (status === 'Расчет выполнен') {
    return 'bg-indigo-100 text-indigo-700'
  }

  if (status === 'КП отправлено') {
    return 'bg-cyan-100 text-cyan-700'
  }

  if (status === 'Ожидает оплату') {
    return 'bg-yellow-100 text-yellow-700'
  }

  if (status === 'Оплачен') {
    return 'bg-green-100 text-green-700'
  }

  if (status === 'В производстве') {
    return 'bg-purple-100 text-purple-700'
  }

  if (status === 'Готов к отгрузке') {
    return 'bg-pink-100 text-pink-700'
  }

  if (status === 'Доставляется') {
    return 'bg-teal-100 text-teal-700'
  }

  if (status === 'Завершен') {
    return 'bg-gray-200 text-gray-700'
  }

  return 'bg-gray-100 text-gray-600'

}

</script>

<template>

  <div class="space-y-6">

    <!-- HEADER -->

    <div class="flex items-center justify-between">

      <div>

        <h1 class="text-4xl font-bold text-gray-800">
          Заказы
        </h1>

        <p class="text-gray-400 mt-2">
          Управление заказами и производством
        </p>

      </div>

    </div>

    <!-- STATS -->

    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">

      <div class="stats-card">

        <div class="stats-title">
          Всего заказов
        </div>

        <div class="stats-value">
          {{ totalOrders }}
        </div>

      </div>

      <div class="stats-card">

        <div class="stats-title">
          Выручка
        </div>

        <div class="stats-value">
          {{ formatPrice(totalRevenue) }} ₽
        </div>

      </div>

      <div class="stats-card">

        <div class="stats-title">
          Средний чек
        </div>

        <div class="stats-value">
          {{ formatPrice(averageCheck) }} ₽
        </div>

      </div>

      <div class="stats-card">

        <div class="stats-title">
          Новые заявки
        </div>

        <div class="stats-value">
          {{ newOrders }}
        </div>

      </div>

    </div>

    <!-- FILTERS -->

    <div class="card">

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">

        <!-- SEARCH -->

        <input
          v-model="search"
          type="text"
          placeholder="Поиск клиента..."
          class="input"
        />

        <!-- STATUS -->

        <select
          v-model="selectedStatus"
          class="input"
        >

          <option
            v-for="status in statuses"
            :key="status"
          >
            {{ status }}
          </option>

        </select>

        <!-- TYPE -->

        <select
          v-model="selectedType"
          class="input"
        >

          <option
            v-for="type in types"
            :key="type"
            :value="type"
          >
            {{ formatFenceType(type) }}
          </option>

        </select>

      </div>

    </div>

    <!-- TABLE -->

    <div class="card overflow-hidden">

      <div
        v-if="loading"
        class="text-center py-16 text-gray-400"
      >
        Загрузка заказов...
      </div>

      <div
        v-else-if="!filteredRequests.length"
        class="text-center py-16 text-gray-400"
      >
        Заказы не найдены
      </div>

      <div
        v-else
        class="overflow-auto"
      >

        <table class="w-full">

          <thead>

            <tr
              class="border-b border-gray-100 text-left"
            >

              <th class="p-5">
                №
              </th>

              <th class="p-5">
                Дата
              </th>

              <th class="p-5">
                Клиент
              </th>

              <th class="p-5">
                Тип
              </th>

              <th class="p-5">
                Доставка
              </th>

              <th class="p-5">
                Монтаж
              </th>

              <th class="p-5">
                Стоимость
              </th>

              <th class="p-5">
                Статус
              </th>

              <th class="p-5">
                Действия
              </th>

            </tr>

          </thead>

          <tbody>

            <tr
              v-for="(item, index) in filteredRequests"
              :key="item.id"
              class="border-b border-gray-50 hover:bg-gray-50 transition"
            >

              <td class="p-5 font-semibold">
                #{{ index + 1 }}
              </td>

              <!-- DATE -->

              <td class="p-5 text-gray-500">

                {{
                  item.createdAt?.seconds
                    ? new Date(
                        item.createdAt.seconds * 1000
                      ).toLocaleDateString()
                    : '-'
                }}

              </td>

              <!-- CLIENT -->

              <td class="p-5">

                <div class="font-semibold text-gray-800">
                  {{ item.clientName || 'Без имени' }}
                </div>

                <div class="text-sm text-gray-400">
                  {{ item.clientPhone || '-' }}
                </div>

                <div class="text-xs text-blue-600 mt-1">
                  {{ item.clientType || '-' }}
                </div>

              </td>

              <!-- TYPE -->

              <td class="p-5 text-gray-700">

                {{ formatFenceType(item.type) }}

              </td>

              <!-- DELIVERY -->

              <td class="p-5 text-gray-700">

                {{ item.deliveryType || '-' }}

              </td>

              <!-- INSTALLATION -->

              <td class="p-5 text-gray-700">

                {{ item.installationType || '-' }}

              </td>

              <!-- PRICE -->

              <td class="p-5">

                <div class="font-bold text-[#0044AA]">

                  {{ formatPrice(item.totalPrice) }} ₽

                </div>

              </td>

              <!-- STATUS -->

              <td class="p-5">

                <span
                  class="px-4 py-2 rounded-xl text-sm font-semibold"
                  :class="getStatusColor(item.status)"
                >
                  {{ item.status || 'Без статуса' }}
                </span>

              </td>

              <!-- ACTIONS -->

              <td class="p-5">

                <RouterLink
                  :to="`/requests/${item.id}`"
                  class="details-btn"
                >
                  Открыть
                </RouterLink>

              </td>

            </tr>

          </tbody>

        </table>

      </div>

    </div>

  </div>

</template>

<style scoped>

.card {
  @apply bg-white rounded-3xl p-6 border border-gray-100 shadow-sm;
}

.input {
  @apply w-full border border-gray-200 rounded-2xl px-5 py-4 outline-none focus:border-[#0044AA] transition;
}

.details-btn {
  @apply bg-[#0044AA]
  hover:bg-[#003380]
  text-white
  px-4
  py-2
  rounded-xl
  text-sm
  font-semibold
  transition
  inline-flex
  items-center;
}

th {
  @apply text-sm uppercase tracking-wide text-gray-400 font-semibold;
}

.stats-card {
  @apply bg-white rounded-3xl p-5 border border-gray-100 shadow-sm transition hover:shadow-md;
}

.stats-title {
  @apply text-sm text-gray-400;
}

.stats-value {
  @apply text-3xl font-bold text-gray-800 mt-3;
}

</style>