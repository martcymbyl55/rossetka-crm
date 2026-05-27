<script setup>

import {
  doc,
  getDoc,
  updateDoc,
  collection,
  addDoc,
  serverTimestamp,
  onSnapshot,
  query,
  orderBy,
  deleteDoc,
} from 'firebase/firestore'

import {
  reactive,
  ref,
  onMounted,
  computed,
} from 'vue'

import { useRoute, useRouter } from 'vue-router'

import { db } from '../firebase'

import {
  calculateOrder,
} from '../utils/orderCalculator'

import {
  exportRequestToWord,
} from '../utils/exportRequestToWord'

import {
  addHistoryRecord,
} from '../utils/historyService'

const route = useRoute()
const router = useRouter()

const loading = ref(true)
const editMode = ref(false)

const comments = ref([])
const history = ref([])

const newComment = ref('')

// ========================================
// ЗАЯВКА
// ========================================

const request = reactive({

  clientName: '',
  clientPhone: '',
  clientEmail: '',

  clientType: 'Физическое лицо',

  type: '3d',

  length: 50,

  height: 1530,
  customHeight: '',

  width: 2500,
  customWidth: '',

  wire: '4',
  customWire: '',

  pillars: '60x40',
  customPillars: '',

  gate: 'none',
  wicket: 'none',

  color: 'green',
  customColor: '',

  deliveryType: 'Самовывоз',
  distance: 0,

  installationType: 'Без монтажа',

  customDiscount: 0,

  status: 'Новая заявка',

  comment: '',

})

// ========================================
// STATUS
// ========================================

const statuses = [

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
// HELPERS
// ========================================

const formatFenceType = (type) => {

  if (type === '3d') return '3D забор'
  if (type === 'gabion') return 'Габион'
  if (type === 'temporary') return 'Временное ограждение'
  if (type === 'welded') return 'Сварные ограждения'

  return type

}

const formatGate = (value) => {

  if (value === 'none') return 'Нет'
  if (value === 'sliding') return 'Откатные'
  if (value === 'swing') return 'Распашные'

  return value

}

const formatWicket = (value) => {

  if (value === 'none') return 'Нет'
  if (value === 'hooks') return 'С проушинами'
  if (value === 'lock') return 'С врезным замком'

  return value

}

// ========================================
// FINAL VALUES
// ========================================

const finalWidth = computed(() => {

  if (request.width === 'custom') {
    return Number(request.customWidth)
  }

  return Number(request.width)

})

const finalHeight = computed(() => {

  if (request.height === 'custom') {
    return Number(request.customHeight)
  }

  return Number(request.height)

})

const finalWire = computed(() => {

  if (request.wire === 'custom') {
    return Number(request.customWire)
  }

  return Number(request.wire)

})

// ========================================
// CALCULATION
// ========================================

const calculation = computed(() => {

  return calculateOrder({

    ...request,

    width: finalWidth.value,
    height: finalHeight.value,
    wire: finalWire.value,

  })

})

const totalPrice = computed(() => {
  return calculation.value.totalPrice || 0
})

// ========================================
// LOAD REQUEST
// ========================================

onMounted(async () => {

  try {

    const docRef = doc(
      db,
      'requests',
      route.params.id
    )

    const snapshot = await getDoc(docRef)

    if (snapshot.exists()) {

      Object.assign(
        request,
        snapshot.data()
      )

    }

    // COMMENTS

    const commentsQuery = query(

      collection(
        db,
        'requests',
        route.params.id,
        'comments'
      ),

      orderBy('createdAt', 'desc')

    )

    onSnapshot(
      commentsQuery,
      (snapshot) => {

        comments.value = snapshot.docs.map((doc) => ({

          id: doc.id,
          ...doc.data(),

        }))

      }
    )

    // HISTORY

    const historyQuery = query(

      collection(
        db,
        'requests',
        route.params.id,
        'history'
      ),

      orderBy('createdAt', 'desc')

    )

    onSnapshot(
      historyQuery,
      (snapshot) => {

        history.value = snapshot.docs.map((doc) => ({

          id: doc.id,
          ...doc.data(),

        }))

      }
    )

  } catch (error) {

    console.log(error)

    alert('Ошибка загрузки заявки')

  } finally {

    loading.value = false

  }

})

// ========================================
// SAVE REQUEST
// ========================================

const saveRequest = async () => {

  try {

    await updateDoc(

      doc(
        db,
        'requests',
        route.params.id
      ),

      {

        ...request,

        length: Number(request.length),

        height: finalHeight.value,

        width: finalWidth.value,

        wire: finalWire.value,

        distance: Number(request.distance),

        customDiscount: Number(request.customDiscount),

        totalPrice: totalPrice.value,

      }

    )
    await addHistoryRecord(

      route.params.id,

      'Изменение статуса',

      `Новый статус: ${request.status}`

    )
    await addDoc(

      collection(
        db,
        'requests',
        route.params.id,
        'history'
      ),

      {

        action: 'Редактирование заявки',

        createdAt: serverTimestamp(),

      }

    )

    editMode.value = false

    alert('Заявка обновлена')

  } catch (error) {

    console.log(error)

    alert('Ошибка обновления')

  }

}

// ========================================
// DELETE REQUEST
// ========================================

const deleteRequest = async () => {

  const confirmDelete = confirm(
    'Удалить заявку?'
  )

  if (!confirmDelete) {
    return
  }

  try {

    await deleteDoc(

      doc(
        db,
        'requests',
        route.params.id
      )

    )

    alert('Заявка удалена')

    router.push('/requests')

  } catch (error) {

    console.log(error)

    alert('Ошибка удаления')

  }

}

// ========================================
// SAVE STATUS
// ========================================

const saveStatus = async () => {

  try {

    await updateDoc(

      doc(
        db,
        'requests',
        route.params.id
      ),

      {

        status: request.status,

      }

    )

    await addDoc(

      collection(
        db,
        'requests',
        route.params.id,
        'history'
      ),

      {

        action: 'Изменение статуса',

        status: request.status,

        createdAt: serverTimestamp(),

      }

    )

    alert('Статус обновлен')

  } catch (error) {

    console.log(error)

    alert('Ошибка обновления статуса')

  }

}

// ========================================
// COMMENTS
// ========================================

const addComment = async () => {

  if (!newComment.value.trim()) {
    return
  }

  try {

    await addDoc(

      collection(
        db,
        'requests',
        route.params.id,
        'comments'
      ),

      {

        text: newComment.value,

        createdAt: serverTimestamp(),

        author: 'Менеджер',

      }

    )

    await addDoc(

      collection(
        db,
        'requests',
        route.params.id,
        'history'
      ),

      {

        action: 'Добавлен комментарий',

        createdAt: serverTimestamp(),

      }

    )

    newComment.value = ''

    await addHistoryRecord(

      route.params.id,

      'Комментарий',

      'Добавлен комментарий'

    )

  } catch (error) {

    console.log(error)

    alert('Ошибка комментария')

  }


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

  <div
    v-if="loading"
    class="text-center py-20 text-gray-400"
  >
    Загрузка заявки...
  </div>

  <div
    v-else
    class="space-y-6"
  >

    <!-- HEADER -->

    <div class="flex items-center justify-between flex-wrap gap-4">

      <div>

        <h1 class="text-4xl font-bold text-gray-800">
          Карточка заявки
        </h1>

        <p class="text-gray-400 mt-2">
          Полная информация о заказе
        </p>

      </div>

      <div class="flex gap-3 flex-wrap">

        <button
          @click="exportRequestToWord({
            ...request,
            totalPrice,
          })"
          class="export-btn"
        >
          Скачать КП
        </button>

        <button
          v-if="!editMode"
          @click="editMode = true"
          class="save-btn"
        >
          Редактировать
        </button>

        <button
          v-else
          @click="saveRequest"
          class="save-btn"
        >
          Сохранить
        </button>

        <button
          @click="deleteRequest"
          class="delete-btn"
        >
          Удалить
        </button>

      </div>

    </div>

    <!-- GRID -->

    <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">

      <!-- LEFT -->

      <div class="xl:col-span-2 space-y-6">

        <!-- CLIENT -->

        <div class="card">

          <h2 class="title">
            Клиент
          </h2>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">

            <div>

              <label class="label">
                ФИО клиента
              </label>

              <input
                v-model="request.clientName"
                :disabled="!editMode"
                class="input"
              />

            </div>

            <div>

              <label class="label">
                Телефон
              </label>

              <input
                v-model="request.clientPhone"
                :disabled="!editMode"
                class="input"
              />

            </div>

            <div class="md:col-span-2">

              <label class="label">
                Email
              </label>

              <input
                v-model="request.clientEmail"
                :disabled="!editMode"
                class="input"
              />

            </div>

          </div>

        </div>

        <!-- ORDER -->

        <div class="card">

          <h2 class="title">
            Параметры заказа
          </h2>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">

            <div>

              <label class="label">
                Тип ограждения
              </label>

              <select
                v-model="request.type"
                :disabled="!editMode"
                class="input"
              >

                <option value="3d">
                  3D забор
                </option>

                <option value="gabion">
                  Габион
                </option>

                <option value="temporary">
                  Временное ограждение
                </option>

                <option value="welded">
                  Сварные ограждения
                </option>

              </select>

            </div>

            <div>

              <label class="label">
                Длина (м)
              </label>

              <input
                v-model="request.length"
                type="number"
                :disabled="!editMode"
                class="input"
              />

            </div>

            <div>

              <label class="label">
                Высота (мм)
              </label>

              <input
                v-model="request.height"
                type="number"
                :disabled="!editMode"
                class="input"
              />

            </div>

            <div>

              <label class="label">
                Ширина (мм)
              </label>

              <input
                v-model="request.width"
                type="number"
                :disabled="!editMode"
                class="input"
              />

            </div>

            <div>

              <label class="label">
                Диаметр проволоки (мм)
              </label>

              <input
                v-model="request.wire"
                :disabled="!editMode"
                class="input"
              />

            </div>

            <div>

              <label class="label">
                Столбы
              </label>

              <input
                v-model="request.pillars"
                :disabled="!editMode"
                class="input"
              />

            </div>

            <div>

              <label class="label">
                Калитка
              </label>

              <input
                :value="formatWicket(request.wicket)"
                disabled
                class="input"
              />

            </div>

            <div>

              <label class="label">
                Ворота
              </label>

              <input
                :value="formatGate(request.gate)"
                disabled
                class="input"
              />

            </div>

            <div>

              <label class="label">
                Цвет
              </label>

              <input
                v-model="request.color"
                :disabled="!editMode"
                class="input"
              />

            </div>

          </div>

        </div>

        <!-- STATUS -->

        <div class="card">

          <h2 class="title">
            Статус заявки
          </h2>

          <div class="flex gap-4">

            <select
              v-model="request.status"
              class="input"
            >

              <option
                v-for="status in statuses"
                :key="status"
              >
                {{ status }}
              </option>

            </select>

            <button
              @click="saveStatus"
              class="save-btn"
            >
              Обновить
            </button>

          </div>

        </div>

        <!-- COMMENTS -->

        <div class="card">

          <h2 class="title">
            Комментарии
          </h2>

          <textarea
            v-model="newComment"
            rows="4"
            class="input resize-none"
            placeholder="Введите комментарий..."
          />

          <button
            @click="addComment"
            class="save-btn mt-4"
          >
            Добавить комментарий
          </button>

          <div class="space-y-4 mt-6">

            <div
              v-for="comment in comments"
              :key="comment.id"
              class="comment-box"
            >

              <div class="flex justify-between mb-2">

                <div class="font-semibold">
                  {{ comment.author }}
                </div>

                <div class="text-xs text-gray-400">

                  {{
                    comment.createdAt
                      ?.toDate?.()
                      ?.toLocaleString()
                  }}

                </div>

              </div>

              <div class="text-gray-700">
                {{ comment.text }}
              </div>

            </div>

          </div>

        </div>

        <!-- HISTORY -->

        <div class="card">

          <h2 class="title">
            История изменений
          </h2>

          <div class="space-y-3">

            <div
              v-for="item in history"
              :key="item.id"
              class="history-box"
            >

              <div class="font-semibold text-gray-800">
                {{ item.action }}
              </div>

              <div
                v-if="item.status"
                class="text-sm text-gray-500 mt-1"
              >
                Статус: {{ item.status }}
              </div>

              <div class="text-xs text-gray-400 mt-2">

                {{
                  item.createdAt
                    ?.toDate?.()
                    ?.toLocaleString()
                }}

              </div>

            </div>

          </div>

        </div>

      </div>

      <!-- RIGHT -->

      <div>

        <div class="card sticky top-6">

          <h2 class="title">
            Итоговый расчет
          </h2>

          <div class="space-y-4">

            <div class="line">

              <span>Тип</span>

              <strong>
                {{ formatFenceType(request.type) }}
              </strong>

            </div>

            <div class="line">

              <span>Длина</span>

              <strong>
                {{ request.length }} м
              </strong>

            </div>

            <div class="line">

              <span>Высота</span>

              <strong>
                {{ finalHeight }} мм
              </strong>

            </div>

            <div class="line">

              <span>Ширина</span>

              <strong>
                {{ finalWidth }} мм
              </strong>

            </div>

            <div class="line">

              <span>Монтаж</span>

              <strong>
                {{ request.installationType }}
              </strong>

            </div>

            <div class="line">

              <span>Доставка</span>

              <strong>
                {{ request.deliveryType }}
              </strong>

            </div>

            <div class="line">

              <span>Скидка</span>

              <strong>
                {{ request.customDiscount || 0 }}%
              </strong>

            </div>

            <div class="line">

              <span>Статус</span>

              <span
                class="px-4 py-2 rounded-xl text-sm font-semibold"
                :class="getStatusColor(request.status)"
              >
                {{ request.status }}
              </span>

            </div>

            <div class="border-t pt-5 flex justify-between">

              <span class="text-xl font-bold">
                Итого
              </span>

              <span class="text-3xl font-bold text-[#0044AA]">

                {{ totalPrice.toLocaleString() }} ₽

              </span>

            </div>

          </div>

        </div>

      </div>

    </div>

  </div>

</template>

<style scoped>

.card {
  @apply bg-white rounded-3xl p-6 shadow-sm border border-gray-100;
}

.title {
  @apply text-2xl font-bold mb-6 text-gray-800;
}

.input {
  @apply w-full border border-gray-200 rounded-2xl px-5 py-4 outline-none focus:border-[#0044AA];
}

.line {
  @apply flex justify-between items-center text-gray-700;
}

.save-btn {
  @apply bg-[#0044AA] hover:bg-[#003380] text-white py-3 px-5 rounded-2xl font-semibold transition;
}

.export-btn {
  @apply bg-green-600 hover:bg-green-700 text-white py-3 px-5 rounded-2xl font-semibold transition;
}

.delete-btn {
  @apply bg-red-600 hover:bg-red-700 text-white py-3 px-5 rounded-2xl font-semibold transition;
}

.label {
  @apply block mb-2 text-sm font-semibold text-gray-500;
}

.comment-box {
  @apply bg-gray-50 rounded-2xl p-4;
}

.history-box {
  @apply bg-gray-50 rounded-2xl p-4 border border-gray-100;
}

</style>