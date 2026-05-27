<script setup>

import {
  collection,
  onSnapshot,
  query,
  orderBy,
} from 'firebase/firestore'

import {
  ref,
  computed,
  onMounted,
} from 'vue'

import { RouterLink } from 'vue-router'

import {
  Bar,
  Doughnut,
} from 'vue-chartjs'

import {
  Chart,
  Title,
  Tooltip,
  Legend,
  BarElement,
  ArcElement,
  CategoryScale,
  LinearScale,
} from 'chart.js'

import { db } from '../firebase'

Chart.register(
  Title,
  Tooltip,
  Legend,
  BarElement,
  ArcElement,
  CategoryScale,
  LinearScale
)

// ========================================
// STATE
// ========================================

const requests = ref([])

const loading = ref(true)

// ========================================
// LOAD DATA
// ========================================

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

// ========================================
// HELPERS
// ========================================

const safeNumber = (value) => {

  const number = Number(value)

  return Number.isFinite(number)
    ? number
    : 0

}

const formatPrice = (value) => {

  return safeNumber(value)
    .toLocaleString('ru-RU')

}

const formatFenceType = (type) => {

  if (type === '3d') {
    return '3D ограждение'
  }

  if (type === 'gabion') {
    return 'Габион'
  }

  if (type === 'temporary') {
    return 'Временное'
  }

  if (type === 'welded') {
    return 'Сварное'
  }

  return type || '-'

}

// ========================================
// ANALYTICS
// ========================================

const totalRevenue = computed(() => {

  return requests.value.reduce(
    (sum, item) => {

      return (
        sum +
        safeNumber(item.totalPrice)
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

const newRequests = computed(() => {

  return requests.value.filter(

    (item) =>
      item.status === 'Новая заявка'

  ).length

})

const completedRequests = computed(() => {

  return requests.value.filter(

    (item) =>
      item.status === 'Завершен'

  ).length

})

// ========================================
// STATUS STATS
// ========================================

const statusStats = computed(() => {

  const result = {}

  requests.value.forEach((item) => {

    const status =
      item.status || 'Без статуса'

    if (!result[status]) {

      result[status] = 0

    }

    result[status]++

  })

  return result

})

// ========================================
// CHART DATA
// ========================================

const chartData = computed(() => ({

  labels: Object.keys(
    statusStats.value
  ),

  datasets: [

    {

      label: 'Заявки',

      data: Object.values(
        statusStats.value
      ),

      backgroundColor: [

        '#3B82F6',
        '#10B981',
        '#F59E0B',
        '#8B5CF6',
        '#EF4444',
        '#06B6D4',
        '#EC4899',
        '#6B7280',

      ],

      borderWidth: 0,

    },

  ],

}))

const chartOptions = {

  responsive: true,

  maintainAspectRatio: false,

  plugins: {

    legend: {

      position: 'bottom',

    },

  },

}

const revenueChartData = computed(() => ({

  labels: requests.value
    .slice(0, 7)
    .map((item) => item.clientName || 'Клиент'),

  datasets: [

    {

      label: 'Стоимость заказа',

      data: requests.value
        .slice(0, 7)
        .map(
          (item) =>
            safeNumber(item.totalPrice)
        ),

      backgroundColor: '#0044AA',

      borderRadius: 12,

    },

  ],

}))

const revenueChartOptions = {

  responsive: true,

  maintainAspectRatio: false,

  plugins: {

    legend: {

      display: false,

    },

  },

}

// ========================================
// STATUS COLORS
// ========================================

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

  <!-- LOADING -->

  <div
    v-if="loading"
    class="flex items-center justify-center h-[70vh]"
  >

    <div class="text-gray-400 text-lg">
      Загрузка dashboard...
    </div>

  </div>

  <!-- CONTENT -->

  <div
    v-else
    class="space-y-8"
  >

    <!-- HEADER -->

    <div>

      <h1 class="text-4xl font-bold text-gray-800">
        Dashboard
      </h1>

      <p class="text-gray-400 mt-2">
        Аналитика CRM системы
      </p>

    </div>

    <!-- KPI -->

    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">

      <div class="kpi-card">

        <div class="kpi-label">
          Всего заказов
        </div>

        <div class="kpi-value">
          {{ requests.length }}
        </div>

      </div>

      <div class="kpi-card">

        <div class="kpi-label">
          Выручка
        </div>

        <div class="kpi-value">
          {{ formatPrice(totalRevenue) }} ₽
        </div>

      </div>

      <div class="kpi-card">

        <div class="kpi-label">
          Средний чек
        </div>

        <div class="kpi-value">
          {{ formatPrice(averageCheck) }} ₽
        </div>

      </div>

      <div class="kpi-card">

        <div class="kpi-label">
          Завершенные
        </div>

        <div class="kpi-value">
          {{ completedRequests }}
        </div>

      </div>

    </div>

    <!-- CHARTS -->

    <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">

      <!-- STATUS CHART -->

      <div class="card">

        <div class="flex items-center justify-between mb-6">

          <h2 class="title">
            Статусы заявок
          </h2>

          <div class="badge">
            {{ requests.length }} заявок
          </div>

        </div>

        <div class="chart-box">

          <Doughnut
            :data="chartData"
            :options="chartOptions"
          />

        </div>

      </div>

      <!-- REVENUE CHART -->

      <div class="card">

        <div class="flex items-center justify-between mb-6">

          <h2 class="title">
            Выручка по заказам
          </h2>

          <div class="badge">
            TOP 7
          </div>

        </div>

        <div class="chart-box">

          <Bar
            :data="revenueChartData"
            :options="revenueChartOptions"
          />

        </div>

      </div>

    </div>

    <!-- LAST REQUESTS -->

    <div class="card">

      <div class="flex items-center justify-between mb-6">

        <div>

          <h2 class="title">
            Последние заявки
          </h2>

          <p class="text-sm text-gray-400 mt-1">
            Последние добавленные заказы
          </p>

        </div>

        <RouterLink
          to="/requests"
          class="link-btn"
        >
          Смотреть все
        </RouterLink>

      </div>

      <!-- EMPTY -->

      <div
        v-if="!requests.length"
        class="empty-box"
      >
        Заявок пока нет
      </div>

      <!-- REQUESTS -->

      <div
        v-else
        class="space-y-4"
      >

        <RouterLink
          v-for="request in requests.slice(0, 5)"
          :key="request.id"
          :to="`/requests/${request.id}`"
          class="request-item"
        >

          <!-- LEFT -->

          <div class="space-y-2">

            <div class="flex items-center gap-3">

              <div class="client-name">
                {{ request.clientName || 'Без имени' }}
              </div>

              <span
                class="status-badge"
                :class="getStatusColor(request.status)"
              >
                {{ request.status }}
              </span>

            </div>

            <div class="request-info">

              <span>
                {{ formatFenceType(request.type) }}
              </span>

              <span>
                {{ request.length || 0 }} м
              </span>

            </div>

          </div>

          <!-- RIGHT -->

          <div class="text-right">

            <div class="request-price">
              {{ formatPrice(request.totalPrice) }} ₽
            </div>

            <div class="request-date">

              {{
                request.createdAt
                  ?.toDate?.()
                  ?.toLocaleDateString?.() || ''
              }}

            </div>

          </div>

        </RouterLink>

      </div>

    </div>

  </div>

</template>

<style scoped>

.card {
  @apply bg-white rounded-3xl p-6 shadow-sm border border-gray-100;
}

.title {
  @apply text-2xl font-bold text-gray-800;
}

.kpi-card {
  @apply bg-white rounded-3xl p-6 border border-gray-100 shadow-sm;
}

.kpi-label {
  @apply text-sm text-gray-400;
}

.kpi-value {
  @apply text-3xl font-bold mt-3 text-[#0044AA];
}

.chart-box {
  @apply h-[350px];
}

.badge {
  @apply bg-blue-50 text-[#0044AA] px-4 py-2 rounded-2xl text-sm font-semibold;
}

.link-btn {
  @apply text-[#0044AA] font-semibold hover:underline;
}

.request-item {
  @apply border border-gray-100 rounded-3xl p-5 flex justify-between items-center hover:bg-gray-50 transition;
}

.client-name {
  @apply font-semibold text-gray-800 text-lg;
}

.request-info {
  @apply flex items-center gap-3 text-sm text-gray-400;
}

.request-price {
  @apply text-xl font-bold text-[#0044AA];
}

.request-date {
  @apply text-xs text-gray-400 mt-1;
}

.status-badge {
  @apply px-3 py-1 rounded-xl text-xs font-semibold;
}

.empty-box {
  @apply text-center py-16 text-gray-400;
}

</style>