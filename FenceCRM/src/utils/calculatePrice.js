export function calculatePrice(data) {

  let total = 0

  // =====================================
  // БАЗОВЫЕ ДАННЫЕ
  // =====================================

  const length =
    Number(data.length) || 0

  const height =
    Number(data.height) || 0

  const width =
    Number(data.width) || 2500

  const discount =
    Number(data.discount)
    ||
    Number(data.customDiscount)
    ||
    0

  // =====================================
  // 3D ЗАБОР
  // =====================================

  if (data.type === '3d') {

    const PANEL_PRICES = {

      '3': {

        1530: {
          zinc: 1070,
          green: 1290,
        },

        1730: {
          zinc: 1190,
          green: 1430,
        },

        2030: {
          zinc: 1410,
          green: 1680,
        },

      },

      '4': {

        1030: {
          zinc: 980,
          green: 1120,
        },

        1230: {
          zinc: 1130,
          green: 1290,
        },

        1530: {
          zinc: 1380,
          green: 1600,
        },

        1730: {
          zinc: 1530,
          green: 1770,
        },

        2030: {
          zinc: 1820,
          green: 2090,
        },

      },

      '5': {

        1030: {
          zinc: 1580,
          green: 1720,
        },

        1230: {
          zinc: 1820,
          green: 1990,
        },

        1530: {
          zinc: 2230,
          green: 2450,
        },

        1730: {
          zinc: 2480,
          green: 2720,
        },

        2030: {
          zinc: 2940,
          green: 3220,
        },

      },

    }

    const isGreen =
      data.color === 'green'

    const colorType =
      isGreen
        ? 'green'
        : 'zinc'

    const sectionCount = Math.ceil(
      (length * 1000) / width
    )

    let panelPrice =
      Number(
        PANEL_PRICES[data.wire]?.[height]?.[colorType]
      ) || 0

    // =====================================
    // ШИРИНА 3000
    // =====================================

    if (width === 3000) {
      panelPrice *= 1.2
    }

    // =====================================
    // НЕСТАНДАРТНЫЙ ЦВЕТ
    // =====================================

    if (
      data.color !== 'green'
      &&
      data.color !== 'zinc'
    ) {

      if (panelPrice * sectionCount < 50000) {

        panelPrice *= 1.2

      } else {

        panelPrice *= 1.1

      }

    }

    // =====================================
    // 5ММ ЦИНК
    // =====================================

    if (
      String(data.wire) === '5'
      &&
      colorType === 'zinc'
    ) {

      panelPrice *= 1.08

    }

    // =====================================
    // ПАНЕЛИ
    // =====================================

    total +=
      sectionCount * panelPrice

    // =====================================
    // СТОЛБЫ
    // =====================================

    const pillarsCount =
      sectionCount + 1

    let pillarPrice = 0

    if (
      data.pillars === '60x40'
    ) {

      if (height <= 1530) {

        pillarPrice =
          isGreen
            ? 700
            : 540

      }

      else if (height <= 2030) {

        pillarPrice =
          isGreen
            ? 910
            : 710

      }

      else {

        pillarPrice =
          isGreen
            ? 1110
            : 880

      }

    }

    if (
      data.pillars === '60x60'
    ) {

      if (height <= 1530) {

        pillarPrice =
          isGreen
            ? 1080
            : 950

      }

      else if (height <= 2030) {

        pillarPrice =
          isGreen
            ? 1390
            : 1170

      }

      else {

        pillarPrice =
          isGreen
            ? 1830
            : 1550

      }

    }

    if (
      data.pillars === '80x80'
    ) {

      pillarPrice = 3610

    }

    total +=
      pillarsCount * pillarPrice

    // =====================================
    // КРЕПЛЕНИЯ
    // =====================================

    const fixingPrice =
      isGreen
        ? 80
        : 70

    total +=
      sectionCount * fixingPrice

    // =====================================
    // КАЛИТКА
    // =====================================

    if (data.wicket === 'hooks') {

      if (height <= 1450) {
        total += 9100
      }

      else if (height <= 1750) {
        total += 10100
      }

      else {
        total += 10500
      }

    }

    if (data.wicket === 'lock') {

      if (height <= 1450) {
        total += 18100
      }

      else if (height <= 1750) {
        total += 19100
      }

      else {
        total += 19500
      }

    }

    // =====================================
    // ВОРОТА
    // =====================================

    if (
      data.gate === 'swing'
    ) {

      if (height <= 1450) {
        total += 31200
      }

      else if (height <= 1750) {
        total += 33500
      }

      else {
        total += 37700
      }

    }

    if (
      data.gate === 'sliding'
    ) {

      if (height <= 1450) {
        total += 71400
      }

      else if (height <= 1750) {
        total += 73900
      }

      else {
        total += 81800
      }

    }

  }

  // =====================================
  // ГАБИОНЫ
  // =====================================

  if (data.type === 'gabion') {

    total += length * 4500

  }

  // =====================================
  // ВРЕМЕННОЕ ОГРАЖДЕНИЕ
  // =====================================

  if (data.type === 'temporary') {

    total += length * 1800

  }

  // =====================================
  // СВАРНОЕ ОГРАЖДЕНИЕ
  // =====================================

  if (data.type === 'welded') {

    total += length * 3200

  }

  // =====================================
  // ДОСТАВКА
  // =====================================

  total += calculateDelivery(

    data.distance,

    data.deliveryType

  )

  // =====================================
  // МОНТАЖ
  // =====================================

  if (
    data.installationType ===
    'Частичный монтаж'
  ) {

    total += length * 900

  }

  if (
    data.installationType ===
    'Полный монтаж'
  ) {

    total += length * 1500

  }

  // =====================================
  // ДИЛЕРСКАЯ СКИДКА
  // =====================================

  if (
    data.clientType === 'Дилер'
  ) {

    total *= 0.9

  }

  // =====================================
  // ДОП СКИДКА
  // =====================================

  if (discount > 0) {

    total -=
      total * (
        discount / 100
      )

  }

  // =====================================
  // ЗАЩИТА ОТ NaN
  // =====================================

  if (Number.isNaN(total)) {
    return 0
  }

  // =====================================
  // ОКРУГЛЕНИЕ
  // =====================================

  return Math.round(total)

}

// =====================================
// ДОСТАВКА
// =====================================

function calculateDelivery(

  distance,

  deliveryType

) {

  const km =
    Number(distance) || 0

  if (
    deliveryType ===
    'Самовывоз'
  ) {

    return 0

  }

  if (
    deliveryType ===
    'Пермь'
  ) {

    return 3000

  }

  if (
    deliveryType ===
    'Пермский край'
  ) {

    if (km <= 35) {
      return 4000
    }

    if (km <= 50) {
      return 5000
    }

    if (km <= 65) {
      return 6000
    }

    return 7000

  }

  if (
    deliveryType ===
    'Транспортная компания'
  ) {

    return 0

  }

  return 0

}