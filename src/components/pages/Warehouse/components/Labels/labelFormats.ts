export type LabelFormat = {
  id: string
  name: string
  // CSS @page size and margin
  pageSize: string
  pageMargin: string
  columns: number
  rows: number
  // one label, in mm
  width: number
  height: number
}

// Sheet sizes match the common self-adhesive A4 sheets with no gaps between
// labels; roll sizes match label printers, one label per printed page.
export const LABEL_FORMATS: LabelFormat[] = [
  {
    id: 'a4-3x8',
    name: 'A4 sheet, 24 pcs (70 × 37 mm)',
    pageSize: 'A4',
    pageMargin: '0.5mm 0 0 0',
    columns: 3,
    rows: 8,
    width: 70,
    height: 37,
  },
  {
    id: 'a4-4x10',
    name: 'A4 sheet, 40 pcs (52.5 × 29.7 mm)',
    pageSize: 'A4',
    pageMargin: '0',
    columns: 4,
    rows: 10,
    width: 52.5,
    height: 29.7,
  },
  {
    id: 'roll-50x30',
    name: 'Label printer 50 × 30 mm',
    pageSize: '50mm 30mm',
    pageMargin: '0',
    columns: 1,
    rows: 1,
    width: 50,
    height: 30,
  },
  {
    id: 'roll-40x25',
    name: 'Label printer 40 × 25 mm',
    pageSize: '40mm 25mm',
    pageMargin: '0',
    columns: 1,
    rows: 1,
    width: 40,
    height: 25,
  },
  {
    id: 'roll-62x29',
    name: 'Brother 62 × 29 mm',
    pageSize: '62mm 29mm',
    pageMargin: '0',
    columns: 1,
    rows: 1,
    width: 62,
    height: 29,
  },
]
