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

import { useRouter } from 'vue-router'

const requests = ref([])
const loading = ref(true)
const search = ref('')
const selectedClient = ref(null)
const router = useRouter()

const paidStatuses = [
  'Заказ оплачен',
  'В производстве',
  'Готов к отгрузке',
  'Доставляется',
  'Завершен',
]

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

const clients = computed(() => {
  const grouped = {}

  requests.value.forEach((request) => {
    const phone = request.clientPhone || request.id

    if (!grouped[phone]) {
      grouped[phone] = {
        id: phone,
        clientName: request.clientName || 'Без имени',
        clientPhone: request.clientPhone || '-',
        clientEmail: request.clientEmail || '-',
        requestsCount: 0,
        paidOrdersCount: 0,
        revenue: 0,
        averageCheck: 0,
      }
    }

    grouped[phone].requestsCount += 1

    if (paidStatuses.includes(request.status)) {
      grouped[phone].paidOrdersCount += 1
      grouped[phone].revenue += Number(request.totalPrice || 0)
    }

    grouped[phone].averageCheck =
      grouped[phone].paidOrdersCount > 0
        ? Math.round(grouped[phone].revenue / grouped[phone].paidOrdersCount)
        : 0
  })

  return Object.values(grouped)
    .sort((a, b) => b.revenue - a.revenue)
})

const filteredClients = computed(() => {
  return clients.value.filter((client) => {
    const value = search.value.toLowerCase()

    return (
      String(client.clientName || '').toLowerCase().includes(value) ||
      String(client.clientPhone || '').toLowerCase().includes(value) ||
      String(client.clientEmail || '').toLowerCase().includes(value)
    )
  })
})

const totalRevenue = computed(() => {
  return clients.value.reduce((sum, client) => {
    return sum + client.revenue
  }, 0)
})

const totalPaidOrders = computed(() => {
  return clients.value.reduce((sum, client) => {
    return sum + client.paidOrdersCount
  }, 0)
})

const selectedClientRequests = computed(() => {
  if (!selectedClient.value) {
    return []
  }

  return requests.value
    .filter((request) => {
      return (
        request.clientPhone === selectedClient.value.clientPhone
      )
    })
    .sort((a, b) => {
      return (
        Number(b.createdAt?.seconds || 0) -
        Number(a.createdAt?.seconds || 0)
      )
    })
})

const openClientModal = (client) => {
  selectedClient.value = client
}

const closeClientModal = () => {
  selectedClient.value = null
}

const openRequest = (id) => {
  router.push(`/requests/${id}`)
}
</script>

<template>
  <div class="space-y-8">
    <div>
      <h1 class="text-4xl font-bold text-gray-800">
        Клиенты
      </h1>

      <p class="text-gray-400 mt-2">
        База клиентов системы
      </p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
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
          Оплаченных заказов
        </div>

        <div class="kpi-value">
          {{ totalPaidOrders }}
        </div>
      </div>

      <div class="kpi-card">
        <div class="kpi-title">
          Выручка по клиентам
        </div>

        <div class="kpi-value">
          {{ formatPrice(totalRevenue) }} ₽
        </div>
      </div>
    </div>

    <div class="card">
      <input
        v-model="search"
        type="text"
        placeholder="Поиск клиента..."
        class="input"
      />
    </div>

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
        <thead class="bg-gray-50 sticky top-0">
          <tr>
            <th class="table-head">Клиент</th>
            <th class="table-head">Телефон</th>
            <th class="table-head">Email</th>
            <th class="table-head">Заявок</th>
            <th class="table-head">Оплаченных заказов</th>
            <th class="table-head">Средний чек</th>
            <th class="table-head">Выручка</th>
          </tr>
        </thead>

        <tbody>
          <tr
            v-for="client in filteredClients"
            :key="client.id"
            class="border-t border-gray-100 hover:bg-blue-50 transition cursor-pointer"
            @dblclick="openClientModal(client)"
          >
            <td class="table-cell font-semibold">
              {{ client.clientName }}
            </td>

            <td class="table-cell">
              {{ client.clientPhone }}
            </td>

            <td class="table-cell">
              {{ client.clientEmail }}
            </td>

            <td class="table-cell">
              {{ client.requestsCount }}
            </td>

            <td class="table-cell">
              {{ client.paidOrdersCount }}
            </td>

            <td class="table-cell">
              {{ formatPrice(client.averageCheck) }} ₽
            </td>

            <td class="table-cell font-bold text-[#0044AA]">
              {{ formatPrice(client.revenue) }} ₽
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div
  v-if="selectedClient"
  class="modal-overlay"
  @click.self="closeClientModal"
>
  <div class="modal-card">
    <div class="flex items-start justify-between gap-4 mb-6">
      <div>
        <h2 class="text-3xl font-bold text-gray-800">
          {{ selectedClient.clientName }}
        </h2>

        <p class="text-gray-400 mt-2">
          Карточка клиента
        </p>
      </div>

      <button
        @click="closeClientModal"
        class="close-btn"
      >
        ×
      </button>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      <div class="info-box">
        <div class="info-title">Телефон</div>
        <div class="info-value">{{ selectedClient.clientPhone }}</div>
      </div>

      <div class="info-box">
        <div class="info-title">Email</div>
        <div class="info-value">{{ selectedClient.clientEmail }}</div>
      </div>

      <div class="info-box">
        <div class="info-title">Всего заявок</div>
        <div class="info-value">{{ selectedClient.requestsCount }}</div>
      </div>

      <div class="info-box">
        <div class="info-title">Оплаченных заказов</div>
        <div class="info-value">{{ selectedClient.paidOrdersCount }}</div>
      </div>

      <div class="info-box">
        <div class="info-title">Средний чек</div>
        <div class="info-value">{{ formatPrice(selectedClient.averageCheck) }} ₽</div>
      </div>

      <div class="info-box">
        <div class="info-title">Выручка</div>
        <div class="info-value text-[#0044AA]">{{ formatPrice(selectedClient.revenue) }} ₽</div>
      </div>
    </div>

    <h3 class="text-2xl font-bold text-gray-800 mb-4">
      Заявки и заказы клиента
    </h3>

    <div
      v-if="!selectedClientRequests.length"
      class="text-gray-400 py-8 text-center"
    >
      Данные по заявкам не найдены
    </div>

    <div
      v-else
      class="space-y-3 max-h-[300px] overflow-y-auto pr-2"
    >
      <div
        v-for="request in selectedClientRequests"
        :key="request.id"
        class="request-row"
      >
        <div>
          <div class="font-semibold text-gray-800">
            {{ request.status || 'Без статуса' }}
          </div>

          <div class="text-sm text-gray-400 mt-1">
            {{ request.length || 0 }} м · {{ request.height || 0 }} мм
          </div>
        </div>

        <div class="text-right">
          <div class="font-bold text-[#0044AA]">
            {{ formatPrice(request.totalPrice) }} ₽
          </div>

          <button
            @click="openRequest(request.id)"
            class="open-btn mt-2"
          >
            Открыть
          </button>
        </div>
      </div>
    </div>
  </div>
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

.modal-overlay {
  @apply fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4;
}

.modal-card {
  @apply bg-white rounded-3xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-xl;
}

.close-btn {
  @apply w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 text-2xl font-bold transition;
}

.info-box {
  @apply bg-gray-50 rounded-2xl p-4;
}

.info-title {
  @apply text-sm text-gray-400;
}

.info-value {
  @apply text-lg font-bold text-gray-800 mt-2;
}

.request-row {
  @apply flex justify-between gap-4 bg-gray-50 rounded-2xl p-4 border border-gray-100;
}

.open-btn {
  @apply bg-[#0044AA] hover:bg-[#003380] text-white px-4 py-2 rounded-xl text-sm font-semibold transition;
}
</style>