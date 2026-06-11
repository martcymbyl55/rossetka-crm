const panelPrices = {
  '3.5': {
    1530: { zinc: 1070, polymer: 1290 },
    1730: { zinc: 1190, polymer: 1430 },
    2030: { zinc: 1410, polymer: 1680 },
  },
  '4': {
    1030: { zinc: 980, polymer: 1120 },
    1230: { zinc: 1130, polymer: 1290 },
    1530: { zinc: 1380, polymer: 1600 },
    1730: { zinc: 1530, polymer: 1770 },
    2030: { zinc: 1820, polymer: 2090 },
  },
  '5': {
    1030: { zinc: 1580, polymer: 1720 },
    1230: { zinc: 1820, polymer: 1990 },
    1530: { zinc: 2230, polymer: 2450 },
    1730: { zinc: 2480, polymer: 2720 },
    2030: { zinc: 2940, polymer: 3220 },
  },
}

const pillarPrices = {
  '60x60': {
    1500: { zinc: 1080, polymer: 1080 },
    2000: { zinc: 1170, polymer: 1390 },
    2500: { zinc: 1830, polymer: 1830 },
    3000: { zinc: 1750, polymer: 2130 },
  },
}

const fastenerPrices = {
  standard: { zinc: 70, polymer: 80, label: 'Болтовой крепеж с обычной гайкой' },
  antivandal: { zinc: 90, polymer: 100, label: 'Болтовой крепеж с антивандальной гайкой' },
  selftap: { zinc: 40, polymer: 60, label: 'Саморезный крепеж' },
}

const wicketPrices = {
  none: {},
  standard: { label: 'Калитка Стандарт', 1450: 9100, 1750: 10100, 1950: 10500 },
  lock: { label: 'Калитка Стандарт с замком', 1450: 18100, 1750: 19100, 1950: 19500 },
}

const swingGatePrices = {
  1450: { 3000: 26100, 3500: 29900, 4000: 31200, 4500: 33600, 5000: 39200 },
  1750: { 3000: 28100, 3500: 30900, 4000: 33500, 4500: 36700, 5000: 41500 },
  1950: { 3000: 29600, 3500: 32500, 4000: 37700, 4500: 41800, 5000: 45000 },
}

const slidingGatePrices = {
  1450: { 3000: 61300, 3500: 70800, 4000: 71400, 4500: 74100, 5000: 134800 },
  1750: { 3000: 63500, 3500: 73300, 4000: 73900, 4500: 76600, 5000: 137200 },
  1950: { 3000: 65000, 3500: 75100, 4000: 81800, 4500: 84600, 5000: 144500 },
}

const pillarHeightByPanelHeight = {
  1030: 1500,
  1230: 2000,
  1530: 2500,
  1730: 3000,
  2030: 3000,
}

function toInt(value, fallback = 0) {
  const number = parseInt(value, 10)
  return Number.isFinite(number) ? number : fallback
}

function money(value) {
  return Math.round(Number(value) || 0)
}

function addRow(rows, name, characteristics, quantity, unitPrice) {
  const price = money(unitPrice)
  const count = money(quantity)
  const sum = money(count * price)

  if (count <= 0 || price <= 0) {
    return
  }

  rows.push({
    name,
    characteristics,
    quantity: count,
    unitPrice: price,
    sum,
  })
}

export function calculateOrder(form) {
  const rows = []
  const coefficientRows = []

  const length = Math.max(toInt(form.length), 0)
  const height = toInt(form.height, 1530)
  const width = toInt(form.width, 2500)
  const wire = String(form.wire || '4')
  const coating = form.coating || (form.color === 'zinc' ? 'zinc' : 'polymer')
  const color = form.color || 'ral6005'
  const cell = form.cell || '200x55'
  const sportRows = Math.max(toInt(form.sportRows, 1), 1)
  const isSportFence = Boolean(form.isSportFence)
  const cornersCount = Math.max(toInt(form.cornersCount), 0)
  const wicketCount = Math.max(toInt(form.wicketCount), 0)
  const swingGateCount = Math.max(toInt(form.swingGateCount), 0)
  const slidingGateCount = Math.max(toInt(form.slidingGateCount), 0)
  const holesPerPost = Math.max(toInt(form.holesPerPost, 2), 1)

  const panelWidthMeters = width / 1000
  const panelsInRow = Math.ceil(length / panelWidthMeters)
  const panelsCount = panelsInRow * (isSportFence ? sportRows : 1)
  const finalFenceHeight = isSportFence ? height * sportRows : height

  const basePanelPrice = Number(panelPrices[wire]?.[height]?.[coating]) || 0
  let panelUnitPrice = basePanelPrice
  const coefficients = []

  if (width === 3000) {
    coefficients.push({ label: 'Ширина панели 3000 мм', value: 1.2 })
  }

  if (cell === '150x55') {
    coefficients.push({ label: 'Ячейка 150×55', value: 1.1 })
  }

  if (cell === '100x55') {
    coefficients.push({ label: 'Ячейка 100×55', value: 1.2 })
  }

  if (['200x50', '150x50', '100x50'].includes(cell)) {
    coefficients.push({ label: 'Ячейка 50 мм', value: 1.08 })
  }

  if (wire === '5') {
    coefficients.push({ label: 'Проволока 5 мм', value: 1.08 })
  }

  coefficients.forEach((coefficient) => {
    panelUnitPrice *= coefficient.value
    coefficientRows.push(`${coefficient.label}: ×${coefficient.value}`)
  })

  let panelsPrice = panelUnitPrice * panelsCount

  if (coating === 'polymer' && color !== 'ral6005') {
    const colorCoefficient = panelsPrice >= 50000 ? 1.1 : 1.2
    panelsPrice *= colorCoefficient
    coefficientRows.push(`Цвет не RAL 6005: ×${colorCoefficient}`)
  }

if (basePanelPrice > 0) {
  addRow(
    rows,
    `Панель 3D Ø${wire} ${coating === 'zinc' ? 'Цинк' : 'ПП'} ${height}`,
    `${width} мм, ячейка ${cell}, ${isSportFence ? `${sportRows} ряда` : '1 ряд'}`,
    panelsCount,
    panelsPrice / (panelsCount || 1),
  )
} else {
  rows.push({
    name: `Панель 3D Ø${wire} ${coating === 'zinc' ? 'Цинк' : 'ПП'} ${height}`,
    characteristics: `${width} мм, ячейка ${cell}, цена не найдена в прайсе`,
    quantity: panelsCount,
    unitPrice: 0,
    sum: 0,
  })

  coefficientRows.push(
    `Для панели Ø${wire} ${height} мм нет цены в прайсе. Выберите другой диаметр или добавьте цену.`
  )
}

  const pillarHeight = pillarHeightByPanelHeight[height] || 3000
  const pillarsCount = panelsInRow + 1 + cornersCount
  const pillarUnitPrice = Number(pillarPrices['60x60']?.[pillarHeight]?.[coating]) || 0
  const pillarsPrice = pillarUnitPrice * pillarsCount

  addRow(
    rows,
    `Столб 60×60×${pillarHeight}`,
    `под панель ${height} мм, углов: ${cornersCount}`,
    pillarsCount,
    pillarUnitPrice,
  )

  const fasteningType = form.fastening || 'standard'
  const fasteningUnit = fastenerPrices[fasteningType]?.[coating] || 0
  const fasteningsCount = panelsCount * holesPerPost
  const fasteningPrice = fasteningUnit * fasteningsCount

  addRow(
    rows,
    fastenerPrices[fasteningType]?.label || 'Крепеж',
    `${holesPerPost} отверстия на столб`,
    fasteningsCount,
    fasteningUnit,
  )

  const wicketType = form.wicketType || 'standard'
  const wicketHeight = toInt(form.wicketHeight, 1750)
  const wicketUnitPrice = Number(wicketPrices[wicketType]?.[wicketHeight]) || 0
  const wicketPrice = wicketCount > 0 ? wicketUnitPrice * wicketCount : 0

  if (wicketCount > 0) {
    addRow(
      rows,
      wicketPrices[wicketType]?.label || 'Калитка',
      `${wicketHeight}×1000 мм`,
      wicketCount,
      wicketUnitPrice,
    )
  }

  const swingGateHeight = toInt(form.swingGateHeight || form.gateHeight, 1750)
  const swingGateWidth = toInt(form.swingGateWidth || form.gateWidth, 4000)
  const swingGateUnitPrice = Number(swingGatePrices[swingGateHeight]?.[swingGateWidth]) || 0
  const swingGatePrice = swingGateUnitPrice * swingGateCount

  addRow(
    rows,
    'Ворота распашные',
    `${swingGateHeight} мм, проем ${swingGateWidth} мм`,
    swingGateCount,
    swingGateUnitPrice,
  )

  const slidingGateHeight = toInt(form.slidingGateHeight || form.gateHeight, 1750)
  const slidingGateWidth = toInt(form.slidingGateWidth || form.gateWidth, 4000)
  const slidingGateUnitPrice = Number(slidingGatePrices[slidingGateHeight]?.[slidingGateWidth]) || 0
  const slidingGatePrice = slidingGateUnitPrice * slidingGateCount

  addRow(
    rows,
    'Ворота откатные',
    `${slidingGateHeight} мм, проем ${slidingGateWidth} мм`,
    slidingGateCount,
    slidingGateUnitPrice,
  )

  const deliveryPrice = Math.max(toInt(form.deliveryPriceManual ?? form.deliveryPrice), 0)
  const installationPrice = Math.max(toInt(form.installationPriceManual ?? form.installationPrice), 0)

  addRow(rows, 'Доставка', 'Стоимость указана менеджером вручную', deliveryPrice > 0 ? 1 : 0, deliveryPrice)
  addRow(rows, 'Монтаж', 'Стоимость указана менеджером вручную', installationPrice > 0 ? 1 : 0, installationPrice)

  const materialsPrice = panelsPrice + pillarsPrice
  const gatesPrice = swingGatePrice + slidingGatePrice
  const subtotalWithoutVat = materialsPrice + fasteningPrice + gatesPrice + wicketPrice + deliveryPrice + installationPrice

  const discount = Math.min(Math.max(toInt(form.customDiscount), 0), 100)
  const discountAmount = subtotalWithoutVat * discount / 100
  const subtotalAfterDiscount = subtotalWithoutVat - discountAmount
  const vatPrice = subtotalAfterDiscount * 0.22
  const totalPrice = subtotalAfterDiscount + vatPrice

  return {
    panelsCount,
    panelsInRow,
    pillarsCount,
    pillarHeight,
    fasteningsCount,
    finalFenceHeight,
    rows,
    estimateRows: rows,
    coefficients: coefficientRows,
    panelsPrice: money(panelsPrice),
    pillarsPrice: money(pillarsPrice),
    materialsPrice: money(materialsPrice),
    fasteningPrice: money(fasteningPrice),
    wicketPrice: money(wicketPrice),
    gatePrice: money(gatesPrice),
    deliveryPrice: money(deliveryPrice),
    installationPrice: money(installationPrice),
    discountAmount: money(discountAmount),
    vatPrice: money(vatPrice),
    totalPrice: money(totalPrice),
    isApproximate: true,
    calculationComment:
      'Стоимость является предварительной и может корректироваться менеджером с учетом объема заказа, региона монтажа, доставки, особенностей объекта и индивидуальных условий заказчика.',
  }
}
