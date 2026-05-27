import {
  addDoc,
  collection,
  serverTimestamp,
} from 'firebase/firestore'

import { db } from '../firebase'

export const addHistoryRecord = async (

  requestId,
  action,
  description

) => {

  try {

    await addDoc(

      collection(
        db,
        'requests',
        requestId,
        'history'
      ),

      {

        action,
        description,

        createdAt: serverTimestamp(),

      }

    )

  } catch (error) {

    console.log(error)

  }

}