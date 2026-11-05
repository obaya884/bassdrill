// 日付から今日のキーを決める（F-101・F-102）
import { type NoteName } from './pitch'
import { KEYS } from './scale'

const MS_PER_DAY = 86_400_000

/** そのタイムゾーンの暦日の、1970-01-01 からの通算日 */
export function dayNumber(now: Date, timeZone = 'Asia/Tokyo'): number {
  const parts = new Intl.DateTimeFormat('en-US', { timeZone, year: 'numeric', month: 'numeric', day: 'numeric' }).formatToParts(now)
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value)
  return Math.floor(Date.UTC(get('year'), get('month') - 1, get('day')) / MS_PER_DAY)
}

/** 決定的な疑似乱数（0 以上 1 未満） */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function shuffled(block: number): NoteName[] {
  const rng = mulberry32(block)
  const p = [...KEYS]
  for (let i = p.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[p[i], p[j]] = [p[j], p[i]]
  }
  return p
}

/**
 * 12 日ブロックごとの 12 キーの順列。前ブロックの末尾と先頭が同じなら
 * 先頭 2 つを入れ替える（同じキーが 2 日続かない。F-101）。
 * 入れ替えは先頭 2 つにしか触れないので、前ブロックの末尾は再帰なしで参照できる。
 */
export function blockPermutation(block: number): NoteName[] {
  const p = shuffled(block)
  if (block >= 1 && shuffled(block - 1)[11] === p[0]) {
    ;[p[0], p[1]] = [p[1], p[0]]
  }
  return p
}

/** 通算日 day のキー。offset は「次のキー」の回数（F-102） */
export function keyForDay(day: number, offset = 0): NoteName {
  const p = blockPermutation(Math.floor(day / 12))
  return p[(((day % 12) + offset) % 12 + 12) % 12]
}
