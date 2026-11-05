// その場の状態の保存（F-505）。壊れていても既定値で動き、エラーにしない
export const STORAGE_KEY = 'bassdrill.v1'

export type Stored = Readonly<{
  intervalSec: number
  /** YYYY-MM-DD（Asia/Tokyo） */
  date: string
  /** 今日の順列の位置 0〜11 */
  keyOffset: number
  /** 手で選んだキー（formatNote の文字列）。無ければ null */
  manualKey: string | null
}>

export const DEFAULT_INTERVAL_SEC = 5

function defaults(today: string, intervalSec = DEFAULT_INTERVAL_SEC): Stored {
  return { intervalSec, date: today, keyOffset: 0, manualKey: null }
}

export function loadStored(today: string): Stored {
  let raw: unknown
  try {
    const text = localStorage.getItem(STORAGE_KEY)
    if (!text) return defaults(today)
    raw = JSON.parse(text)
  } catch {
    return defaults(today)
  }
  if (typeof raw !== 'object' || raw === null) return defaults(today)
  const r = raw as Record<string, unknown>
  const intervalSec = typeof r.intervalSec === 'number' && Number.isFinite(r.intervalSec) ? r.intervalSec : DEFAULT_INTERVAL_SEC
  if (r.date !== today) return defaults(today, intervalSec)
  const keyOffset = typeof r.keyOffset === 'number' && Number.isInteger(r.keyOffset) && r.keyOffset >= 0 && r.keyOffset < 12 ? r.keyOffset : 0
  const manualKey = typeof r.manualKey === 'string' ? r.manualKey : null
  return { intervalSec, date: today, keyOffset, manualKey }
}

export function saveStored(s: Stored): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s))
  } catch {
    // 保存できない環境では黙って続ける（F-505）
  }
}
