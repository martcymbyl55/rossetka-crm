<script setup>

import {
  doc,
  getDoc,
  setDoc,
} from 'firebase/firestore'

import {
  reactive,
  ref,
  onMounted,
} from 'vue'

import { db } from '../firebase'

// =====================================
// DATA
// =====================================

const loading = ref(true)

const saving = ref(false)

const settings = reactive({

  companyName: '',

  managerName: '',

  managerEmail: '',

  managerPhone: '',

  address: '',

  inn: '',

  website: '',

  primaryColor: '#0044AA',

})

// =====================================
// LOAD
// =====================================

onMounted(async () => {

  try {

    const snapshot = await getDoc(
      doc(db, 'settings', 'main')
    )

    if (snapshot.exists()) {

      Object.assign(
        settings,
        snapshot.data()
      )

    }

  } catch (error) {

    console.log(error)

  } finally {

    loading.value = false

  }

})

// =====================================
// SAVE
// =====================================

const saveSettings = async () => {

  try {

    saving.value = true

    await setDoc(

      doc(db, 'settings', 'main'),

      {

        ...settings,

      }

    )

    alert('Настройки сохранены')

  } catch (error) {

    console.log(error)

    alert('Ошибка сохранения')

  } finally {

    saving.value = false

  }

}

</script>

<template>

  <div
    v-if="loading"
    class="text-center py-20 text-gray-400"
  >
    Загрузка настроек...
  </div>

  <div
    v-else
    class="space-y-8"
  >

    <!-- HEADER -->

    <div>

      <h1 class="text-4xl font-bold text-gray-800">
        Настройки
      </h1>

      <p class="text-gray-400 mt-2">
        Конфигурация CRM системы
      </p>

    </div>

    <!-- FORM -->

    <div class="card">

      <div class="grid grid-cols-1 md:grid-cols-2 gap-5">

        <!-- COMPANY -->

        <div>

          <label class="label">
            Название компании
          </label>

          <input
            v-model="settings.companyName"
            type="text"
            class="input"
            placeholder="ООО Россетка"
          />

        </div>

        <!-- MANAGER -->

        <div>

          <label class="label">
            Имя менеджера
          </label>

          <input
            v-model="settings.managerName"
            type="text"
            class="input"
            placeholder="Иван Иванов"
          />

        </div>

        <!-- EMAIL -->

        <div>

          <label class="label">
            Email
          </label>

          <input
            v-model="settings.managerEmail"
            type="email"
            class="input"
            placeholder="manager@mail.ru"
          />

        </div>

        <!-- PHONE -->

        <div>

          <label class="label">
            Телефон
          </label>

          <input
            v-model="settings.managerPhone"
            type="text"
            class="input"
            placeholder="+7 (999) 999-99-99"
          />

        </div>

        <!-- ADDRESS -->

        <div class="md:col-span-2">

          <label class="label">
            Адрес
          </label>

          <input
            v-model="settings.address"
            type="text"
            class="input"
            placeholder="г. Пермь, ул. Ленина, 1"
          />

        </div>

        <!-- INN -->

        <div>

          <label class="label">
            ИНН
          </label>

          <input
            v-model="settings.inn"
            type="text"
            class="input"
            placeholder="5900000000"
          />

        </div>

        <!-- WEBSITE -->

        <div>

          <label class="label">
            Сайт
          </label>

          <input
            v-model="settings.website"
            type="text"
            class="input"
            placeholder="https://site.ru"
          />

        </div>

        <!-- COLOR -->

        <div>

          <label class="label">
            Основной цвет CRM
          </label>

          <div class="flex items-center gap-4">

            <input
              v-model="settings.primaryColor"
              type="color"
              class="color-input"
            />

            <div class="text-sm text-gray-500">
              {{ settings.primaryColor }}
            </div>

          </div>

        </div>

      </div>

      <!-- BUTTON -->

      <div class="mt-8">

        <button
          @click="saveSettings"
          :disabled="saving"
          class="save-btn"
        >

          <span v-if="saving">
            Сохранение...
          </span>

          <span v-else>
            Сохранить настройки
          </span>

        </button>

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

.label {
  @apply block mb-2 text-sm font-semibold text-gray-500;
}

.save-btn {
  @apply bg-[#0044AA]
  hover:bg-[#003380]
  disabled:opacity-50
  disabled:cursor-not-allowed
  text-white
  py-4
  px-6
  rounded-2xl
  font-semibold
  transition;
}

.color-input {
  @apply w-20 h-14 rounded-2xl border border-gray-200 overflow-hidden cursor-pointer;
}

</style>