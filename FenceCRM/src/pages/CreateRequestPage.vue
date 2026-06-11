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

const coatingOptions = [
  { value: 'zinc', label: 'Цинк' },
  { value: 'polymer', label: 'Полимерное покрытие' },
]

const colors = [
  { value: 'ral6005', label: 'Зеленый (RAL 6005)' },
  { value: 'ral8017', label: 'Коричневый (RAL 8017)' },
  { value: 'ral7024', label: 'Графитовый (RAL 7024)' },
  { value: 'ral9005', label: 'Черный (RAL 9005)' },
  { value: 'ral7004', label: 'Серый (RAL 7004)' },
  { value: 'custom', label: 'Другой цвет RAL' },
]

const wireOptions = [
  '3.5',
  '4',
  '5',
]

const cellOptions = [
  '200x55',
  '150x55',
  '100x55',
  '200x50',
  '150x50',
  '100x50',
]

const panelHeightOptions = [1030, 1230, 1530, 1730, 2030]
const gateHeightOptions = [1450, 1750, 1950]
const gateWidthOptions = [3000, 3500, 4000, 4500, 5000]

const fasteningOptions = [

  {
    value: 'standard',
    label: 'Болтовое крепление',
  },

  {
    value: 'antivandal',
    label: 'Антивандальное крепление',
  },

  {
    value: 'selftap',
    label: 'Саморез',
  },

]

/*
|--------------------------------------------------------------------------
| FORM
|--------------------------------------------------------------------------
*/

const defaultForm = () => ({

  /*
  |--------------------------------------------------------------------------
  | CLIENT
  |--------------------------------------------------------------------------
  */

  clientName: '',
  clientPhone: '',
  clientEmail: '',

  clientType: 'Физическое лицо',

  organizationName: '',
  inn: '',

  source: 'Авито',
  city: '',

  /*
  |--------------------------------------------------------------------------
  | FENCE
  |--------------------------------------------------------------------------
  */

  type: '3d',

  length: 50,
  width: 2500,
  height: 1530,
  cornersCount: 0,
  wicketCount: 0,
  swingGateCount: 0,
  slidingGateCount: 0,
  deliveryPriceManual: 0,
  installationPriceManual: 0,

  /*
  |--------------------------------------------------------------------------
  | SPORTS FENCE
  |--------------------------------------------------------------------------
  */

  isSportFence: 0,

  sportRows: 1,

  /*
  |--------------------------------------------------------------------------
  | PANELS
  |--------------------------------------------------------------------------
  */

  wire: '4',

  cell: '200x55',
  coating: 'polymer',
  color: 'ral6005',

  customColor: '',

  /*
  |--------------------------------------------------------------------------
  | FASTENING
  |--------------------------------------------------------------------------
  */

  fastening: 'standard',

  /*
  |--------------------------------------------------------------------------
  | WICKET
  |--------------------------------------------------------------------------
  */

  wicketType: 'standard',

  wicketHeight: 1750,

  wicketWidth: 1000,

  /*
  |--------------------------------------------------------------------------
  | GATES
  |--------------------------------------------------------------------------
  */

  swingGateHeight: 1750,
  swingGateWidth: 4000,
  slidingGateHeight: 1750,
  slidingGateWidth: 4000,

  /*
  |--------------------------------------------------------------------------
  | DELIVERY
  |--------------------------------------------------------------------------
  */


  /*
  |--------------------------------------------------------------------------
  | INSTALLATION
  |--------------------------------------------------------------------------
  */


  /*
  |--------------------------------------------------------------------------
  | FINANCE
  |--------------------------------------------------------------------------
  */

  customDiscount: 0,

  /*
  |--------------------------------------------------------------------------
  | COMMENT
  |--------------------------------------------------------------------------
  */

  comment: '',

  /*
  |--------------------------------------------------------------------------
  | STATUS
  |--------------------------------------------------------------------------
  */

  status: 'Новая заявка',

  convertedToOrder: false,

  isProductionOrder: false,

  productionStatus: 'Не запущен',

  /*
  |--------------------------------------------------------------------------
  | IMPORTANT
  |--------------------------------------------------------------------------
  */

  priceIsApproximate: true,

})

const form = reactive(
  defaultForm()
)

const saving = ref(false)

/*
|--------------------------------------------------------------------------
| ERRORS
|--------------------------------------------------------------------------
*/

const errors = reactive({
  clientName: '',
  clientPhone: '',
  clientEmail: '',

  organizationName: '',
  inn: '',

  length: '',
  customColor: '',
})


const integerFields = [
  'length',
  'height',
  'cornersCount',
  'wicketCount',
  'swingGateCount',
  'slidingGateCount',
  'deliveryPriceManual',
  'installationPriceManual',
  'sportRows',
  'customDiscount',
]

const normalizeInteger = (field) => {
  form[field] = Math.max(
    parseInt(form[field], 10) || 0,
    0,
  )
}


/*
|--------------------------------------------------------------------------
| VALIDATION
|--------------------------------------------------------------------------
*/

const validateForm = () => {

  let valid = true

  errors.clientName = ''
  errors.clientPhone = ''
  errors.clientEmail = ''
  errors.length = ''
  errors.customColor = ''

  /*
  |--------------------------------------------------------------------------
  | NAME
  |--------------------------------------------------------------------------
  */

  const nameRegex =
    /^[А-Яа-яA-Za-zЁё\s-]+$/

  if (
    !form.clientName ||
    form.clientName.trim().length < 3
  ) {

    errors.clientName =
      'Введите ФИО'

    valid = false

  }

  else if (
    !nameRegex.test(
      form.clientName.trim()
    )
  ) {

    errors.clientName =
      'ФИО содержит недопустимые символы'

    valid = false

  }

  /*
  |--------------------------------------------------------------------------
  | PHONE
  |--------------------------------------------------------------------------
  */

  const cleanedPhone =
    form.clientPhone.replace(/\D/g, '')

  if (
    cleanedPhone.length !== 11 ||
    !['7', '8'].includes(
      cleanedPhone[0]
    )
  ) {

    errors.clientPhone =
      'Введите корректный телефон'

    valid = false

  }

  /*
  |--------------------------------------------------------------------------
  | EMAIL
  |--------------------------------------------------------------------------
  */

  if (form.clientEmail) {

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (
      !emailRegex.test(
        form.clientEmail
      )
    ) {

      errors.clientEmail =
        'Некорректный email'

      valid = false

    }

  }

/*
|--------------------------------------------------------------------------
| LEGAL ENTITY
|--------------------------------------------------------------------------
*/

  if (form.clientType === 'Юридическое лицо') {

    if (!form.organizationName.trim()) {

      errors.organizationName =
        'Введите название организации'

      valid = false

    }

    const innDigits =
      form.inn.replace(/\D/g, '')

    if (
      innDigits.length !== 10 &&
      innDigits.length !== 12
    ) {

      errors.inn =
        'Введите корректный ИНН'

      valid = false

    }

  }

  /*
  |--------------------------------------------------------------------------
  | LENGTH
  |--------------------------------------------------------------------------
  */

  if (
    !form.length ||
    Number(form.length) <= 0
  ) {

    errors.length =
      'Введите длину ограждения'

    valid = false

  }

  /*
  |--------------------------------------------------------------------------
  | CUSTOM RAL
  |--------------------------------------------------------------------------
  */

  if (
    form.color === 'custom' &&
    !form.customColor.trim()
  ) {

    errors.customColor =
      'Введите RAL или цвет'

    valid = false

  }

  /*
  |--------------------------------------------------------------------------
  | DISCOUNT LIMITS
  |--------------------------------------------------------------------------
  */

  if (form.customDiscount < 0) {
    form.customDiscount = 0
  }

  if (form.customDiscount > 100) {
    form.customDiscount = 100
  }

  return valid

}

/*
|--------------------------------------------------------------------------
| SPORT FENCE
|--------------------------------------------------------------------------
*/

const finalFenceHeight = computed(() => {

  if (!form.isSportFence) {
    return Number(form.height)
  }

  return (
    Number(form.height) *
    Number(form.sportRows)
  )

})

/*
|--------------------------------------------------------------------------
| CALCULATION
|--------------------------------------------------------------------------
*/

const calculation = computed(() => {

  return calculateOrder({

    ...form,

    finalFenceHeight:
      finalFenceHeight.value,

  })

})

const totalPrice = computed(() => {

  return Number(
    calculation.value?.totalPrice || 0
  )

})

const wicketHeightWarning = computed(() => {

  if (Number(form.wicketCount) <= 0) {
    return ''
  }

  if (
    Number(form.wicketHeight) !==
    Number(form.height)
  ) {
    return 'Высота калитки отличается от высоты ограждения. Проверьте корректность параметров.'
  }

  return ''

})

/*
|--------------------------------------------------------------------------
| SAVE
|--------------------------------------------------------------------------
*/

const submitRequest = async () => {

  const isValid =
    validateForm()

  if (!isValid) {
    return
  }

  try {

    saving.value = true

    const result =
      await createRequest({

        ...form,

        /*
        |--------------------------------------------------------------------------
        | HEIGHT
        |--------------------------------------------------------------------------
        */

        status: 'Заказ рассчитан',

        actualFenceHeight:
          finalFenceHeight.value,

        /*
        |--------------------------------------------------------------------------
        | CALCULATION
        |--------------------------------------------------------------------------
        */

        calculation:
          calculation.value,

        totalPrice:
          totalPrice.value,

        /*
        |--------------------------------------------------------------------------
        | ORDER FLOW
        |--------------------------------------------------------------------------
        */

        convertedToOrder: false,

        orderId: null,

        /*
        |--------------------------------------------------------------------------
        | TIMESTAMPS
        |--------------------------------------------------------------------------
        */

        createdAt:
          serverTimestamp(),

        updatedAt:
          serverTimestamp(),

      })

    if (result.success) {

      alert(
        'Заявка успешно сохранена'
      )

      Object.assign(
        form,
        defaultForm()
      )

    } else {

      alert(
        'Ошибка сохранения'
      )

    }

  } catch (error) {

    console.log(error)

    alert(
      'Ошибка сохранения'
    )

  } finally {

    saving.value = false

  }

}
const sourceOptions = [
  'Авито',
  'Новый сайт',
  'Старый сайт',
  '2ГИС',
  'Звонок',
  'Рекомендация',
  'Повторный клиент',
  'Другое',
]

</script>

<template>

  <div>

    <div class="mb-8">

      <h1 class="text-4xl font-bold text-gray-800">
        Создание заявки
      </h1>

      <p class="text-gray-400 mt-2">
        Расчет стоимости 3D ограждений
      </p>

    </div>

    <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">

      <!-- LEFT -->

      <div class="xl:col-span-2 space-y-6">

        <!-- CLIENT -->

        <div class="card">

          <h2 class="title">
            Контактные данные
          </h2>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">

            <div>

              <label class="label">
                ФИО *
              </label>

              <input
                v-model="form.clientName"
                type="text"
                class="input"
                placeholder="Иванов Иван Иванович"
              />

              <p
                v-if="errors.clientName"
                class="error"
              >
                {{ errors.clientName }}
              </p>

            </div>

            <div>

              <label class="label">
                Телефон *
              </label>

              <input
                v-model="form.clientPhone"
                type="text"
                class="input"
                placeholder="+79999999999"
              />

              <p
                v-if="errors.clientPhone"
                class="error"
              >
                {{ errors.clientPhone }}
              </p>

            </div>

            <div class="md:col-span-2">

              <label class="label">
                Email
              </label>

              <input
                v-model="form.clientEmail"
                type="email"
                class="input"
              />

              <p
                v-if="errors.clientEmail"
                class="error"
              >
                {{ errors.clientEmail }}
              </p>

            </div>

            <div>
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

            <template v-if="form.clientType === 'Юридическое лицо'">

              <div>
                <label class="label">
                  Название организации *
                </label>

                <input
                  v-model="form.organizationName"
                  type="text"
                  class="input"
                  placeholder='ООО "Россетка"'
                />

                <p
                  v-if="errors.organizationName"
                  class="error"
                >
                  {{ errors.organizationName }}
                </p>
              </div>

              <div>
                <label class="label">
                  ИНН *
                </label>

                <input
                  v-model="form.inn"
                  type="text"
                  class="input"
                  placeholder="5901234567"
                />

                <p
                  v-if="errors.inn"
                  class="error"
                >
                  {{ errors.inn }}
                </p>
              </div>

            </template>

            <div>
              <label class="label">
                Источник обращения
              </label>

              <select
                v-model="form.source"
                class="input"
              >
                <option
                  v-for="source in sourceOptions"
                  :key="source"
                >
                  {{ source }}
                </option>
              </select>
            </div>

            <div>
              <label class="label">
                Город / регион объекта
              </label>

              <input
                v-model="form.city"
                type="text"
                class="input"
                placeholder="Например: Пермь"
              />
            </div>

          </div>

        </div>

        <!-- FENCE -->

        <div class="card">

          <h2 class="title">
            Блок 1. Геометрия
          </h2>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">

            <div>
              <label class="label">Длина ограждения (м)</label>
              <input v-model="form.length" @input="normalizeInteger('length')" type="number" min="0" step="1" class="input" />
              <p v-if="errors.length" class="error">{{ errors.length }}</p>
            </div>

            <div>
              <label class="label">Высота ограждения</label>
              <select v-model="form.height" class="input">
                <option v-for="height in panelHeightOptions" :key="height" :value="height">{{ height }} мм</option>
              </select>
            </div>

            <div>
              <label class="label">Количество углов</label>
              <input v-model="form.cornersCount" @input="normalizeInteger('cornersCount')" type="number" min="0" step="1" class="input" />
            </div>

            <div>
              <label class="label">Количество калиток</label>
              <input v-model="form.wicketCount" @input="normalizeInteger('wicketCount')" type="number" min="0" step="1" class="input" />
            </div>

            <div>
              <label class="label">Количество распашных ворот</label>
              <input v-model="form.swingGateCount" @input="normalizeInteger('swingGateCount')" type="number" min="0" step="1" class="input" />
            </div>

            <div>
              <label class="label">Количество откатных ворот</label>
              <input v-model="form.slidingGateCount" @input="normalizeInteger('slidingGateCount')" type="number" min="0" step="1" class="input" />
            </div>

            <div>
              <label class="label">Стоимость доставки</label>
              <input v-model="form.deliveryPriceManual" @input="normalizeInteger('deliveryPriceManual')" type="number" min="0" step="1" class="input" />
            </div>

            <div>
              <label class="label">Стоимость монтажа</label>
              <input v-model="form.installationPriceManual" @input="normalizeInteger('installationPriceManual')" type="number" min="0" step="1" class="input" />
            </div>

          </div>

        </div>

        <div class="card">

          <h2 class="title">
            Блок 2. Параметры панелей
          </h2>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">

            <div>
              <label class="label">Диаметр проволоки</label>
              <select v-model="form.wire" class="input">
                <option v-for="wire in wireOptions" :key="wire" :value="wire">{{ wire }} мм</option>
              </select>
            </div>

            <div>
              <label class="label">Высота панели</label>
              <select v-model="form.height" class="input">
                <option v-for="height in panelHeightOptions" :key="height" :value="height">{{ height }} мм</option>
              </select>
            </div>

            <div>
              <label class="label">Спортивная площадка / несколько рядов</label>
              <select v-model="form.isSportFence" class="input">
                <option :value="false">Нет</option>
                <option :value="true">Да</option>
              </select>
            </div>

            <div v-if="form.isSportFence">
              <label class="label">Количество рядов секций</label>
              <input v-model="form.sportRows" @input="normalizeInteger('sportRows')" type="number" min="1" step="1" class="input" />
              <p class="hint">Итоговая высота: {{ finalFenceHeight }} мм</p>
            </div>

            <div>
              <label class="label">Покрытие</label>
              <select v-model="form.coating" class="input">
                <option v-for="coating in coatingOptions" :key="coating.value" :value="coating.value">{{ coating.label }}</option>
              </select>
            </div>

            <div>
              <label class="label">Ширина панели</label>
              <select v-model="form.width" class="input">
                <option :value="2500">2500 мм</option>
                <option :value="3000">3000 мм</option>
              </select>
            </div>

            <div>
              <label class="label">Размер ячейки</label>
              <select v-model="form.cell" class="input">
                <option v-for="cell in cellOptions" :key="cell" :value="cell">{{ cell }}</option>
              </select>
            </div>

          </div>

        </div>

        <div class="card">

          <h2 class="title">
            Блок 3. Цвет
          </h2>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">

            <div>
              <label class="label">Цвет</label>
              <select v-model="form.color" class="input">
                <option v-for="color in colors" :key="color.value" :value="color.value">{{ color.label }}</option>
              </select>
              <input v-if="form.color === 'custom'" v-model="form.customColor" type="text" class="input mt-3" placeholder="Введите RAL или цвет" />
              <p v-if="errors.customColor" class="error">{{ errors.customColor }}</p>
            </div>

            <div class="notice">
              Для любого цвета, кроме RAL 6005, автоматически применяется надбавка: +20% при материалах менее 50 000 ₽ и +10% при материалах от 50 000 ₽.
            </div>

          </div>

        </div>

        <div class="card">

          <h2 class="title">
            Блок 4. Крепеж
          </h2>

          <select v-model="form.fastening" class="input">
            <option v-for="fastening in fasteningOptions" :key="fastening.value" :value="fastening.value">{{ fastening.label }}</option>
          </select>

        </div>

        <!-- WICKET -->

        <div class="card">
          <h2 class="title">
            Блок 5. Калитки
          </h2>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">

            <template v-if="form.wicketCount > 0">

              <div>
                <label class="label">Тип калитки</label>
                <select v-model="form.wicketType" class="input">
                  <option value="standard">Калитка Стандарт</option>
                  <option value="lock">Калитка Стандарт с замком</option>
                </select>
              </div>

              <div>
                <label class="label">
                  Высота калитки
                </label>

                <select
                  v-model="form.wicketHeight"
                  class="input"
                >
                  <option
                    v-for="height in gateHeightOptions"
                    :key="height"
                    :value="height"
                  >
                    {{ height }} мм
                  </option>
                </select>

                <p
                  v-if="wicketHeightWarning"
                  class="warning"
                >
                  {{ wicketHeightWarning }}
                </p>
              </div>

              <div>
                <label class="label">Ширина калитки</label>
                <div class="input bg-gray-50 text-gray-500">
                  1000 мм
                </div>
              </div>

            </template>

            <p v-else class="hint md:col-span-2">
              Калитка не выбрана. Количество калиток задается в блоке «Геометрия».
            </p>

          </div>

        </div>

        <div class="card">

          <h2 class="title">
            Блок 6. Ворота
          </h2>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">

            <template v-if="form.swingGateCount > 0">
              <div class="md:col-span-2 subtitle">Распашные ворота</div>

              <div>
                <label class="label">Высота</label>
                <select v-model="form.swingGateHeight" class="input">
                  <option v-for="height in gateHeightOptions" :key="height" :value="height">{{ height }} мм</option>
                </select>
              </div>

              <div>
                <label class="label">Ширина проема</label>
                <select v-model="form.swingGateWidth" class="input">
                  <option v-for="width in gateWidthOptions" :key="width" :value="width">{{ width }} мм</option>
                </select>
              </div>
            </template>

            <template v-if="form.slidingGateCount > 0">
              <div class="md:col-span-2 subtitle">Откатные ворота</div>

              <div>
                <label class="label">Высота</label>
                <select v-model="form.slidingGateHeight" class="input">
                  <option v-for="height in gateHeightOptions" :key="height" :value="height">{{ height }} мм</option>
                </select>
              </div>

              <div>
                <label class="label">Ширина проема</label>
                <select v-model="form.slidingGateWidth" class="input">
                  <option v-for="width in gateWidthOptions" :key="width" :value="width">{{ width }} мм</option>
                </select>
              </div>
            </template>

            <p v-if="form.swingGateCount === 0 && form.slidingGateCount === 0" class="hint md:col-span-2">
              Ворота не выбраны. Количество ворот задается в блоке «Геометрия».
            </p>

          </div>

        </div>

        <!-- FINANCE -->

        <div class="card">

          <h2 class="title">
            Дополнительные параметры
          </h2>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">

            <div>
              <label class="label">Скидка (%)</label>
              <input v-model="form.customDiscount" @input="normalizeInteger('customDiscount')" type="number" min="0" max="100" step="1" class="input" />
            </div>

            <div class="notice">
              Доставка и монтаж не рассчитываются автоматически. Эти значения вводятся менеджером вручную в блоке «Геометрия».
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

        <div class="card sticky top-6 max-h-[calc(100vh-48px)] overflow-y-auto">

          <h2 class="title">
            Расчет стоимости
          </h2>

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
                  <p>{{ row.quantity }} шт. × {{ Number(row.unitPrice || 0).toLocaleString() }} ₽</p>
                </div>
                <strong>{{ Number(row.sum || 0).toLocaleString() }} ₽</strong>
              </div>
            </div>

            <div v-if="calculation.coefficients?.length" class="summary-box">
              <div class="summary-title">Коэффициенты</div>
              <p v-for="coefficient in calculation.coefficients" :key="coefficient" class="hint">
                {{ coefficient }}
              </p>
            </div>


            <div class="line">
              <span>Итоговая высота</span>

              <strong>
                {{ finalFenceHeight }} мм
              </strong>
            </div>


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

              <span>Крепления</span>

              <strong>
                {{ Number(calculation.fasteningPrice || 0).toLocaleString() }} ₽
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

            <div class="line">

              <span>Стоимость материалов</span>

              <strong>
                {{ Number(calculation.materialsPrice || 0).toLocaleString() }} ₽
              </strong>

            </div>

            <div class="line">

              <span>НДС 22%</span>

              <strong>
                {{ Number(calculation.vatPrice || 0).toLocaleString() }} ₽
              </strong>

            </div>

            <div class="notice">
              {{ calculation.calculationComment }}
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

            {{
              saving
                ? 'Сохранение...'
                : 'Сохранить заявку'
            }}

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

.error {
  @apply text-red-500 text-sm mt-1;
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

.hint {
  @apply text-sm text-gray-400 mt-2;
}

.notice {
  @apply text-sm text-gray-500 bg-gray-50 rounded-2xl p-4 leading-relaxed;
}

.subtitle {
  @apply text-lg font-semibold text-gray-700 mt-2;
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

.warning {
  @apply text-orange-500 text-sm mt-2;
}
</style>