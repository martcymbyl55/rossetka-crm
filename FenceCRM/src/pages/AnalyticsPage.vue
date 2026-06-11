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
  Line,
} from 'vue-chartjs'

import {
  Chart,
  Title,
  Tooltip,
  Legend,
  BarElement,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Filler,
} from 'chart.js'

import { db } from '../firebase'

Chart.register(
  Title,
  Tooltip,
  Legend,
  BarElement,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Filler,
)

const requests = ref([])
const loading = ref(true)

const startDate = ref('')
const endDate = ref('')

onMounted(() => {
  onSnapshot(collection(db, 'requests'), (snapshot) => {
    requests.value = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))

    loading.value = false
  })
})

const formatPrice = (value) => {
  return Number(value || 0).toLocaleString('ru-RU')
}

const getCreatedDate = (item) => {
  if (!item.createdAt) return null

  if (item.createdAt?.seconds) {
    return new Date(item.createdAt.seconds * 1000)
  }

  return new Date(item.createdAt)
}

const filteredRequests = computed(() => {
  return requests.value.filter((item) => {
    const createdAt = getCreatedDate(item)

    if (!createdAt) return true

    if (startDate.value) {
      const start = new Date(startDate.value)
      start.setHours(0, 0, 0, 0)

      if (createdAt < start) return false
    }

    if (endDate.value) {
      const end = new Date(endDate.value)
      end.setHours(23, 59, 59, 999)

      if (createdAt > end) return false
    }

    return true
  })
})

const setPeriodAll = () => {
  startDate.value = ''
  endDate.value = ''
}

const setPeriodMonth = () => {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), 1)

  startDate.value = start.toISOString().slice(0, 10)
  endDate.value = now.toISOString().slice(0, 10)
}

const setPeriodYear = () => {
  const now = new Date()
  const start = new Date(now.getFullYear(), 0, 1)

  startDate.value = start.toISOString().slice(0, 10)
  endDate.value = now.toISOString().slice(0, 10)
}

const normalizeText = (value, emptyLabel) => {
  const text = String(value || '').trim()

  if (!text) {
    return emptyLabel
  }

  return text
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/^./, (letter) => letter.toUpperCase())
}

const groupByNormalizedField = (field, emptyLabel) => {
  const result = {}

  filteredRequests.value.forEach((item) => {
    const key = normalizeText(item[field], emptyLabel)

    if (!result[key]) {
      result[key] = 0
    }

    result[key]++
  })

  return result
}

const countByStatus = (status) => {
  return filteredRequests.value.filter((item) => item.status === status).length
}

const totalRequests = computed(() => filteredRequests.value.length)

const calculatedCount = computed(() => countByStatus('Заказ рассчитан'))
const offerSentCount = computed(() => countByStatus('КП отправлено'))
const waitingClientCount = computed(() => countByStatus('Ожидает решение клиента'))
const paidCount = computed(() => countByStatus('Заказ оплачен'))
const completedCount = computed(() => countByStatus('Завершен'))
const canceledCount = computed(() => countByStatus('Заказ отменен'))

const paidStatuses = [
  'Заказ оплачен',
  'В производстве',
  'Готов к отгрузке',
  'Доставляется',
  'Завершен',
]

const paidOrders = computed(() => {
  return filteredRequests.value.filter((item) => paidStatuses.includes(item.status))
})

const totalRevenue = computed(() => {
  return filteredRequests.value.reduce((sum, item) => {
    return sum + Number(item.totalPrice || 0)
  }, 0)
})

const paidRevenue = computed(() => {
  return paidOrders.value.reduce((sum, item) => {
    return sum + Number(item.totalPrice || 0)
  }, 0)
})

const lostRevenue = computed(() => {
  return filteredRequests.value
    .filter((item) => item.status === 'Заказ отменен')
    .reduce((sum, item) => {
      return sum + Number(item.totalPrice || 0)
    }, 0)
})

const averageCheck = computed(() => {
  if (!paidOrders.value.length) return 0
  return Math.round(paidRevenue.value / paidOrders.value.length)
})

const conversionToPaid = computed(() => {
  if (!totalRequests.value) return 0
  return Math.round((paidOrders.value.length / totalRequests.value) * 100)
})

const conversionToCompleted = computed(() => {
  if (!totalRequests.value) return 0
  return Math.round((completedCount.value / totalRequests.value) * 100)
})

const sourceStats = computed(() => {
  return groupByNormalizedField('source', 'Источник не указан')
})

const cityStats = computed(() => {
  return groupByNormalizedField('city', 'Город не указан')
})

const funnelChartData = computed(() => ({
  labels: [
    'Всего заявок',
    'Рассчитано',
    'КП отправлено',
    'Ожидает решение',
    'Оплачено',
    'Завершено',
    'Отменено',
  ],
  datasets: [
    {
      label: 'Количество',
      data: [
        totalRequests.value,
        calculatedCount.value,
        offerSentCount.value,
        waitingClientCount.value,
        paidOrders.value.length,
        completedCount.value,
        canceledCount.value,
      ],
      backgroundColor: '#0044AA',
      borderRadius: 12,
    },
  ],
}))

const sourceChartData = computed(() => ({
  labels: Object.keys(sourceStats.value),
  datasets: [
    {
      label: 'Заявки',
      data: Object.values(sourceStats.value),
      backgroundColor: '#0044AA',
      borderRadius: 12,
    },
  ],
}))

const cityChartData = computed(() => ({
  labels: Object.keys(cityStats.value),
  datasets: [
    {
      label: 'Заявки',
      data: Object.values(cityStats.value),
      backgroundColor: '#10B981',
      borderRadius: 12,
    },
  ],
}))

const revenueChartData = computed(() => ({
  labels: filteredRequests.value.map((_, index) => `#${index + 1}`),
  datasets: [
    {
      label: 'Сумма заявки',
      data: filteredRequests.value.map((item) => Number(item.totalPrice || 0)),
      borderColor: '#0044AA',
      backgroundColor: 'rgba(0,68,170,0.12)',
      fill: true,
      tension: 0.4,
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
</script>

<template>
  <div class="space-y-8">
    <div>
      <h1 class="text-4xl font-bold text-gray-800">
        Аналитика
      </h1>

      <p class="text-gray-400 mt-2">
        Статистика заявок, источников, городов и продаж
      </p>
    </div>

    <div class="card">
      <h2 class="title">
        Период аналитики
      </h2>

      <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div>
          <label class="label">С даты</label>
          <input
            v-model="startDate"
            type="date"
            class="input"
          />
        </div>

        <div>
          <label class="label">По дату</label>
          <input
            v-model="endDate"
            type="date"
            class="input"
          />
        </div>

        <button
          @click="setPeriodMonth"
          class="filter-btn"
        >
          Текущий месяц
        </button>

        <button
          @click="setPeriodYear"
          class="filter-btn"
        >
          Текущий год
        </button>

        <button
          @click="setPeriodAll"
          class="filter-btn"
        >
          Все время
        </button>
      </div>
    </div>

    <div
      v-if="loading"
      class="text-center py-20 text-gray-400"
    >
      Загрузка аналитики...
    </div>

    <template v-else>
      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        <div class="kpi-card">
          <div class="kpi-title">Всего заявок</div>
          <div class="kpi-value">{{ totalRequests }}</div>
        </div>

        <div class="kpi-card">
          <div class="kpi-title">Сумма всех заявок</div>
          <div class="kpi-value">{{ formatPrice(totalRevenue) }} ₽</div>
        </div>

        <div class="kpi-card">
          <div class="kpi-title">Сумма оплаченных</div>
          <div class="kpi-value">{{ formatPrice(paidRevenue) }} ₽</div>
        </div>

        <div class="kpi-card">
          <div class="kpi-title">Средний чек</div>
          <div class="kpi-value">{{ formatPrice(averageCheck) }} ₽</div>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        <div class="small-card">
          <div class="small-title">КП отправлено</div>
          <div class="small-value">{{ offerSentCount }}</div>
        </div>

        <div class="small-card">
          <div class="small-title">Оплачено</div>
          <div class="small-value">{{ paidOrders.length }}</div>
        </div>

        <div class="small-card">
          <div class="small-title">Завершено</div>
          <div class="small-value">{{ completedCount }}</div>
        </div>

        <div class="small-card">
          <div class="small-title">Потерянная выручка</div>
          <div class="small-value">{{ formatPrice(lostRevenue) }} ₽</div>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div class="small-card">
          <div class="small-title">Конверсия в оплату</div>
          <div class="small-value">{{ conversionToPaid }}%</div>
        </div>

        <div class="small-card">
          <div class="small-title">Конверсия в завершение</div>
          <div class="small-value">{{ conversionToCompleted }}%</div>
        </div>
      </div>

      <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div class="card">
          <h2 class="title">
            Воронка заявок
          </h2>

          <div class="chart-container">
            <Bar
              :data="funnelChartData"
              :options="chartOptions"
            />
          </div>
        </div>

        <div class="card">
          <h2 class="title">
            Источники обращений
          </h2>

          <div class="chart-container">
            <Bar
              :data="sourceChartData"
              :options="chartOptions"
            />
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div class="card">
          <h2 class="title">
            Города заявок
          </h2>

          <div class="chart-container">
            <Bar
              :data="cityChartData"
              :options="chartOptions"
            />
          </div>
        </div>

        <div class="card">
          <h2 class="title">
            Динамика стоимости заявок
          </h2>

          <div class="chart-container">
            <Line
              :data="revenueChartData"
              :options="chartOptions"
            />
          </div>
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

.label {
  @apply block text-sm font-medium text-gray-600 mb-2;
}

.input {
  @apply w-full border border-gray-200 rounded-2xl px-5 py-4 outline-none focus:border-[#0044AA] transition;
}

.filter-btn {
  @apply self-end bg-[#0044AA] hover:bg-[#003380] text-white py-4 px-5 rounded-2xl font-semibold transition;
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
</style>