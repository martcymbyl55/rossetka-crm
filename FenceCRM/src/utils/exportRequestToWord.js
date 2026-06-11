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

import { saveAs } from 'file-saver'

function formatPrice(value) {
  return Number(value || 0).toLocaleString()
}

function formatColor(color, customColor = '') {
  const colors = {
    ral6005: 'Зеленый (RAL 6005)',
    ral8017: 'Коричневый (RAL 8017)',
    ral7024: 'Графитовый (RAL 7024)',
    ral9005: 'Черный (RAL 9005)',
    ral7004: 'Серый (RAL 7004)',
    custom: customColor || 'Другой цвет RAL',
  }

  return colors[color] || color || '-'
}

function createRow(title, value) {
  return new TableRow({
    children: [
      new TableCell({
        width: { size: 40, type: WidthType.PERCENTAGE },
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
        width: { size: 60, type: WidthType.PERCENTAGE },
        children: [
          new Paragraph({
            children: [
              new TextRun({
                text: String(value ?? '-'),
                size: 24,
              }),
            ],
          }),
        ],
      }),
    ],
  })
}

function createTable(rows) {
  return new Table({
    width: {
      size: 100,
      type: WidthType.PERCENTAGE,
    },

    borders: {
      top: { style: BorderStyle.SINGLE, size: 1, color: 'D9D9D9' },
      bottom: { style: BorderStyle.SINGLE, size: 1, color: 'D9D9D9' },
      left: { style: BorderStyle.SINGLE, size: 1, color: 'D9D9D9' },
      right: { style: BorderStyle.SINGLE, size: 1, color: 'D9D9D9' },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: 'EAEAEA' },
      insideVertical: { style: BorderStyle.SINGLE, size: 1, color: 'EAEAEA' },
    },

    rows,
  })
}

function createEstimateHeaderRow() {
  return new TableRow({
    children: [
      new TableCell({
        children: [
          new Paragraph({
            children: [new TextRun({ text: 'Наименование', bold: true })],
          }),
        ],
      }),

      new TableCell({
        children: [
          new Paragraph({
            children: [new TextRun({ text: 'Характеристики', bold: true })],
          }),
        ],
      }),

      new TableCell({
        children: [
          new Paragraph({
            children: [new TextRun({ text: 'Кол-во', bold: true })],
          }),
        ],
      }),

      new TableCell({
        children: [
          new Paragraph({
            children: [new TextRun({ text: 'Цена', bold: true })],
          }),
        ],
      }),

      new TableCell({
        children: [
          new Paragraph({
            children: [new TextRun({ text: 'Сумма', bold: true })],
          }),
        ],
      }),
    ],
  })
}

function createEstimateRow(row) {
  return new TableRow({
    children: [
      new TableCell({
        children: [
          new Paragraph({
            children: [new TextRun({ text: String(row.name || '-') })],
          }),
        ],
      }),

      new TableCell({
        children: [
          new Paragraph({
            children: [new TextRun({ text: String(row.characteristics || '-') })],
          }),
        ],
      }),

      new TableCell({
        children: [
          new Paragraph({
            children: [new TextRun({ text: String(row.quantity || 0) })],
          }),
        ],
      }),

      new TableCell({
        children: [
          new Paragraph({
            children: [new TextRun({ text: `${formatPrice(row.unitPrice)} ₽` })],
          }),
        ],
      }),

      new TableCell({
        children: [
          new Paragraph({
            children: [new TextRun({ text: `${formatPrice(row.sum)} ₽` })],
          }),
        ],
      }),
    ],
  })
}

export async function exportRequestToWord(request) {
  const currentDate = new Date().toLocaleDateString('ru-RU')

  const totalPrice = formatPrice(request.totalPrice)

  const estimateRows =
    request.calculation?.estimateRows ||
    request.calculation?.rows ||
    []

  const doc = new Document({
    sections: [
      {
        properties: {},

        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 300 },
            children: [
              new TextRun({
                text: 'КОММЕРЧЕСКОЕ ПРЕДЛОЖЕНИЕ',
                bold: true,
                size: 38,
              }),
            ],
          }),

          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 500 },
            children: [
              new TextRun({
                text: 'FenceCRM — расчет стоимости 3D-ограждений',
                italics: true,
                color: '666666',
                size: 24,
              }),
            ],
          }),

          new Paragraph({
            spacing: { after: 250 },
            children: [
              new TextRun({
                text: 'ИНФОРМАЦИЯ О КЛИЕНТЕ',
                bold: true,
                size: 30,
              }),
            ],
          }),

          createTable([
            createRow('Клиент', request.clientName),
            createRow('Телефон', request.clientPhone),
            createRow('Email', request.clientEmail),
            createRow('Тип клиента', request.clientType),
          ]),

          new Paragraph({
            text: '',
            spacing: { after: 400 },
          }),

          new Paragraph({
            spacing: { after: 250 },
            children: [
              new TextRun({
                text: 'ПАРАМЕТРЫ ЗАКАЗА',
                bold: true,
                size: 30,
              }),
            ],
          }),

          createTable([
            createRow('Тип ограждения', '3D ограждение'),
            createRow('Длина ограждения', `${request.length || 0} м`),
            createRow('Высота панели', `${request.height || '-'} мм`),
            createRow('Ширина панели', `${request.width || '-'} мм`),
            createRow('Диаметр проволоки', `Ø${request.wire || '-'} мм`),
            createRow('Размер ячейки', request.cell || '-'),

            createRow(
              'Покрытие',
              request.coating === 'zinc'
                ? 'Цинк'
                : 'Полимерное покрытие'
            ),

            createRow(
              'Цвет',
              formatColor(request.color, request.customColor)
            ),

            createRow(
              'Крепеж',
              request.fastening === 'standard'
                ? 'Болтовой крепеж с обычной гайкой'
                : request.fastening === 'antivandal'
                ? 'Болтовой крепеж с антивандальной гайкой'
                : 'Саморезный крепеж'
            ),

            createRow('Количество углов', request.cornersCount || 0),
            createRow('Количество калиток', request.wicketCount || 0),

            createRow(
              'Тип калитки',
              Number(request.wicketCount) > 0
                ? request.wicketType === 'lock'
                  ? 'Калитка Стандарт с замком'
                  : 'Калитка Стандарт'
                : 'Нет'
            ),

            createRow(
              'Высота калитки',
              Number(request.wicketCount) > 0
                ? `${request.wicketHeight} мм`
                : '-'
            ),

            createRow('Распашные ворота', `${request.swingGateCount || 0} шт.`),

            createRow(
              'Параметры распашных ворот',
              Number(request.swingGateCount) > 0
                ? `${request.swingGateHeight} мм, проем ${request.swingGateWidth} мм`
                : '-'
            ),

            createRow('Откатные ворота', `${request.slidingGateCount || 0} шт.`),

            createRow(
              'Параметры откатных ворот',
              Number(request.slidingGateCount) > 0
                ? `${request.slidingGateHeight} мм, проем ${request.slidingGateWidth} мм`
                : '-'
            ),

            createRow(
              'Стоимость доставки',
              `${formatPrice(request.deliveryPriceManual)} ₽`
            ),

            createRow(
              'Стоимость монтажа',
              `${formatPrice(request.installationPriceManual)} ₽`
            ),

            createRow('Скидка', `${request.customDiscount || 0}%`),
          ]),

          new Paragraph({
            text: '',
            spacing: { after: 500 },
          }),

          new Paragraph({
            spacing: { after: 250 },
            children: [
              new TextRun({
                text: 'СМЕТА',
                bold: true,
                size: 30,
              }),
            ],
          }),

          createTable([
            createEstimateHeaderRow(),
            ...estimateRows.map((row) => createEstimateRow(row)),
          ]),

          new Paragraph({
            text: '',
            spacing: { after: 400 },
          }),

          new Paragraph({
            spacing: { after: 250 },
            children: [
              new TextRun({
                text: 'ИТОГОВЫЕ СУММЫ',
                bold: true,
                size: 30,
              }),
            ],
          }),

          createTable([
            createRow(
              'Стоимость материалов',
              `${formatPrice(request.calculation?.materialsPrice)} ₽`
            ),

            createRow(
              'Стоимость крепежа',
              `${formatPrice(request.calculation?.fasteningPrice)} ₽`
            ),

            createRow(
              'Стоимость калиток',
              `${formatPrice(request.calculation?.wicketPrice)} ₽`
            ),

            createRow(
              'Стоимость ворот',
              `${formatPrice(request.calculation?.gatePrice)} ₽`
            ),

            createRow(
              'Стоимость доставки',
              `${formatPrice(request.calculation?.deliveryPrice)} ₽`
            ),

            createRow(
              'Стоимость монтажа',
              `${formatPrice(request.calculation?.installationPrice)} ₽`
            ),

            createRow(
              'НДС 20%',
              `${formatPrice(request.calculation?.vatPrice)} ₽`
            ),
          ]),

          new Paragraph({
            text: '',
            spacing: { after: 500 },
          }),

          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
            children: [
              new TextRun({
                text: 'ИТОГОВАЯ СТОИМОСТЬ',
                bold: true,
                size: 34,
              }),
            ],
          }),

          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
            children: [
              new TextRun({
                text: `${totalPrice} ₽`,
                bold: true,
                size: 48,
                color: '0044AA',
              }),
            ],
          }),

          new Paragraph({
            spacing: { after: 150 },
            children: [
              new TextRun({
                text: 'Комментарий',
                bold: true,
                size: 26,
              }),
            ],
          }),

          new Paragraph({
            spacing: { after: 300 },
            children: [
              new TextRun({
                text: request.comment || 'Без комментариев',
                size: 24,
              }),
            ],
          }),

          new Paragraph({
            spacing: { after: 400 },
            children: [
              new TextRun({
                text:
                  request.calculation?.calculationComment ||
                  'Стоимость является предварительной и может корректироваться менеджером.',
                italics: true,
                color: '666666',
                size: 22,
              }),
            ],
          }),

          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 150 },
            children: [
              new TextRun({
                text: `Дата формирования: ${currentDate}`,
                italics: true,
                color: '666666',
                size: 22,
              }),
            ],
          }),

          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: 'Спасибо за обращение!',
                bold: true,
                size: 26,
              }),
            ],
          }),
        ],
      },
    ],
  })

  const blob = await Packer.toBlob(doc)

  saveAs(
    blob,
    `КП_${request.clientName || 'client'}.docx`
  )
}