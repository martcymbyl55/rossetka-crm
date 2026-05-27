import { initializeApp } from "firebase/app"

import { getFirestore } from "firebase/firestore"

import { getAuth } from 'firebase/auth'

const firebaseConfig = {

  apiKey: "AIzaSyDuK0yYjNRHWnvPXJjAwzSexsl4IUdmQmE",

  authDomain: "fencecrm-f6d0e.firebaseapp.com",

  projectId: "fencecrm-f6d0e",

  storageBucket: "fencecrm-f6d0e.firebasestorage.app",

  messagingSenderId: "322153021124",

  appId: "1:322153021124:web:e1bf423e679be299d01391"

}

const app = initializeApp(firebaseConfig)

export const db = getFirestore(app)

export const auth = getAuth(app)