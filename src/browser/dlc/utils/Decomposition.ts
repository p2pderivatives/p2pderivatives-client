export function composeOutcomeValue(values: string[], base: number): string {
  return composeValue(
    values.map(x => parseInt(x)),
    base
  ).toString()
}

export function decomposeOutcomeValue(
  value: string,
  base: number,
  nbdigits: number
): string[] {
  return decomposeValue(parseInt(value), base, nbdigits).map(x => x.toString())
}

function decomposeValue(
  value: number,
  base: number,
  nbdigits: number
): number[] {
  const result = []
  while (value > 0) {
    result.push(value % base)
    value = Math.floor(value / base)
  }

  while (result.length < nbdigits) {
    result.push(0)
  }

  return result.reverse()
}

function composeValue(values: number[], base: number): number {
  let composed = 0
  const valLen = values.length
  for (let i = 0; i < valLen; i++) {
    const pow = valLen - i - 1
    composed += Math.floor(values[i] * Math.pow(base, pow))
  }

  return composed
}

function separatePrefix(
  start: number,
  end: number,
  base: number,
  nbdigits: number
): { prefixDigits: number[]; startDigits: number[]; endDigits: number[] } {
  let startDigits = decomposeValue(start, base, nbdigits)
  let endDigits = decomposeValue(end, base, nbdigits)

  if (startDigits.length !== nbdigits || endDigits.length !== nbdigits) {
    throw Error(
      'Invalid start or end parameters for number of digits requested'
    )
  }

  const prefixDigits = []

  for (
    let i = 0;
    startDigits[i] === endDigits[i] && i < startDigits.length;
    i++
  ) {
    prefixDigits.push(startDigits[i])
  }

  startDigits = startDigits.slice(prefixDigits.length)
  endDigits = endDigits.slice(prefixDigits.length)

  return { prefixDigits, startDigits, endDigits }
}

function removeBackIfEqual(digits: number[], num: number): number[] {
  let i = digits.length - 1
  while (digits[i] === num && i >= 0) {
    i--
  }
  return digits.slice(0, ++i)
}

function backGroupings(digits: number[], base: number): number[][] {
  digits = removeBackIfEqual(digits, base - 1)
  if (digits.length === 0) {
    return [[base - 1]]
  }
  const prefix = [digits[0]]
  const res: number[][] = []
  for (let i = 1; i < digits.length; i++) {
    let last = 0
    while (last < digits[i]) {
      const newRes = Object.assign([], prefix)
      newRes.push(last)
      res.push(newRes)
      last++
    }
    prefix.push(digits[i])
  }
  res.push(digits)
  return res
}

function frontGroupings(digits: number[], base: number): number[][] {
  digits = removeBackIfEqual(digits, 0)
  if (digits.length === 0) {
    return [[0]]
  }
  const prefix = Object.assign([], digits)
  const res: number[][] = [Object.assign([], digits)]

  for (let i = digits.length - 1; i > 0; i--) {
    prefix.pop()
    let last = digits[i] + 1
    while (last < base) {
      const newRes = Object.assign([], prefix)
      newRes.push(last)
      res.push(newRes)
      last++
    }
  }
  return res
}

function middleGrouping(
  firstDigitStart: number,
  firstDigitEnd: number
): number[][] {
  const res: number[][] = []

  while (++firstDigitStart < firstDigitEnd) {
    res.push([firstDigitStart])
  }

  return res
}

export function groupByIgnoringDigits(
  start: number,
  end: number,
  base: number,
  numDigits: number
): number[][] {
  const { prefixDigits, startDigits, endDigits } = separatePrefix(
    start,
    end,
    base,
    numDigits
  )

  const startIsAllZeros = startDigits.every(x => x === 0)
  const endIsAllMax = endDigits.every(x => x === base - 1)

  if (
    start === end ||
    (startIsAllZeros && endIsAllMax && prefixDigits.length > 0)
  ) {
    return [prefixDigits]
  }
  let res: number[][] = []
  if (prefixDigits.length === numDigits - 1) {
    for (
      let i = startDigits[startDigits.length - 1];
      i <= endDigits[endDigits.length - 1];
      i++
    ) {
      const newRes = Object.assign([], prefixDigits)
      newRes.push(i)
      res.push(newRes)
    }
  } else {
    const front = frontGroupings(startDigits, base)
    const middle = middleGrouping(startDigits[0], endDigits[0])
    const back = backGroupings(endDigits, base)
    res = front.concat(middle, back).map(x => prefixDigits.concat(x))
  }

  return res
}
