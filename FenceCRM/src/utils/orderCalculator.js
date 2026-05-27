export function calculateOrder(form) {

  // =====================================
  // BASE
  // =====================================

  let panelsPrice = 0
  let pillarsPrice = 0
  let gatePrice = 0
  let wicketPrice = 0
  let deliveryPrice = 0
  let installationPrice = 0

  // =====================================
  // LENGTH / HEIGHT
  // =====================================

  const length = Number(form.length) || 0
  const height = Number(form.height) || 0

  // =====================================
  // TYPE PRICE
  // =====================================

  let pricePerMeter = 0

  if (form.type === '3d') {
    pricePerMeter = 1200
  }

  if (form.type === 'gabion') {
    pricePerMeter = 2500
  }

  if (form.type === 'temporary') {
    pricePerMeter = 1800
  }

  if (form.type === 'welded') {
    pricePerMeter = 2100
  }

  // =====================================
  // PANELS
  // =====================================

  const heightCoef = height / 1000

  panelsPrice =
    length *
    pricePerMeter *
    heightCoef

  // =====================================
  // WIRE
  // =====================================

  const wire = String(form.wire)

  if (wire === '4') {
    panelsPrice += 10000
  }

  if (wire === '5') {
    panelsPrice += 20000
  }

  // =====================================
  // PILLARS
  // =====================================

  const pillarsCount =
    Math.ceil(length / 2.5)

  if (form.pillars === '60x40') {

    pillarsPrice =
      pillarsCount * 1500

  }

  if (form.pillars === '60x60') {

    pillarsPrice =
      pillarsCount * 2500

  }

  if (form.pillars === '80x80') {

    pillarsPrice =
      pillarsCount * 4000

  }

  // =====================================
  // WICKET
  // =====================================

  if (form.wicket === 'hooks') {
    wicketPrice = 12000
  }

  if (form.wicket === 'lock') {
    wicketPrice = 18000
  }

  // =====================================
  // GATE
  // =====================================

  if (form.gate === 'swing') {
    gatePrice = 55000
  }

  if (form.gate === 'sliding') {
    gatePrice = 85000
  }

  // =====================================
  // DELIVERY
  // =====================================

  if (form.deliveryType === 'Пермь') {

    deliveryPrice = 5000

  }

  if (form.deliveryType === 'Пермский край') {

    deliveryPrice =
      (Number(form.distance) || 0) * 120

  }

  // =====================================
  // INSTALLATION
  // =====================================

  if (
    form.installationType ===
    'Частичный монтаж'
  ) {

    installationPrice =
      panelsPrice * 0.15

  }

  if (
    form.installationType ===
    'Полный монтаж'
  ) {

    installationPrice =
      panelsPrice * 0.3

  }

  // =====================================
  // TOTAL
  // =====================================

  let total =

    Number(panelsPrice || 0) +
    Number(pillarsPrice || 0) +
    Number(wicketPrice || 0) +
    Number(gatePrice || 0) +
    Number(deliveryPrice || 0) +
    Number(installationPrice || 0)

  // =====================================
  // COLOR EXTRA
  // =====================================

  let colorExtra = 0

  const colored = [

    'brown',
    'black',
    'yellow',
    'gray',
    'blue',
    'custom',

  ]

  if (colored.includes(form.color)) {

    colorExtra = 10

    total =
      total * 1.1

  }

  // =====================================
  // DISCOUNT
  // =====================================

  const discount =
    Number(form.customDiscount) || 0

  if (discount > 0) {

    total =
      total -
      total * discount / 100

  }

  // =====================================
  // NaN PROTECTION
  // =====================================

  panelsPrice =
    Number(panelsPrice) || 0

  pillarsPrice =
    Number(pillarsPrice) || 0

  wicketPrice =
    Number(wicketPrice) || 0

  gatePrice =
    Number(gatePrice) || 0

  deliveryPrice =
    Number(deliveryPrice) || 0

  installationPrice =
    Number(installationPrice) || 0

  total =
    Number(total) || 0

  // =====================================
  // RETURN
  // =====================================

  return {

    panelsPrice:
      Math.round(panelsPrice),

    pillarsPrice:
      Math.round(pillarsPrice),

    wicketPrice:
      Math.round(wicketPrice),

    gatePrice:
      Math.round(gatePrice),

    deliveryPrice:
      Math.round(deliveryPrice),

    installationPrice:
      Math.round(installationPrice),

    colorExtra,

    totalPrice:
      Math.round(total),

  }

}