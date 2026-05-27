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

import {
  Bar,
  Doughnut,
  Line,
} from 'vue-chartjs'

import {
  Chart,
  Title,
  Tooltip,
  Legend,
  BarElement,
  ArcElement,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Filler,
} from 'chart.js'

import { db } from '../firebase'

// =====================================
// CHART REGISTER
// =====================================

Chart.register(

  Title,
  Tooltip,
  Legend,

  BarElement,
  ArcElement,

  LineElement,
  PointElement,

  CategoryScale,
  LinearScale,

  Filler,

)

// =====================================
// DATA
// =====================================

const requests = ref([])

const loading = ref(true)

// =====================================
// HELPERS
// =====================================

const formatFenceType = (type) => {

  if (type === '3d') {
    return '3D забор'
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

  return 'Не указано'

}

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
// KPI
// =====================================

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

const completedCount = computed(() => {

  return requests.value.filter(

    (item) =>
      item.status === 'Завершен'

  ).length

})

const installationCount = computed(() => {

  return requests.value.filter(

    (item) =>

      item.installationType &&
      item.installationType !==
      'Без монтажа'

  ).length

})

// =====================================
// TYPES
// =====================================

const typeStats = computed(() => {

  const result = {}

  requests.value.forEach((item) => {

    const type =
      formatFenceType(item.type)

    if (!result[type]) {
      result[type] = 0
    }

    result[type]++

  })

  return result

})

const typeChartData = computed(() => ({

  labels: Object.keys(
    typeStats.value
  ),

  datasets: [

    {

      label: 'Количество',

      data: Object.values(
        typeStats.value
      ),

      backgroundColor: [

        '#0044AA',
        '#10B981',
        '#F59E0B',
        '#8B5CF6',

      ],

      borderRadius: 12,

    },

  ],

}))

// =====================================
// STATUS
// =====================================

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

const statusChartData = computed(() => ({

  labels: Object.keys(
    statusStats.value
  ),

  datasets: [

    {

      data: Object.values(
        statusStats.value
      ),

      backgroundColor: [

        '#3B82F6',
        '#10B981',
        '#F59E0B',
        '#EF4444',
        '#8B5CF6',
        '#14B8A6',
        '#6B7280',

      ],

      borderWidth: 0,

    },

  ],

}))

// =====================================
// REVENUE
// =====================================

const revenueChartData = computed(() => ({

  labels: requests.value.map(

    (_, index) =>
      `#${index + 1}`

  ),

  datasets: [

    {

      label: 'Выручка',

      data: requests.value.map(

        (item) =>
          Number(item.totalPrice || 0)

      ),

      borderColor: '#0044AA',

      backgroundColor:
        'rgba(0,68,170,0.12)',

      fill: true,

      tension: 0.4,

    },

  ],

}))

// =====================================
// OPTIONS
// =====================================

const chartOptions = {

  responsive: true,

  maintainAspectRatio: false,

  plugins: {

    legend: {

      position: 'bottom',

    },

  },

}

</script>

<template>

  <div class="space-y-8">

    <!-- HEADER -->

    <div>

      <h1 class="text-4xl font-bold text-gray-800">
        Аналитика CRM
      </h1>

      <p class="text-gray-400 mt-2">
        Статистика заявок и продаж
      </p>

    </div>

    <!-- LOADING -->

    <div
      v-if="loading"
      class="text-center py-20 text-gray-400"
    >
      Загрузка аналитики...
    </div>

    <template v-else>

      <!-- KPI -->

      <div
        class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5"
      >

        <div class="kpi-card">

          <div class="kpi-title">
            Всего заявок
          </div>

          <div class="kpi-value">
            {{ requests.length }}
          </div>

        </div>

        <div class="kpi-card">

          <div class="kpi-title">
            Общая выручка
          </div>

          <div class="kpi-value">
            {{ Number(totalRevenue).toLocaleString() }} ₽
          </div>

        </div>

        <div class="kpi-card">

          <div class="kpi-title">
            Средний чек
          </div>

          <div class="kpi-value">
            {{ Number(averageCheck).toLocaleString() }} ₽
          </div>

        </div>

        <div class="kpi-card">

          <div class="kpi-title">
            Завершенные заявки
          </div>

          <div class="kpi-value">
            {{ completedCount }}
          </div>

        </div>

      </div>

      <!-- SECOND KPI -->

      <div
        class="grid grid-cols-1 md:grid-cols-2 gap-5"
      >

        <div class="small-card">

          <div class="small-title">
            Монтажей
          </div>

          <div class="small-value">
            {{ installationCount }}
          </div>

        </div>

        <div class="small-card">

          <div class="small-title">
            Конверсия завершения
          </div>

          <div class="small-value">

            {{

              requests.length

                ? Math.round(
                    (completedCount /
                      requests.length) *
                      100
                  )

                : 0

            }}%

          </div>

        </div>

      </div>

      <!-- CHARTS -->

      <div
        class="grid grid-cols-1 xl:grid-cols-2 gap-6"
      >

        <!-- TYPES -->

        <div class="card">

          <h2 class="title">
            Типы ограждений
          </h2>

          <div class="chart-container">

            <Bar
              :data="typeChartData"
              :options="chartOptions"
            />

          </div>

        </div>

        <!-- STATUS -->

        <div class="card">

          <h2 class="title">
            Статусы заявок
          </h2>

          <div class="chart-container">

            <Doughnut
              :data="statusChartData"
              :options="chartOptions"
            />

          </div>

        </div>

      </div>

      <!-- REVENUE -->

      <div class="card">

        <h2 class="title">
          Динамика выручки
        </h2>

        <div class="revenue-chart">

          <Line
            :data="revenueChartData"
            :options="chartOptions"
          />

        </div>

      </div>

    </template>

  </div>

</template>

<style scoped>

.card {
  @apply bg-white rounded-3xl p-6 border border-gray-100 shadow-sm;
}

.title {
  @apply text-2xl font-bold text-gray-800 mb-6;
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

.small-card {
  @apply bg-white rounded-3xl p-5 border border-gray-100 shadow-sm;
}

.small-title {
  @apply text-sm text-gray-400;
}

.small-value {
  @apply text-2xl font-bold mt-3 text-gray-800;
}

.chart-container {
  height: 320px;
}

.revenue-chart {
  height: 400px;
}

</style>