import {
  reactive,
} from 'vue'

import {
  doc,
  getDoc,
} from 'firebase/firestore'

import {
  onAuthStateChanged,
} from 'firebase/auth'

import {
  auth,
  db,
} from '../firebase'

export const authStore = reactive({

  user: null,

  role: null,

  loading: true,

})

onAuthStateChanged(auth, async (user) => {

  if (!user) {

    authStore.user = null

    authStore.role = null

    authStore.loading = false

    return

  }

  authStore.user = user

  try {

    const userDoc = await getDoc(
      doc(db, 'users', user.uid)
    )

    if (userDoc.exists()) {

      authStore.role =
        userDoc.data().role

    }

  } catch (error) {

    console.log(error)

  }

  authStore.loading = false

})  