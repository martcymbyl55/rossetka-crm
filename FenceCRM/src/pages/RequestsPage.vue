<script setup>

import {
  collection,
  query,
  orderBy,
  onSnapshot,
  deleteDoc,
  doc,
} from 'firebase/firestore'

import {
  ref,
  computed,
  onMounted,
} from 'vue'

import { useRouter } from 'vue-router'

import { db } from '../firebase'

const router = useRouter()

const loading = ref(true)

const requests = ref([])

const search = ref('')

const selectedStatus = ref('Все')

// ========================================
// STATUS LIST
// ========================================

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

// ========================================
// LOAD REQUESTS
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

    }
  )

})

// ========================================
// HELPERS
// ========================================

const formatFenceType = (type) => {

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

  return type

}

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

// ========================================
// FILTERS
// ========================================

const filteredRequests = computed(() => {

  return requests.value.filter((request) => {

    const matchesSearch =

      request.clientName
        ?.toLowerCase()
        .includes(search.value.toLowerCase())

      ||

      request.clientPhone
        ?.toLowerCase()
        .includes(search.value.toLowerCase())

    const matchesStatus =

      selectedStatus.value === 'Все'
      ||
      request.status === selectedStatus.value

    return matchesSearch && matchesStatus

  })

})

// ========================================
// DELETE
// ========================================

const removeRequest = async (id) => {

  const confirmed = confirm(
    'Удалить заявку?'
  )

  if (!confirmed) {
    return
  }

  try {

    await deleteDoc(
      doc(db, 'requests', id)
    )

    alert('Заявка удалена')

  } catch (error) {

    console.log(error)

    alert('Ошибка удаления')

  }

}

// ========================================
// OPEN
// ========================================

const openRequest = (id) => {

  router.push(`/requests/${id}`)

}

</script>

<template>

  <div class="space-y-6">

    <!-- HEADER -->

    <div class="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">

      <div>

        <h1 class="text-4xl font-bold text-gray-800">
          Все заявки
        </h1>

        <p class="text-gray-400 mt-2">
          Управление заказами и расчетами
        </p>

      </div>

      <button
        @click="router.push('/create-request')"
        class="create-btn"
      >
        + Создать заявку
      </button>

    </div>

    <!-- FILTERS -->

    <div class="card">

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">

        <!-- SEARCH -->

        <div>

          <label class="label">
            Поиск
          </label>

          <input
            v-model="search"
            type="text"
            class="input"
            placeholder="Имя или телефон"
          />

        </div>

        <!-- STATUS -->

        <div>

          <label class="label">
            Статус
          </label>

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

    </div>

    <!-- LOADING -->

    <div
      v-if="loading"
      class="card text-center text-gray-400 py-20"
    >
      Загрузка заявок...
    </div>

    <!-- EMPTY -->

    <div
      v-else-if="filteredRequests.length === 0"
      class="card text-center text-gray-400 py-20"
    >
      Заявки не найдены
    </div>

    <!-- REQUESTS -->

    <div
      v-else
      class="grid grid-cols-1 xl:grid-cols-2 gap-6"
    >

      <div
        v-for="request in filteredRequests"
        :key="request.id"
        class="card hover:shadow-xl transition duration-300"
      >

        <!-- TOP -->

        <div class="flex items-start justify-between gap-4">

          <div>

            <h2 class="text-2xl font-bold text-gray-800">

              {{
                request.clientName ||
                'Без имени'
              }}

            </h2>

            <p class="text-gray-400 mt-1">

              {{
                request.clientPhone ||
                'Телефон не указан'
              }}

            </p>

          </div>

          <span
            class="status-badge"
            :class="getStatusColor(request.status)"
          >
            {{ request.status }}
          </span>

        </div>

        <!-- INFO -->

        <div class="mt-6 space-y-4">

          <div class="line">

            <span>Тип</span>

            <strong>
              {{
                formatFenceType(request.type)
              }}
            </strong>

          </div>

          <div class="line">

            <span>Длина</span>

            <strong>
              {{ request.length || 0 }} м
            </strong>

          </div>

          <div class="line">

            <span>Высота</span>

            <strong>
              {{ request.height || 0 }} мм
            </strong>

          </div>

          <div class="line">

            <span>Ширина</span>

            <strong>
              {{ request.width || 0 }} мм
            </strong>

          </div>

          <div class="line">

            <span>Монтаж</span>

            <strong>
              {{
                request.installationType
              }}
            </strong>

          </div>

          <div class="line">

            <span>Доставка</span>

            <strong>
              {{
                request.deliveryType
              }}
            </strong>

          </div>

        </div>

        <!-- TOTAL -->

        <div class="total-box">

          <div>

            <div class="text-sm text-gray-400">
              Итоговая стоимость
            </div>

            <div class="text-3xl font-bold text-[#0044AA]">

              {{
                Number(
                  request.totalPrice || 0
                ).toLocaleString()
              }} ₽

            </div>

          </div>

        </div>

        <!-- ACTIONS -->

        <div class="flex gap-3 mt-6">

          <button
            @click="openRequest(request.id)"
            class="open-btn"
          >
            Открыть
          </button>

          <button
            @click="removeRequest(request.id)"
            class="delete-btn"
          >
            Удалить
          </button>

        </div>

      </div>

    </div>

  </div>

</template>

<style scoped>

.card {
  @apply bg-white rounded-3xl p-6 shadow-sm border border-gray-100;
}

.label {
  @apply block text-sm font-medium text-gray-600 mb-2;
}

.input {
  @apply w-full border border-gray-200 rounded-2xl px-5 py-4 outline-none focus:border-[#0044AA] transition;
}

.line {
  @apply flex justify-between items-center text-gray-700 py-2 border-b border-gray-100;
}

.total-box {
  @apply border-t pt-5 mt-5;
}

.status-badge {
  @apply px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap;
}

.create-btn {
  @apply bg-[#0044AA] hover:bg-[#003380] text-white py-4 px-6 rounded-2xl font-semibold transition;
}

.open-btn {
  @apply flex-1 bg-[#0044AA] hover:bg-[#003380] text-white py-3 rounded-2xl font-semibold transition;
}

.delete-btn {
  @apply flex-1 bg-red-500 hover:bg-red-600 text-white py-3 rounded-2xl font-semibold transition;
}

</style>