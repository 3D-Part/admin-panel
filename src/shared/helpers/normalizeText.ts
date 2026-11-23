/** Lower case without marks, so "zica" finds "Žica" and "cetka" finds "četka". */
export const normalizeText = (text?: string | null) =>
  (text ?? '')
    .toLowerCase()
    .replace(/đ/g, 'd')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
