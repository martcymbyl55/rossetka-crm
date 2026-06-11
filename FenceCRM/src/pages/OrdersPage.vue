<script setup>
import {
  collection,
  query,
  orderBy,
  onSnapshot,
} from 'firebase/firestore'

import {
  ref,
  computed,
  onMounted,
} from 'vue'

import { useRouter } from 'vue-router'

const router = useRouter()

const openOrder = (id) => {
  router.push(`/requests/${id}`)
}

import { RouterLink } from 'vue-router'
import { db } from '../firebase'

const requests = ref([])
const loading = ref(true)
const search = ref('')
const selectedStatus = ref('Все')

const orderStatuses = [
  'Заказ оплачен',
  'В производстве',
  'Готов к отгрузке',
  'Доставляется',
  'Завершен',
]

const statuses = [
  'Все',
  'Заказ оплачен',
  'В производстве',
  'Готов к отгрузке',
  'Доставляется',
  'Завершен',
]

onMounted(() => {
  const requestsQuery = query(
    collection(db, 'requests'),
    orderBy('createdAt', 'desc')
  )

  onSnapshot(
    requestsQuery,
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

const formatFenceType = (type) => {
  if (type === '3d') return '3D ограждение'
  return type || '-'
}

const formatPrice = (value) => {
  return Number(value || 0).toLocaleString('ru-RU')
}

const formatDate = (date) => {
  if (!date) return '-'

  if (date?.seconds) {
    return new Date(date.seconds * 1000).toLocaleDateString('ru-RU')
  }

  return new Date(date).toLocaleDateString('ru-RU')
}

const filteredRequests = computed(() => {
  return requests.value.filter((item) => {
    const searchValue = search.value.toLowerCase()

    const isOrder = orderStatuses.includes(item.status)

    const matchesSearch =
      (item.clientName || '').toLowerCase().includes(searchValue) ||
      (item.clientPhone || '').toLowerCase().includes(searchValue)

    const matchesStatus =
      selectedStatus.value === 'Все' ||
      item.status === selectedStatus.value

    return isOrder && matchesSearch && matchesStatus
  })
})

const totalOrders = computed(() => {
  return filteredRequests.value.length
})

const totalRevenue = computed(() => {
  return filteredRequests.value.reduce((sum, item) => {
    return sum + Number(item.totalPrice || 0)
  }, 0)
})

const averageCheck = computed(() => {
  if (!filteredRequests.value.length) return 0

  return Math.round(totalRevenue.value / filteredRequests.value.length)
})

const inProduction = computed(() => {
  return filteredRequests.value.filter(
    (item) => item.status === 'В производстве'
  ).length
})

const getStatusColor = (status) => {
  if (status === 'Заказ оплачен') return 'bg-green-100 text-green-700'
  if (status === 'В производстве') return 'bg-purple-100 text-purple-700'
  if (status === 'Готов к отгрузке') return 'bg-pink-100 text-pink-700'
  if (status === 'Доставляется') return 'bg-teal-100 text-teal-700'
  if (status === 'Завершен') return 'bg-gray-200 text-gray-700'

  return 'bg-gray-100 text-gray-600'
}
</script>

<template>
  <div class="space-y-6">

    <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
      <div>
        <h1 class="text-4xl font-bold text-gray-800">
          Заказы
        </h1>

        <p class="text-gray-400 mt-2">
          Производственные и оплаченные заказы
        </p>
      </div>

      <RouterLink
        to="/requests/create"
        class="create-btn"
      >
        + Создать заявку
      </RouterLink>
    </div>

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
          Выручка по заказам
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
          В производстве
        </div>

        <div class="stats-value">
          {{ inProduction }}
        </div>
      </div>
    </div>

    <div class="card">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          v-model="search"
          type="text"
          placeholder="Поиск по имени или телефону"
          class="input"
        />

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
      </div>
    </div>

    <div class="card overflow-hidden">
      <div
        v-if="loading"
        class="text-center py-20 text-gray-400"
      >
        Загрузка заказов...
      </div>

      <div
        v-else-if="!filteredRequests.length"
        class="text-center py-20 text-gray-400"
      >
        Заказы не найдены
      </div>

      <div
        v-else
        class="overflow-x-auto"
      >
        <table class="w-full min-w-[1000px]">
          <thead>
            <tr class="border-b border-gray-100">
              <th class="table-head">№</th>
              <th class="table-head">Дата</th>
              <th class="table-head">Клиент</th>
              <th class="table-head">Тип</th>
              <th class="table-head">Длина</th>
              <th class="table-head">Высота</th>
              <th class="table-head">Стоимость</th>
              <th class="table-head">Статус</th>
            </tr>
          </thead>

          <tbody>
            <tr
              v-for="(item, index) in filteredRequests"
              :key="item.id"
              class="border-b border-gray-50 hover:bg-gray-50 transition"
              @dblclick="openOrder(item.id)"
            >
              <td class="table-cell font-semibold">
                #{{ index + 1 }}
              </td>

              <td class="table-cell text-gray-500">
                {{ formatDate(item.createdAt) }}
              </td>

              <td class="table-cell">
                <div class="font-semibold text-gray-800">
                  {{ item.clientName || 'Без имени' }}
                </div>

                <div class="text-sm text-gray-400 mt-1">
                  {{ item.clientPhone || '-' }}
                </div>

                <div class="text-xs text-blue-600 mt-1">
                  {{ item.clientType || '-' }}
                </div>
              </td>

              <td class="table-cell text-gray-700">
                {{ formatFenceType(item.type) }}
              </td>

              <td class="table-cell text-gray-700">
                {{ item.length || 0 }} м
              </td>

              <td class="table-cell text-gray-700">
                {{ item.actualFenceHeight || item.height || 0 }} мм
              </td>

              <td class="table-cell">
                <div class="font-bold text-[#0044AA]">
                  {{ formatPrice(item.totalPrice) }} ₽
                </div>
              </td>

              <td class="table-cell">
                <span
                  class="status-badge"
                  :class="getStatusColor(item.status)"
                >
                  {{ item.status || 'Без статуса' }}
                </span>
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

.create-btn {
  @apply inline-flex items-center justify-center bg-[#0044AA] hover:bg-[#003380] text-white px-6 py-4 rounded-2xl font-semibold transition;
}

.details-btn {
  @apply inline-flex items-center justify-center bg-[#0044AA] hover:bg-[#003380] text-white px-4 py-2 rounded-xl text-sm font-semibold transition;
}

.stats-card {
  @apply bg-white rounded-3xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition;
}

.stats-title {
  @apply text-sm text-gray-400;
}

.stats-value {
  @apply text-3xl font-bold text-gray-800 mt-3;
}

.table-head {
  @apply p-5 text-left text-sm uppercase tracking-wide text-gray-400 font-semibold whitespace-nowrap;
}

.table-cell {
  @apply p-5 whitespace-nowrap;
}

.status-badge {
  @apply px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap;
}
</style>