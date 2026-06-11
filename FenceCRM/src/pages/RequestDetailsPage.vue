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
  } from 'firebase/firestore'

import {
  reactive,
  ref,
  onMounted,
  computed,
} from 'vue'

import {
  useRoute,
  useRouter,
} from 'vue-router'

import { db } from '../firebase'

import { calculateOrder } from '../utils/orderCalculator'
import { exportRequestToWord } from '../utils/exportRequestToWord'
import { addHistoryRecord } from '../utils/historyService'
import { changeRequestStatus } from '../services/requestService'

const route = useRoute()
const router = useRouter()

const loading = ref(true)
const editMode = ref(false)
const comments = ref([])
const history = ref([])
const newComment = ref('')

const request = reactive({
  clientName: '',
  clientPhone: '',
  clientEmail: '',
  clientType: 'Физическое лицо',

  organizationName: '',
  inn: '',

  type: '3d',

  length: 50,
  height: 1530,
  width: 2500,
  wire: '4',
  cell: '200x55',
  coating: 'polymer',
  color: 'ral6005',
  customColor: '',

  cornersCount: 0,

  isSportFence: false,
  sportRows: 1,

  fastening: 'standard',

  wicketCount: 0,
  wicketType: 'standard',
  wicketHeight: 1750,
  wicketWidth: 1000,

  swingGateCount: 0,
  swingGateHeight: 1750,
  swingGateWidth: 4000,

  slidingGateCount: 0,
  slidingGateHeight: 1750,
  slidingGateWidth: 4000,

  deliveryPriceManual: 0,
  installationPriceManual: 0,

  customDiscount: 0,
  comment: '',

  isArchived: false,
  archivedAt: null,

  status: 'Новая заявка',
  totalPrice: 0,

  isProductionOrder: false,
  productionStatus: 'Не запущен',
})

const formatPrice = (value) => {
  return Number(value || 0).toLocaleString()
}

const calculation = computed(() => {
  return calculateOrder({
    ...request,
    length: Number(request.length) || 0,
    height: Number(request.height) || 0,
    width: Number(request.width) || 0,
    wire: String(request.wire || '4'),
    customDiscount: Number(request.customDiscount) || 0,
  })
})

const totalPrice = computed(() => {
  return calculation.value.totalPrice || 0
})

const finalHeight = computed(() => {
  return calculation.value.finalFenceHeight || request.height || 0
})

onMounted(async () => {
  try {
    const requestRef = doc(db, 'requests', route.params.id)
    const snapshot = await getDoc(requestRef)

    if (!snapshot.exists()) {
      alert('Заявка не найдена')
      router.push('/requests')
      return
    }

    Object.assign(request, snapshot.data())

    if (!request.wicketType || request.wicketType === 'none') {
      request.wicketType = 'standard'
    }

    const commentsQuery = query(
      collection(db, 'requests', route.params.id, 'comments'),
      orderBy('createdAt', 'desc')
    )

    onSnapshot(commentsQuery, (snapshot) => {
      comments.value = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
    })

    const historyQuery = query(
      collection(db, 'requests', route.params.id, 'history'),
      orderBy('createdAt', 'desc')
    )

    onSnapshot(historyQuery, (snapshot) => {
      history.value = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
    })
  } catch (error) {
    console.log(error)
    alert('Ошибка загрузки заявки')
  } finally {
    loading.value = false
  }
})

const saveRequest = async () => {
  try {
      const newStatus =
        request.status === 'Новая заявка' ||
        request.status === 'Требует уточнения'
          ? 'Заказ рассчитан'
          : request.status

    const payload = {
      ...request,

      status: newStatus,

      length: Number(request.length) || 0,
      height: Number(request.height) || 0,
      width: Number(request.width) || 0,
      cornersCount: Number(request.cornersCount) || 0,

      wicketCount: Number(request.wicketCount) || 0,
      swingGateCount: Number(request.swingGateCount) || 0,
      slidingGateCount: Number(request.slidingGateCount) || 0,

      deliveryPriceManual: Number(request.deliveryPriceManual) || 0,
      installationPriceManual: Number(request.installationPriceManual) || 0,
      customDiscount: Number(request.customDiscount) || 0,

      totalPrice: totalPrice.value,
      calculation: calculation.value,

      updatedAt: serverTimestamp(),
    }

    await updateDoc(
      doc(db, 'requests', route.params.id),
      payload
    )

    request.status = newStatus
    request.totalPrice = totalPrice.value

    await addHistoryRecord(
      route.params.id,
      'Редактирование заявки',
      newStatus === 'Заказ рассчитан'
        ? 'Данные заявки обновлены. Заказ рассчитан'
        : 'Данные заявки были обновлены'
    )

    editMode.value = false
    alert('Заявка обновлена')
  } catch (error) {
    console.log(error)
    alert('Ошибка обновления')
  }
}

const changeStatus = async (newStatus, historyText, extraData = {}) => {
  const result = await changeRequestStatus(
    route.params.id,
    request,
    newStatus,
    historyText,
    extraData
  )

  if (result.success) {
    request.status = newStatus
    Object.assign(request, extraData)
  } else {
    alert('Ошибка изменения статуса')
  }
}

const downloadCommercialOffer = async () => {
  exportRequestToWord({
    ...request,
    totalPrice: totalPrice.value,
    calculation: calculation.value,
  })

  const statusesWithoutChange = [
    'КП отправлено',
    'Ожидает решение клиента',
    'Заказ отменен',
    'Заказ оплачен',
    'В производстве',
    'Готов к отгрузке',
    'Доставляется',
    'Завершен',
  ]

  if (!statusesWithoutChange.includes(request.status)) {
    await changeStatus(
      'КП отправлено',
      'КП сформировано и отправлено клиенту'
    )
  }
}

const clientThinking = () => {
  changeStatus(
    'Ожидает решение клиента',
    'Клиент рассматривает коммерческое предложение'
  )
}

const cancelRequest = () => {
  const reason = prompt(
    'Укажите причину отмены: Дорого, Выбрал конкурента, Передумал, Не отвечает, Другое'
  )

  if (!reason) return

  changeStatus(
    'Заказ отменен',
    `Заказ отменен. Причина: ${reason}`,
    {
      cancelReason: reason,
    }
  )
}

const markAsPaid = () => {
  changeStatus(
    'Заказ оплачен',
    'Получена оплата'
  )
}

const startProduction = () => {
  changeStatus(
    'В производстве',
    'Передано в производство',
    {
      isProductionOrder: true,
      productionStatus: 'В производстве',
    }
  )
}

const readyForShipment = () => {
  changeStatus(
    'Готов к отгрузке',
    'Заказ готов к отгрузке',
    {
      productionStatus: 'Готов к отгрузке',
    }
  )
}

const startDelivery = () => {
  changeStatus(
    'Доставляется',
    'Передано в доставку'
  )
}

const completeOrder = () => {
  changeStatus(
    'Завершен',
    'Заказ завершен'
  )
}

const archiveRequest = async () => {
  if (!confirm('Переместить заявку в архив? Данные заявки и заказа сохранятся.')) {
    return
  }

  try {
    await updateDoc(
      doc(db, 'requests', route.params.id),
      {
        isArchived: true,
        archivedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }
    )

    await addHistoryRecord(
      route.params.id,
      'Архивирование заявки',
      'Заявка перемещена в архив. Данные сохранены для истории и гарантийных случаев'
    )

    alert('Заявка перемещена в архив')
    router.push('/requests')
  } catch (error) {
    console.log(error)
    alert('Ошибка архивирования')
  }
}

const addComment = async () => {
  if (!newComment.value.trim()) return

  try {
    await addDoc(
      collection(db, 'requests', route.params.id, 'comments'),
      {
        text: newComment.value,
        author: 'Менеджер',
        createdAt: serverTimestamp(),
      }
    )

    await addHistoryRecord(
      route.params.id,
      'Комментарий',
      'Добавлен новый комментарий'
    )

    newComment.value = ''
  } catch (error) {
    console.log(error)
    alert('Ошибка добавления комментария')
  }
}

const getStatusColor = (status) => {
  if (status === 'Новая заявка') return 'bg-blue-100 text-blue-700'
  if (status === 'Требует уточнения') return 'bg-orange-100 text-orange-700'
  if (status === 'Заказ рассчитан') return 'bg-indigo-100 text-indigo-700'
  if (status === 'КП отправлено') return 'bg-cyan-100 text-cyan-700'
  if (status === 'Ожидает решение клиента') return 'bg-yellow-100 text-yellow-700'
  if (status === 'Заказ оплачен') return 'bg-green-100 text-green-700'
  if (status === 'Заказ отменен') return 'bg-red-100 text-red-700'
  if (status === 'В производстве') return 'bg-purple-100 text-purple-700'
  if (status === 'Готов к отгрузке') return 'bg-pink-100 text-pink-700'
  if (status === 'Доставляется') return 'bg-teal-100 text-teal-700'
  if (status === 'Завершен') return 'bg-gray-200 text-gray-700'

  return 'bg-gray-100 text-gray-600'
}
</script>

<template>
  <div v-if="loading" class="text-center py-20 text-gray-400">
    Загрузка заявки...
  </div>

  <div v-else class="space-y-6">

    <div class="flex items-center justify-between flex-wrap gap-4">
      <div>
        <h1 class="text-4xl font-bold text-gray-800">
          Карточка заявки
        </h1>

        <p class="text-gray-400 mt-2">
          Полная информация о заказе
        </p>

        <div class="mt-4">
          <span
            class="px-4 py-2 rounded-xl text-sm font-semibold"
            :class="getStatusColor(request.status)"
          >
            {{ request.status }}
          </span>
        </div>
      </div>

      <div class="flex gap-3 flex-wrap">
        <button
          v-if="request.status === 'Новая заявка'"
          @click="changeStatus('Требует уточнения', 'Заявка требует уточнения')"
          class="save-btn"
        >
          Требует уточнения
        </button>

        <button
          v-if="request.status === 'КП отправлено'"
          @click="clientThinking"
          class="save-btn"
        >
          Клиент рассматривает
        </button>

        <button
          v-if="request.status === 'Ожидает решение клиента'"
          @click="markAsPaid"
          class="save-btn"
        >
          Заказ оплачен
        </button>

        <button
          v-if="request.status === 'Ожидает решение клиента'"
          @click="cancelRequest"
          class="delete-btn"
        >
          Отменить
        </button>

        <button
          v-if="request.status === 'Заказ оплачен'"
          @click="startProduction"
          class="save-btn"
        >
          В производство
        </button>

        <button
          v-if="request.status === 'В производстве'"
          @click="readyForShipment"
          class="save-btn"
        >
          Готов к отгрузке
        </button>

        <button
          v-if="request.status === 'Готов к отгрузке'"
          @click="startDelivery"
          class="save-btn"
        >
          В доставку
        </button>

        <button
          v-if="request.status === 'Доставляется'"
          @click="completeOrder"
          class="save-btn"
        >
          Завершить
        </button>

        <button
          @click="downloadCommercialOffer"
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
          @click="archiveRequest"
          class="archive-btn"
        >
          В архив
        </button>
      </div>
    </div>

    <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">

      <div class="xl:col-span-2 space-y-6">

        <div class="card">
          <h2 class="title">Клиент</h2>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="label">ФИО клиента</label>
              <input v-model="request.clientName" :disabled="!editMode" class="input" />
            </div>

            <div>
              <label class="label">Телефон</label>
              <input v-model="request.clientPhone" :disabled="!editMode" class="input" />
            </div>

            <div>
              <label class="label">Email</label>
              <input v-model="request.clientEmail" :disabled="!editMode" class="input" />
            </div>

            <div>
              <label class="label">
                Город / регион объекта
              </label>

              <input
                v-model="request.city"
                :disabled="!editMode"
                class="input"
                placeholder="Например: Пермь"
              />
            </div>

            <div>
              <label class="label">Тип клиента</label>
              <select v-model="request.clientType" :disabled="!editMode" class="input">

                <template v-if="request.clientType === 'Юридическое лицо'">

                  <div>
                    <label class="label">
                      Название организации
                    </label>

                    <input
                      v-model="request.organizationName"
                      :disabled="!editMode"
                      class="input"
                    />
                  </div>

                  <div>
                    <label class="label">
                      ИНН
                    </label>

                    <input
                      v-model="request.inn"
                      :disabled="!editMode"
                      class="input"
                    />
                  </div>

                </template>

                <option>Физическое лицо</option>
                <option>Юридическое лицо</option>
                <option>Дилер</option>
              </select>
            </div>
          </div>
        </div>

        <div
          v-if="request.status === 'Заказ отменен' && request.cancelReason"
          class="cancel-card"
        >
          <div class="font-bold text-red-700 mb-2">
            Причина отмены заказа
          </div>

          <div class="text-red-600">
            {{ request.cancelReason }}
          </div>
        </div>

        <div class="card">
          <h2 class="title">Параметры 3D-ограждения</h2>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="label">Тип ограждения</label>
              <input value="3D ограждение" disabled class="input" />
            </div>

            <div>
              <label class="label">Длина ограждения (м)</label>
              <input v-model="request.length" type="number" :disabled="!editMode" class="input" />
            </div>

            <div>
              <label class="label">Высота панели</label>
              <select v-model="request.height" :disabled="!editMode" class="input">
                <option :value="1030">1030 мм</option>
                <option :value="1230">1230 мм</option>
                <option :value="1530">1530 мм</option>
                <option :value="1730">1730 мм</option>
                <option :value="2030">2030 мм</option>
              </select>
            </div>

            <div>
              <label class="label">Ширина панели</label>
              <select v-model="request.width" :disabled="!editMode" class="input">
                <option :value="2500">2500 мм</option>
                <option :value="3000">3000 мм</option>
              </select>
            </div>

            <div>
              <label class="label">Диаметр проволоки</label>
              <select v-model="request.wire" :disabled="!editMode" class="input">
                <option value="3.5">3.5 мм</option>
                <option value="4">4 мм</option>
                <option value="5">5 мм</option>
              </select>
            </div>

            <div>
              <label class="label">Размер ячейки</label>
              <select v-model="request.cell" :disabled="!editMode" class="input">
                <option value="200x55">200×55</option>
                <option value="150x55">150×55</option>
                <option value="100x55">100×55</option>
                <option value="200x50">200×50</option>
                <option value="150x50">150×50</option>
                <option value="100x50">100×50</option>
              </select>
            </div>

            <div>
              <label class="label">Покрытие</label>
              <select v-model="request.coating" :disabled="!editMode" class="input">
                <option value="zinc">Цинк</option>
                <option value="polymer">Полимерное покрытие</option>
              </select>
            </div>

            <div>
              <label class="label">Цвет</label>
              <select v-model="request.color" :disabled="!editMode" class="input">
                <option value="ral6005">Зеленый (RAL 6005)</option>
                <option value="ral8017">Коричневый (RAL 8017)</option>
                <option value="ral7024">Графитовый (RAL 7024)</option>
                <option value="ral9005">Черный (RAL 9005)</option>
                <option value="ral7004">Серый (RAL 7004)</option>
                <option value="custom">Другой цвет RAL</option>
              </select>
            </div>

            <div v-if="request.color === 'custom'">
              <label class="label">Другой цвет RAL</label>
              <input v-model="request.customColor" :disabled="!editMode" class="input" />
            </div>

            <div>
              <label class="label">Количество углов</label>
              <input v-model="request.cornersCount" type="number" :disabled="!editMode" class="input" />
            </div>

            <div>
              <label class="label">Крепеж</label>
              <select v-model="request.fastening" :disabled="!editMode" class="input">
                <option value="standard">Болтовой крепеж с обычной гайкой</option>
                <option value="antivandal">Болтовой крепеж с антивандальной гайкой</option>
                <option value="selftap">Саморезный крепеж</option>
              </select>
            </div>

            <div>
              <label class="label">Количество калиток</label>
              <input v-model="request.wicketCount" type="number" :disabled="!editMode" class="input" />
            </div>

            <div v-if="Number(request.wicketCount) > 0">
              <label class="label">Тип калитки</label>
              <select v-model="request.wicketType" :disabled="!editMode" class="input">
                <option value="standard">Калитка Стандарт</option>
                <option value="lock">Калитка Стандарт с замком</option>
              </select>
            </div>

            <div v-if="Number(request.wicketCount) > 0">
              <label class="label">Высота калитки</label>
              <select v-model="request.wicketHeight" :disabled="!editMode" class="input">
                <option :value="1450">1450 мм</option>
                <option :value="1750">1750 мм</option>
                <option :value="1950">1950 мм</option>
              </select>
            </div>

            <div>
              <label class="label">Количество распашных ворот</label>
              <input v-model="request.swingGateCount" type="number" :disabled="!editMode" class="input" />
            </div>

            <div v-if="Number(request.swingGateCount) > 0">
              <label class="label">Высота распашных ворот</label>
              <select v-model="request.swingGateHeight" :disabled="!editMode" class="input">
                <option :value="1450">1450 мм</option>
                <option :value="1750">1750 мм</option>
                <option :value="1950">1950 мм</option>
              </select>
            </div>

            <div v-if="Number(request.swingGateCount) > 0">
              <label class="label">Ширина распашных ворот</label>
              <select v-model="request.swingGateWidth" :disabled="!editMode" class="input">
                <option :value="3000">3000 мм</option>
                <option :value="3500">3500 мм</option>
                <option :value="4000">4000 мм</option>
                <option :value="4500">4500 мм</option>
                <option :value="5000">5000 мм</option>
              </select>
            </div>

            <div>
              <label class="label">Количество откатных ворот</label>
              <input v-model="request.slidingGateCount" type="number" :disabled="!editMode" class="input" />
            </div>

            <div v-if="Number(request.slidingGateCount) > 0">
              <label class="label">Высота откатных ворот</label>
              <select v-model="request.slidingGateHeight" :disabled="!editMode" class="input">
                <option :value="1450">1450 мм</option>
                <option :value="1750">1750 мм</option>
                <option :value="1950">1950 мм</option>
              </select>
            </div>

            <div v-if="Number(request.slidingGateCount) > 0">
              <label class="label">Ширина откатных ворот</label>
              <select v-model="request.slidingGateWidth" :disabled="!editMode" class="input">
                <option :value="3000">3000 мм</option>
                <option :value="3500">3500 мм</option>
                <option :value="4000">4000 мм</option>
                <option :value="4500">4500 мм</option>
                <option :value="5000">5000 мм</option>
              </select>
            </div>

            <div>
              <label class="label">Стоимость доставки</label>
              <input v-model="request.deliveryPriceManual" type="number" :disabled="!editMode" class="input" />
            </div>

            <div>
              <label class="label">Стоимость монтажа</label>
              <input v-model="request.installationPriceManual" type="number" :disabled="!editMode" class="input" />
            </div>

            <div>
              <label class="label">Скидка (%)</label>
              <input v-model="request.customDiscount" type="number" :disabled="!editMode" class="input" />
            </div>
          </div>
        </div>

        <div class="card">
          <h2 class="title">Комментарии</h2>

          <textarea
            v-model="newComment"
            rows="4"
            class="input resize-none"
            placeholder="Введите комментарий..."
          />

          <button @click="addComment" class="save-btn mt-4">
            Добавить комментарий
          </button>

          <div class="space-y-4 mt-6">
            <div v-for="comment in comments" :key="comment.id" class="comment-box">
              <div class="flex justify-between mb-2">
                <div class="font-semibold">{{ comment.author }}</div>
                <div class="text-xs text-gray-400">
                  {{ comment.createdAt?.toDate?.()?.toLocaleString() }}
                </div>
              </div>

              <div class="text-gray-700">
                {{ comment.text }}
              </div>
            </div>
          </div>
        </div>

        <div class="card">
          <h2 class="title">История изменений</h2>

          <div
            v-if="!history.length"
            class="text-gray-400 text-sm"
          >
            История пока пуста
          </div>

          <div
            v-else
            class="timeline"
          >
            <div
              v-for="item in history"
              :key="item.id"
              class="timeline-item"
            >
              <div class="timeline-dot"></div>

              <div class="timeline-content">
                <div class="flex items-center justify-between gap-3">
                  <div class="font-semibold text-gray-800">
                    {{ item.action || item.text || 'Событие' }}
                  </div>

                  <div class="text-xs text-gray-400 whitespace-nowrap">
                    {{ item.createdAt?.toDate?.()?.toLocaleString() }}
                  </div>
                </div>

                <div
                  v-if="item.description"
                  class="text-sm text-gray-500 mt-1"
                >
                  {{ item.description }}
                </div>

                <div
                  v-if="item.status"
                  class="mt-2"
                >
                  <span
                    class="px-3 py-1 rounded-xl text-xs font-semibold"
                    :class="getStatusColor(item.status)"
                  >
                    {{ item.status }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      <div>
        <div class="card sticky top-6 max-h-[calc(100vh-48px)] overflow-y-auto">
          <h2 class="title">Итоговый расчет</h2>

          <div class="space-y-4">
            <div class="summary-box">
              <div class="summary-title">Смета</div>

              <div
                v-for="row in calculation.estimateRows"
                :key="`${row.name}-${row.characteristics}`"
                class="estimate-row"
              >
                <div>
                  <strong>{{ row.name }}</strong>
                  <p>{{ row.characteristics }}</p>
                  <p>
                    {{ row.quantity }} шт. ×
                    {{ formatPrice(row.unitPrice) }} ₽
                  </p>
                </div>

                <strong>{{ formatPrice(row.sum) }} ₽</strong>
              </div>
            </div>

            <div v-if="calculation.coefficients?.length" class="summary-box">
              <div class="summary-title">Коэффициенты</div>
              <p
                v-for="coefficient in calculation.coefficients"
                :key="coefficient"
                class="hint"
              >
                {{ coefficient }}
              </p>
            </div>

            <div class="line">
              <span>Высота итоговая</span>
              <strong>{{ finalHeight }} мм</strong>
            </div>

            <div class="line">
              <span>Материалы</span>
              <strong>{{ formatPrice(calculation.materialsPrice) }} ₽</strong>
            </div>

            <div class="line">
              <span>Крепеж</span>
              <strong>{{ formatPrice(calculation.fasteningPrice) }} ₽</strong>
            </div>

            <div class="line">
              <span>Калитки</span>
              <strong>{{ formatPrice(calculation.wicketPrice) }} ₽</strong>
            </div>

            <div class="line">
              <span>Ворота</span>
              <strong>{{ formatPrice(calculation.gatePrice) }} ₽</strong>
            </div>

            <div class="line">
              <span>Доставка</span>
              <strong>{{ formatPrice(calculation.deliveryPrice) }} ₽</strong>
            </div>

            <div class="line">
              <span>Монтаж</span>
              <strong>{{ formatPrice(calculation.installationPrice) }} ₽</strong>
            </div>

            <div class="line">
              <span>НДС 22%</span>
              <strong>{{ formatPrice(calculation.vatPrice) }} ₽</strong>
            </div>

            <div class="notice">
              {{ calculation.calculationComment }}
            </div>

            <div class="border-t pt-5 flex justify-between">
              <span class="text-xl font-bold">Итого</span>
              <span class="text-3xl font-bold text-[#0044AA]">
                {{ formatPrice(totalPrice) }} ₽
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
  @apply w-full border border-gray-200 rounded-2xl px-5 py-4 outline-none focus:border-[#0044AA] disabled:bg-gray-50 disabled:text-gray-500;
}

.line {
  @apply flex justify-between items-center text-gray-700 py-2 border-b border-gray-100;
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

.summary-box {
  @apply bg-gray-50 rounded-2xl p-4 space-y-3;
}

.summary-title {
  @apply font-bold text-gray-700;
}

.estimate-row {
  @apply flex justify-between gap-3 text-sm border-b border-gray-200 pb-3 last:border-b-0 last:pb-0;
}

.estimate-row p {
  @apply text-gray-400 mt-1;
}

.notice {
  @apply text-sm text-gray-500 bg-gray-50 rounded-2xl p-4 leading-relaxed;
}

.hint {
  @apply text-sm text-gray-400 mt-2;
}

.cancel-card {
  @apply bg-red-50 border border-red-100 rounded-3xl p-6;
}

.timeline {
  @apply relative space-y-5;
}

.timeline-item {
  @apply relative flex gap-4;
}

.timeline-dot {
  @apply w-4 h-4 rounded-full bg-[#0044AA] mt-2 shrink-0;
}

.timeline-content {
  @apply bg-gray-50 rounded-2xl p-4 border border-gray-100 flex-1;
}

.archive-btn {
  @apply bg-gray-600 hover:bg-gray-700 text-white py-3 px-5 rounded-2xl font-semibold transition;
}
</style>