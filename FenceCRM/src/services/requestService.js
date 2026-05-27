import {

  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  Timestamp,

} from 'firebase/firestore'

import { db } from '../firebase'

// =====================================
// CREATE REQUEST
// =====================================

export async function createRequest(data) {

  try {

    const docRef = await addDoc(

      collection(db, 'requests'),

      {

        // =====================================
        // CLIENT
        // =====================================

        clientName:
          data.clientName || '',

        clientEmail:
          data.clientEmail || '',

        clientPhone:
          data.clientPhone || '',

        clientType:
          data.clientType || '',

        // =====================================
        // FENCE
        // =====================================

        type:
          data.type || '',

        length:
          Number(data.length) || 0,

        height:
          Number(data.height) || 0,

        width:
          Number(data.width) || 0,

        wire:
          data.wire || '',

        gate:
          data.gate || '',

        wicket:
          data.wicket || '',

        pillars:
          data.pillars || '',

        color:
          data.color || '',

        customColor:
          data.customColor || '',

        // =====================================
        // DELIVERY
        // =====================================

        distance:
          Number(data.distance) || 0,

        deliveryType:
          data.deliveryType || '',

        deliveryPrice:
          Number(data.deliveryPrice) || 0,

        // =====================================
        // INSTALLATION
        // =====================================

        installationType:
          data.installationType || '',

        installationPrice:
          Number(data.installationPrice) || 0,

        // =====================================
        // DISCOUNT
        // =====================================

        customDiscount:
          Number(data.customDiscount) || 0,

        finalDiscount:
          Number(data.finalDiscount) || 0,

        // =====================================
        // COMMENT
        // =====================================

        comment:
          data.comment || '',

        // =====================================
        // TOTAL
        // =====================================

        totalPrice:
          Number(data.totalPrice) || 0,

        // =====================================
        // STATUS
        // =====================================

        status:
          data.status || 'Новая заявка',

        // =====================================
        // DATES
        // =====================================

        createdAt:
          Timestamp.now(),

        updatedAt:
          Timestamp.now(),

      }

    )

    return {

      success: true,

      id: docRef.id,

    }

  } catch (error) {

    console.error(error)

    return {

      success: false,

      error,

    }

  }

}

// =====================================
// UPDATE REQUEST
// =====================================

export async function updateRequest(

  id,

  data

) {

  try {

    await updateDoc(

      doc(db, 'requests', id),

      {

        ...data,

        updatedAt:
          Timestamp.now(),

      }

    )

    return {

      success: true,

    }

  } catch (error) {

    console.error(error)

    return {

      success: false,

      error,

    }

  }

}

// =====================================
// DELETE REQUEST
// =====================================

export async function deleteRequest(id) {

  try {

    await deleteDoc(

      doc(db, 'requests', id)

    )

    return {

      success: true,

    }

  } catch (error) {

    console.error(error)

    return {

      success: false,

      error,

    }

  }

}