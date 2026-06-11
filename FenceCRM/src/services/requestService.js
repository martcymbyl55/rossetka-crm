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
    const status = data.status || 'Заказ рассчитан'

    const docRef = await addDoc(
      collection(db, 'requests'),
      {
        // CLIENT
        clientName: data.clientName || '',
        clientEmail: data.clientEmail || '',
        clientPhone: data.clientPhone || '',
        clientType: data.clientType || '',

        organizationName: data.organizationName || '',
        inn: data.inn || '',

        source: data.source || '',
        city: data.city || '',

        // FENCE
        type: data.type || '3d',
        length: Number(data.length) || 0,
        height: Number(data.height) || 0,
        width: Number(data.width) || 0,
        wire: data.wire || '',
        cell: data.cell || '',
        coating: data.coating || '',
        color: data.color || '',
        customColor: data.customColor || '',

        // GEOMETRY
        cornersCount: Number(data.cornersCount) || 0,
        wicketCount: Number(data.wicketCount) || 0,
        swingGateCount: Number(data.swingGateCount) || 0,
        slidingGateCount: Number(data.slidingGateCount) || 0,

        // SPORT
        isSportFence: Boolean(data.isSportFence),
        sportRows: Number(data.sportRows) || 1,
        actualFenceHeight: Number(data.actualFenceHeight) || 0,

        // FASTENING
        fastening: data.fastening || 'standard',

        // WICKET
        wicketType: data.wicketType || 'standard',
        wicketHeight: Number(data.wicketHeight) || 1750,
        wicketWidth: Number(data.wicketWidth) || 1000,

        // GATES
        swingGateHeight: Number(data.swingGateHeight) || 1750,
        swingGateWidth: Number(data.swingGateWidth) || 4000,
        slidingGateHeight: Number(data.slidingGateHeight) || 1750,
        slidingGateWidth: Number(data.slidingGateWidth) || 4000,

        // DELIVERY / INSTALLATION
        deliveryPriceManual: Number(data.deliveryPriceManual) || 0,
        installationPriceManual: Number(data.installationPriceManual) || 0,

        // FINANCE
        customDiscount: Number(data.customDiscount) || 0,
        totalPrice: Number(data.totalPrice) || 0,

        // CALCULATION
        calculation: data.calculation || null,

        // COMMENT
        comment: data.comment || '',

        // STATUS
        status,

        convertedToOrder: Boolean(data.convertedToOrder),
        isProductionOrder: Boolean(data.isProductionOrder),
        productionStatus: data.productionStatus || 'Не запущен',

        // DATES
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      }
    )

    await addDoc(
      collection(db, 'requests', docRef.id, 'history'),
      {
        action: 'Создание заявки',
        description: 'Заявка создана и рассчитана',
        status,
        createdAt: Timestamp.now(),
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

export async function updateRequest(id, data) {
  try {
    await updateDoc(
      doc(db, 'requests', id),
      {
        ...data,
        updatedAt: Timestamp.now(),
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
// CHANGE REQUEST STATUS
// =====================================

export async function changeRequestStatus(
  id,
  request,
  newStatus,
  historyText,
  extraData = {}
) {
  try {
    await updateDoc(
      doc(db, 'requests', id),
      {
        status: newStatus,
        ...extraData,
        updatedAt: Timestamp.now(),
      }
    )

    await addDoc(
      collection(db, 'requests', id, 'history'),
      {
        action: 'Изменение статуса',
        description: historyText || `Статус изменен на "${newStatus}"`,
        status: newStatus,
        createdAt: Timestamp.now(),
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
// ADD HISTORY ITEM
// =====================================

export async function addRequestHistory(id, request, text) {
  try {
    await addDoc(
      collection(db, 'requests', id, 'history'),
      {
        action: 'История',
        description: text,
        createdAt: Timestamp.now(),
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