// USB barcode scanners behave like a US keyboard: they send key positions,
// not characters. On the local QWERTZ layout that turns Y into Z (and back)
// and most punctuation into something else. Translating the physical key
// (event.code) back to the US character makes every scan come out right,
// whatever layout the computer uses.

const US_SYMBOLS: Record<string, [string, string]> = {
  Minus: ['-', '_'],
  Equal: ['=', '+'],
  BracketLeft: ['[', '{'],
  BracketRight: [']', '}'],
  Backslash: ['\\', '|'],
  Semicolon: [';', ':'],
  Quote: ["'", '"'],
  Comma: [',', '<'],
  Period: ['.', '>'],
  Slash: ['/', '?'],
  Backquote: ['`', '~'],
  Space: [' ', ' '],
  NumpadDecimal: ['.', '.'],
  NumpadDivide: ['/', '/'],
  NumpadMultiply: ['*', '*'],
  NumpadSubtract: ['-', '-'],
  NumpadAdd: ['+', '+'],
}

const US_DIGIT_SHIFT = ')!@#$%^&*('

export const usCharForKey = (code: string, shift: boolean): string | null => {
  if (/^Key[A-Z]$/.test(code)) {
    return shift ? code[3] : code[3].toLowerCase()
  }
  if (/^Digit[0-9]$/.test(code)) {
    return shift ? US_DIGIT_SHIFT[Number(code[5])] : code[5]
  }
  if (/^Numpad[0-9]$/.test(code)) {
    return code[6]
  }
  const symbol = US_SYMBOLS[code]
  return symbol ? symbol[shift ? 1 : 0] : null
}
