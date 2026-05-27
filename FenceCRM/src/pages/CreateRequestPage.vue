<script setup>

import {
  reactive,
  computed,
  ref,
} from 'vue'

import {
  serverTimestamp,
} from 'firebase/firestore'

import {
  calculateOrder,
} from '../utils/orderCalculator'

import {
  createRequest,
} from '../services/requestService'

/*
|--------------------------------------------------------------------------
| OPTIONS
|--------------------------------------------------------------------------
*/

const clientTypes = [
  'Физическое лицо',
  'Юридическое лицо',
  'Дилер',
]

const deliveryTypes = [
  'Самовывоз',
  'Пермь',
  'Пермский край',
  'Транспортная компания',
]

const installationTypes = [
  'Без монтажа',
  'Частичный монтаж',
  'Полный монтаж',
]

const colors = [
  { value: 'green', label: 'Зеленый' },
  { value: 'zinc', label: 'Цинк' },
  { value: 'brown', label: 'Коричневый' },
  { value: 'black', label: 'Черный' },
  { value: 'yellow', label: 'Желтый' },
  { value: 'gray', label: 'Серый' },
  { value: 'blue', label: 'Синий' },
  { value: 'custom', label: 'Свой вариант' },
]

/*
|--------------------------------------------------------------------------
| FORM
|--------------------------------------------------------------------------
*/

const defaultForm = () => ({

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

  wicket: 'none',

  gate: 'none',

  color: 'green',
  customColor: '',

  distance: 0,
  deliveryType: 'Самовывоз',

  installationType: 'Без монтажа',

  customDiscount: 0,

  comment: '',

  status: 'Новая заявка',

})

const form = reactive(defaultForm())

const saving = ref(false)

/*
|--------------------------------------------------------------------------
| COMPUTED
|--------------------------------------------------------------------------
*/

const is3D = computed(() => form.type === '3d')

const isGabion = computed(() => form.type === 'gabion')

const isTemporary = computed(() => form.type === 'temporary')

const finalWidth = computed(() => {

  if (form.width === 'custom') {
    return Number(form.customWidth) || 0
  }

  return Number(form.width) || 0

})

const finalHeight = computed(() => {

  if (form.height === 'custom') {
    return Number(form.customHeight) || 0
  }

  return Number(form.height) || 0

})

const finalWire = computed(() => {

  if (form.wire === 'custom') {
    return Number(form.customWire) || 0
  }

  return Number(form.wire) || 0

})

const finalPillars = computed(() => {

  if (form.pillars === 'custom') {
    return form.customPillars
  }

  return form.pillars

})

const calculation = computed(() => {

  return calculateOrder({

    ...form,

    width: finalWidth.value,
    height: finalHeight.value,
    wire: finalWire.value,
    pillars: finalPillars.value,

  }) || {}

})

const totalPrice = computed(() => {

  return Number(
    calculation.value?.totalPrice || 0
  )

})

/*
|--------------------------------------------------------------------------
| SAVE
|--------------------------------------------------------------------------
*/

const submitRequest = async () => {

  if (!form.clientName) {
    alert('Введите имя клиента')
    return
  }

  if (!form.clientPhone) {
    alert('Введите телефон')
    return
  }

  if (!form.length || Number(form.length) <= 0) {
    alert('Введите длину ограждения')
    return
  }

  try {

    saving.value = true

    const result = await createRequest({

      ...form,

      width: finalWidth.value,
      height: finalHeight.value,
      wire: finalWire.value,
      pillars: finalPillars.value,

      calculation: calculation.value,

      totalPrice: totalPrice.value,

      createdAt: serverTimestamp(),

    })

    if (result.success) {

      alert('Заявка успешно сохранена')

      Object.assign(
        form,
        defaultForm()
      )

    } else {

      alert('Ошибка сохранения')

    }

  } catch (error) {

    console.log(error)

    alert('Ошибка сохранения')

  } finally {

    saving.value = false

  }

}

</script>

<template>

  <div>

    <!-- HEADER -->

    <div class="mb-8">

      <h1 class="text-4xl font-bold text-gray-800">
        Создание заявки
      </h1>

      <p class="text-gray-400 mt-2">
        Автоматический расчет стоимости ограждений
      </p>

    </div>

    <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">

      <!-- LEFT -->

      <div class="xl:col-span-2 space-y-6">

        <!-- CLIENT -->

        <div class="card">

          <h2 class="title">
            Контактные данные клиента
          </h2>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">

            <div>

              <label class="label">
                Ваше имя
              </label>

              <input
                v-model="form.clientName"
                type="text"
                class="input"
                placeholder="Иванов Иван Иванович"
              />

            </div>

            <div>

              <label class="label">
                Телефон
              </label>

              <input
                v-model="form.clientPhone"
                type="text"
                class="input"
                placeholder="+7 (999) 999-99-99"
              />

            </div>

            <div class="md:col-span-2">

              <label class="label">
                Email
              </label>

              <input
                v-model="form.clientEmail"
                type="email"
                class="input"
                placeholder="mail@example.com"
              />

            </div>

            <div class="md:col-span-2">

              <label class="label">
                Тип клиента
              </label>

              <select
                v-model="form.clientType"
                class="input"
              >

                <option
                  v-for="type in clientTypes"
                  :key="type"
                >
                  {{ type }}
                </option>

              </select>

            </div>

          </div>

        </div>

        <!-- FENCE -->

        <div class="card">

          <h2 class="title">
            Параметры ограждения
          </h2>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">

            <!-- TYPE -->

            <div>

              <label class="label">
                Тип ограждения
              </label>

              <select
                v-model="form.type"
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
                  Сварное ограждение
                </option>

              </select>

            </div>

            <!-- LENGTH -->

            <div>

              <label class="label">
                Длина ограждения (м)
              </label>

              <input
                v-model="form.length"
                type="number"
                class="input"
              />

            </div>

            <!-- WIDTH -->

            <div>

              <label class="label">
                Ширина секции (мм)
              </label>

              <select
                v-model="form.width"
                class="input"
              >

                <option :value="2500">
                  2500 мм
                </option>

                <option :value="3000">
                  3000 мм
                </option>

                <option value="custom">
                  Свой вариант
                </option>

              </select>

              <input
                v-if="form.width === 'custom'"
                v-model="form.customWidth"
                type="number"
                class="input mt-3"
                placeholder="Введите ширину"
              />

            </div>

            <!-- HEIGHT -->

            <div>

              <label class="label">
                Высота секции (мм)
              </label>

              <select
                v-model="form.height"
                class="input"
              >

                <option :value="630">630 мм</option>
                <option :value="1030">1030 мм</option>
                <option :value="1230">1230 мм</option>
                <option :value="1530">1530 мм</option>
                <option :value="1730">1730 мм</option>
                <option :value="2030">2030 мм</option>
                <option :value="2430">2430 мм</option>

                <option value="custom">
                  Свой вариант
                </option>

              </select>

              <input
                v-if="form.height === 'custom'"
                v-model="form.customHeight"
                type="number"
                class="input mt-3"
                placeholder="Введите высоту"
              />

            </div>

            <!-- WIRE -->

            <div v-if="is3D">

              <label class="label">
                Диаметр проволоки
              </label>

              <select
                v-model="form.wire"
                class="input"
              >

                <option value="3">
                  3 мм
                </option>

                <option value="4">
                  4 мм
                </option>

                <option value="5">
                  5 мм
                </option>

                <option value="custom">
                  Свой вариант
                </option>

              </select>

              <input
                v-if="form.wire === 'custom'"
                v-model="form.customWire"
                type="number"
                class="input mt-3"
                placeholder="Введите диаметр"
              />

            </div>

            <!-- PILLARS -->

            <div v-if="is3D || isTemporary">

              <label class="label">
                Столбы
              </label>

              <select
                v-model="form.pillars"
                class="input"
              >

                <option value="60x40">
                  60x40 мм
                </option>

                <option value="60x60">
                  60x60 мм
                </option>

                <option value="80x80">
                  80x80 мм
                </option>

                <option value="none">
                  Не нужны
                </option>

                <option value="custom">
                  Свой вариант
                </option>

              </select>

              <input
                v-if="form.pillars === 'custom'"
                v-model="form.customPillars"
                type="text"
                class="input mt-3"
                placeholder="Введите размер столбов"
              />

            </div>

            <!-- WICKET -->

            <div v-if="!isGabion">

              <label class="label">
                Калитка
              </label>

              <select
                v-model="form.wicket"
                class="input"
              >

                <option value="hooks">
                  С проушинами
                </option>

                <option value="lock">
                  С замком
                </option>

                <option value="none">
                  Нет
                </option>

              </select>

            </div>

            <!-- GATE -->

            <div v-if="!isGabion">

              <label class="label">
                Ворота
              </label>

              <select
                v-model="form.gate"
                class="input"
              >

                <option value="swing">
                  Распашные
                </option>

                <option value="sliding">
                  Откатные
                </option>

                <option value="none">
                  Нет
                </option>

              </select>

            </div>

            <!-- COLOR -->

            <div v-if="is3D">

              <label class="label">
                Цвет
              </label>

              <select
                v-model="form.color"
                class="input"
              >

                <option
                  v-for="color in colors"
                  :key="color.value"
                  :value="color.value"
                >
                  {{ color.label }}
                </option>

              </select>

              <input
                v-if="form.color === 'custom'"
                v-model="form.customColor"
                type="text"
                class="input mt-3"
                placeholder="Введите цвет"
              />

            </div>

          </div>

        </div>

        <!-- DELIVERY -->

        <div class="card">

          <h2 class="title">
            Доставка и монтаж
          </h2>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">

            <div>

              <label class="label">
                Тип доставки
              </label>

              <select
                v-model="form.deliveryType"
                class="input"
              >

                <option
                  v-for="delivery in deliveryTypes"
                  :key="delivery"
                >
                  {{ delivery }}
                </option>

              </select>

            </div>

            <div
              v-if="
                form.deliveryType ===
                'Пермский край'
              "
            >

              <label class="label">
                Расстояние (км)
              </label>

              <input
                v-model="form.distance"
                type="number"
                class="input"
              />

            </div>

            <div>

              <label class="label">
                Монтаж
              </label>

              <select
                v-model="form.installationType"
                class="input"
              >

                <option
                  v-for="install in installationTypes"
                  :key="install"
                >
                  {{ install }}
                </option>

              </select>

            </div>

            <div>

              <label class="label">
                Скидка (%)
              </label>

              <input
                v-model="form.customDiscount"
                type="number"
                class="input"
              />

            </div>

          </div>

        </div>

        <!-- COMMENT -->

        <div class="card">

          <h2 class="title">
            Комментарий
          </h2>

          <textarea
            v-model="form.comment"
            rows="5"
            class="input resize-none"
            placeholder="Введите комментарий..."
          />

        </div>

      </div>

      <!-- RIGHT -->

      <div>

        <div class="card sticky top-6">

          <h2 class="title">
            Расчет стоимости
          </h2>

          <div class="space-y-4">

            <div class="line">
              <span>Панели</span>

              <strong>
                {{ Number(calculation.panelsPrice || 0).toLocaleString() }} ₽
              </strong>
            </div>

            <div class="line">
              <span>Столбы</span>

              <strong>
                {{ Number(calculation.pillarsPrice || 0).toLocaleString() }} ₽
              </strong>
            </div>

            <div class="line">
              <span>Калитка</span>

              <strong>
                {{ Number(calculation.wicketPrice || 0).toLocaleString() }} ₽
              </strong>
            </div>

            <div class="line">
              <span>Ворота</span>

              <strong>
                {{ Number(calculation.gatePrice || 0).toLocaleString() }} ₽
              </strong>
            </div>

            <div class="line">
              <span>Доставка</span>

              <strong>
                {{ Number(calculation.deliveryPrice || 0).toLocaleString() }} ₽
              </strong>
            </div>

            <div class="line">
              <span>Монтаж</span>

              <strong>
                {{ Number(calculation.installationPrice || 0).toLocaleString() }} ₽
              </strong>
            </div>

            <div class="total-box">

              <span class="text-xl font-bold">
                Итого
              </span>

              <span class="total-price">
                {{ Number(totalPrice || 0).toLocaleString() }} ₽
              </span>

            </div>

          </div>

          <button
            @click="submitRequest"
            :disabled="saving"
            class="save-btn"
          >
            {{ saving ? 'Сохранение...' : 'Сохранить заявку' }}
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

.title {
  @apply text-2xl font-bold mb-6 text-gray-800;
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
  @apply border-t pt-5 flex justify-between items-center mt-4;
}

.total-price {
  @apply text-3xl font-bold text-[#0044AA];
}

.save-btn {
  @apply w-full mt-8 bg-[#0044AA] hover:bg-[#003380] disabled:opacity-50 text-white py-4 rounded-2xl font-semibold transition;
}

</style>