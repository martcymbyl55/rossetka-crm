import {

  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  BorderStyle,

} from 'docx'

import { saveAs }
from 'file-saver'

// ========================================
// FORMATTERS
// ========================================

function formatFenceType(type) {

  if (type === '3d') {
    return '3D ограждение'
  }

  if (type === 'gabion') {
    return 'Габион'
  }

  if (type === 'temporary') {
    return 'Временное ограждение'
  }

  if (type === 'welded') {
    return 'Сварное ограждение'
  }

  return type || '-'

}

function formatGate(gate) {

  if (gate === 'sliding') {
    return 'Откатные'
  }

  if (gate === 'swing') {
    return 'Распашные'
  }

  return 'Нет'

}

function formatWicket(wicket) {

  if (wicket === 'hooks') {
    return 'С проушинами'
  }

  if (wicket === 'lock') {
    return 'С замком'
  }

  return 'Нет'

}

function formatColor(color) {

  const colors = {

    green: 'RAL 6005 Зеленый мох',

    zinc: 'Цинк',

    brown: 'Коричневый',

    black: 'Черный',

    gray: 'Серый',

    blue: 'Синий',

    yellow: 'Желтый',

    custom: 'Индивидуальный',

  }

  return colors[color] || color || '-'

}

// ========================================
// TABLE ROW
// ========================================

function createRow(title, value) {

  return new TableRow({

    children: [

      new TableCell({

        width: {
          size: 40,
          type: WidthType.PERCENTAGE,
        },

        children: [

          new Paragraph({

            children: [

              new TextRun({

                text: title,

                bold: true,

                size: 24,

              }),

            ],

          }),

        ],

      }),

      new TableCell({

        width: {
          size: 60,
          type: WidthType.PERCENTAGE,
        },

        children: [

          new Paragraph({

            children: [

              new TextRun({

                text: String(value || '-'),

                size: 24,

              }),

            ],

          }),

        ],

      }),

    ],

  })

}

// ========================================
// EXPORT
// ========================================

export async function exportRequestToWord(request) {

  const currentDate =
    new Date().toLocaleDateString('ru-RU')

  const totalPrice =
    request.totalPrice?.toLocaleString()
    || '0'

  // ========================================
  // DOCUMENT
  // ========================================

  const doc = new Document({

    sections: [

      {

        properties: {},

        children: [

          // ========================================
          // HEADER
          // ========================================

          new Paragraph({

            alignment:
              AlignmentType.CENTER,

            spacing: {
              after: 300,
            },

            children: [

              new TextRun({

                text:
                  'КОММЕРЧЕСКОЕ ПРЕДЛОЖЕНИЕ',

                bold: true,

                size: 38,

              }),

            ],

          }),

          new Paragraph({

            alignment:
              AlignmentType.CENTER,

            spacing: {
              after: 500,
            },

            children: [

              new TextRun({

                text:
                  'Система расчета ограждений',

                italics: true,

                color: '666666',

                size: 24,

              }),

            ],

          }),

          // ========================================
          // CLIENT
          // ========================================

          new Paragraph({

            spacing: {
              after: 250,
            },

            children: [

              new TextRun({

                text:
                  'ИНФОРМАЦИЯ О КЛИЕНТЕ',

                bold: true,

                size: 30,

              }),

            ],

          }),

          new Table({

            width: {
              size: 100,
              type: WidthType.PERCENTAGE,
            },

            borders: {

              top: {
                style: BorderStyle.SINGLE,
                size: 1,
                color: 'D9D9D9',
              },

              bottom: {
                style: BorderStyle.SINGLE,
                size: 1,
                color: 'D9D9D9',
              },

              left: {
                style: BorderStyle.SINGLE,
                size: 1,
                color: 'D9D9D9',
              },

              right: {
                style: BorderStyle.SINGLE,
                size: 1,
                color: 'D9D9D9',
              },

              insideHorizontal: {
                style: BorderStyle.SINGLE,
                size: 1,
                color: 'EAEAEA',
              },

              insideVertical: {
                style: BorderStyle.SINGLE,
                size: 1,
                color: 'EAEAEA',
              },

            },

            rows: [

              createRow(
                'Клиент',
                request.clientName
              ),

              createRow(
                'Телефон',
                request.clientPhone
              ),

              createRow(
                'Email',
                request.clientEmail
              ),

              createRow(
                'Тип клиента',
                request.clientType
              ),

            ],

          }),

          new Paragraph({
            text: '',
            spacing: {
              after: 400,
            },
          }),

          // ========================================
          // ORDER
          // ========================================

          new Paragraph({

            spacing: {
              after: 250,
            },

            children: [

              new TextRun({

                text:
                  'ПАРАМЕТРЫ ЗАКАЗА',

                bold: true,

                size: 30,

              }),

            ],

          }),

          new Table({

            width: {
              size: 100,
              type: WidthType.PERCENTAGE,
            },

            borders: {

              top: {
                style: BorderStyle.SINGLE,
                size: 1,
                color: 'D9D9D9',
              },

              bottom: {
                style: BorderStyle.SINGLE,
                size: 1,
                color: 'D9D9D9',
              },

              left: {
                style: BorderStyle.SINGLE,
                size: 1,
                color: 'D9D9D9',
              },

              right: {
                style: BorderStyle.SINGLE,
                size: 1,
                color: 'D9D9D9',
              },

              insideHorizontal: {
                style: BorderStyle.SINGLE,
                size: 1,
                color: 'EAEAEA',
              },

              insideVertical: {
                style: BorderStyle.SINGLE,
                size: 1,
                color: 'EAEAEA',
              },

            },

            rows: [

              createRow(
                'Тип ограждения',
                formatFenceType(
                  request.type
                )
              ),

              createRow(
                'Длина',
                `${request.length || 0} м`
              ),

              createRow(
                'Высота',
                `${request.height || '-'} мм`
              ),

              createRow(
                'Толщина проволоки',
                `${request.wire || '-'} мм`
              ),

              createRow(
                'Столбы',
                request.pillars || '-'
              ),

              createRow(
                'Калитка',
                formatWicket(
                  request.wicket
                )
              ),

              createRow(
                'Ворота',
                formatGate(
                  request.gate
                )
              ),

              createRow(
                'Цвет',
                formatColor(
                  request.color
                )
              ),

              createRow(
                'Монтаж',
                request.installationType
              ),

              createRow(
                'Доставка',
                request.deliveryType
              ),

              createRow(
                'Расстояние',
                `${request.distance || 0} км`
              ),

              createRow(
                'Скидка',
                `${request.customDiscount || 0}%`
              ),

            ],

          }),

          new Paragraph({
            text: '',
            spacing: {
              after: 500,
            },
          }),

          // ========================================
          // PRICE
          // ========================================

          new Paragraph({

            alignment:
              AlignmentType.CENTER,

            spacing: {
              after: 200,
            },

            children: [

              new TextRun({

                text:
                  'ИТОГОВАЯ СТОИМОСТЬ',

                bold: true,

                size: 34,

              }),

            ],

          }),

          new Paragraph({

            alignment:
              AlignmentType.CENTER,

            spacing: {
              after: 400,
            },

            children: [

              new TextRun({

                text:
                  `${totalPrice} ₽`,

                bold: true,

                size: 48,

                color: '0044AA',

              }),

            ],

          }),

          // ========================================
          // COMMENT
          // ========================================

          new Paragraph({

            spacing: {
              after: 150,
            },

            children: [

              new TextRun({

                text:
                  'Комментарий',

                bold: true,

                size: 26,

              }),

            ],

          }),

          new Paragraph({

            spacing: {
              after: 500,
            },

            children: [

              new TextRun({

                text:
                  request.comment ||
                  'Без комментариев',

                size: 24,

              }),

            ],

          }),

          // ========================================
          // FOOTER
          // ========================================

          new Paragraph({

            alignment:
              AlignmentType.CENTER,

            spacing: {
              after: 150,
            },

            children: [

              new TextRun({

                text:
                  `Дата формирования: ${currentDate}`,

                italics: true,

                color: '666666',

                size: 22,

              }),

            ],

          }),

          new Paragraph({

            alignment:
              AlignmentType.CENTER,

            children: [

              new TextRun({

                text:
                  'Спасибо за обращение!',

                bold: true,

                size: 26,

              }),

            ],

          }),

        ],

      },

    ],

  })

  // ========================================
  // SAVE
  // ========================================

  const blob =
    await Packer.toBlob(doc)

  saveAs(

    blob,

    `КП_${request.clientName || 'client'}.docx`

  )

}