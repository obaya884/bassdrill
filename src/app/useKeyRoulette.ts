// 開いた瞬間のルーレット（F-103）: ヘッダーのキーの文字だけを数段階で入れ替え、今日のキーで止める。
// キーの決定（F-101）とは無関係の見た目。prefers-reduced-motion では回さない
import { useEffect, useState } from 'react'
import { type NoteName, equalsNote, formatNote } from '../domain/pitch'
import { KEYS } from '../domain/scale'

export const STEPS = 10
const BASE_MS = 50
const STEP_MS = 6
const REDUCED_MOTION = '(prefers-reduced-motion: reduce)'

/** 直前と同じキーを選ばず、最後の段階は today と違うキーにする */
export function rouletteSequence(today: NoteName, rng: () => number): NoteName[] {
  const seq: NoteName[] = []
  for (let i = 0; i < STEPS; i++) {
    const prev = seq[i - 1]
    let k = KEYS[Math.floor(rng() * KEYS.length) % KEYS.length]
    // 重なりは隣にずらして避ける（乱数が偏っても止まらない）
    while ((prev && equalsNote(k, prev)) || (i === STEPS - 1 && equalsNote(k, today))) {
      k = KEYS[(KEYS.indexOf(k) + 1) % KEYS.length]
    }
    seq.push(k)
  }
  return seq
}

function prefersReducedMotion(): boolean {
  return typeof window.matchMedia === 'function' && window.matchMedia(REDUCED_MOTION).matches
}

type Spin = { trigger: string; today: NoteName; seq: NoteName[] }

function start(trigger: string, today: NoteName, rng: () => number): Spin | null {
  return prefersReducedMotion() ? null : { trigger, today, seq: rouletteSequence(today, rng) }
}

type Args = {
  today: NoteName
  current: NoteName
  /** 変わったら回し直す（開いたまま日付をまたいだとき） */
  trigger: string
  rng?: () => number
}

/** ヘッダーに出すキーの文字。回っている間は段階のキー、止まったら今のキー */
export function useKeyRoulette({ today, current, trigger, rng = Math.random }: Args): string {
  const [spin, setSpin] = useState<Spin | null>(() => start(trigger, today, rng))
  const [index, setIndex] = useState(0)

  // trigger が変わったら回し直す（初回は useState の初期化で始めている）
  useEffect(() => {
    if (spin?.trigger === trigger) return
    const id = window.setTimeout(() => {
      setSpin(start(trigger, today, rng))
      setIndex(0)
    }, 0)
    return () => window.clearTimeout(id)
    // spin は止まると null になるが、見るのは trigger の変化だけ
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trigger])

  // 回り始めたら全段のタイマーをまとめて予約し、最後の段階が終わったら止める
  useEffect(() => {
    if (!spin) return
    const ids: number[] = []
    let at = 0
    for (let i = 0; i < STEPS; i++) {
      at += BASE_MS + STEP_MS * i
      const next = i + 1
      ids.push(window.setTimeout(() => (next < STEPS ? setIndex(next) : setSpin(null)), at))
    }
    return () => ids.forEach((id) => window.clearTimeout(id))
  }, [spin])

  // 回っている間にキーが変わったら（今のキーが今日のキーでなくなったら）即座に今のキー
  const spinning = spin !== null && equalsNote(current, spin.today)
  return formatNote(spinning ? spin.seq[index] : current)
}
