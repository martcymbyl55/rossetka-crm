import {

  collection,
  addDoc,
  updateDoc,
  doc,
  Timestamp,

} from 'firebase/firestore'

import { db } from '../firebase'

// =====================================
// CREATE ORDER
// =====================================

export async function createOrder(data) {

  try {

    const docRef = await addDoc(

      collection(db, 'orders'),

      {

        // =====================================
        // LINKS
        // =====================================

        requestId:
          data.requestId || null,

        // =====================================
        // CLIENT
        // =====================================

        clientName:
          data.clientName || '',

        clientPhone:
          data.clientPhone || '',

        clientEmail:
          data.clientEmail || '',

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

        color:
          data.color || '',

        customColor:
          data.customColor || '',

        wire:
          data.wire || '',

        pillars:
          data.pillars || '',

        // =====================================
        // GATES
        // =====================================

        wicket:
          data.wicket || false,

        gate:
          data.gate || 'none',

        // =====================================
        // DELIVERY
        // =====================================

        deliveryType:
          data.deliveryType || '',

        installationType:
          data.installationType || '',

        // =====================================
        // PRICE
        // =====================================

        totalPrice:
          Number(data.totalPrice) || 0,

        priceIsApproximate:
          true,

        // =====================================
        // PRODUCTION
        // =====================================

        productionStatus:
          'Новый заказ',

        // =====================================
        // COMMENT
        // =====================================

        comment:
          data.comment || '',

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
// UPDATE ORDER
// =====================================

export async function updateOrder(

  id,

  data

) {

  try {

    await updateDoc(

      doc(db, 'orders', id),

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