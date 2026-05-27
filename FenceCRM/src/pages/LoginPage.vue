<script setup>

import {
  signInWithEmailAndPassword,
} from 'firebase/auth'

import {
  reactive,
  ref,
} from 'vue'

import {
  useRouter,
} from 'vue-router'

import {
  auth,
} from '../firebase'

// =====================================
// ROUTER
// =====================================

const router = useRouter()

// =====================================
// STATE
// =====================================

const loading = ref(false)

const errorMessage = ref('')

const form = reactive({

  email: '',
  password: '',

})

// =====================================
// LOGIN
// =====================================

const login = async () => {

  errorMessage.value = ''

  if (!form.email) {

    errorMessage.value =
      'Введите email'

    return

  }

  if (!form.password) {

    errorMessage.value =
      'Введите пароль'

    return

  }

  try {

    loading.value = true

    await signInWithEmailAndPassword(

      auth,

      form.email.trim(),

      form.password

    )

    router.push('/dashboard')

  } catch (error) {

    console.log(error)

    if (
      error.code ===
      'auth/invalid-email'
    ) {

      errorMessage.value =
        'Некорректный email'

    } else if (
      error.code ===
      'auth/user-not-found'
    ) {

      errorMessage.value =
        'Пользователь не найден'

    } else if (
      error.code ===
      'auth/wrong-password'
    ) {

      errorMessage.value =
        'Неверный пароль'

    } else if (
      error.code ===
      'auth/invalid-credential'
    ) {

      errorMessage.value =
        'Неверный email или пароль'

    } else {

      errorMessage.value =
        'Ошибка авторизации'

    }

  } finally {

    loading.value = false

  }

}

</script>

<template>

  <div
    class="min-h-screen bg-[#F5F7FB] flex items-center justify-center p-6"
  >

    <div
      class="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 border border-gray-100"
    >

      <!-- TITLE -->

      <div class="text-center mb-8">

        <h1
          class="text-4xl font-bold text-[#0044AA]"
        >
          Россетка CRM
        </h1>

        <p class="text-gray-400 mt-3">
          Вход в систему
        </p>

      </div>

      <!-- ERROR -->

      <div
        v-if="errorMessage"
        class="mb-5 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-2xl text-sm"
      >
        {{ errorMessage }}
      </div>

      <!-- FORM -->

      <form
        class="space-y-5"
        @submit.prevent="login"
      >

        <div>

          <label class="label">
            Email
          </label>

          <input
            v-model="form.email"
            type="email"
            class="input"
            placeholder="manager@rossetka.ru"
            autocomplete="email"
          />

        </div>

        <div>

          <label class="label">
            Пароль
          </label>

          <input
            v-model="form.password"
            type="password"
            class="input"
            placeholder="Введите пароль"
            autocomplete="current-password"
          />

        </div>

        <button
          type="submit"
          :disabled="loading"
          class="login-btn"
        >

          <span v-if="loading">
            Вход...
          </span>

          <span v-else>
            Войти
          </span>

        </button>

      </form>

    </div>

  </div>

</template>

<style scoped>

.input {
  @apply w-full border border-gray-200 rounded-2xl px-5 py-4 outline-none transition;
}

.input:focus {
  @apply border-[#0044AA];
}

.label {
  @apply block mb-2 text-sm font-semibold text-gray-500;
}

.login-btn {
  @apply w-full bg-[#0044AA] hover:bg-[#003380] text-white py-4 rounded-2xl font-semibold transition disabled:opacity-60 disabled:cursor-not-allowed;
}

</style>