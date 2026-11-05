// App の状態と操作（キー・スマホの節・コード選択・出題・ペンタ）。PC とスマホの両方の木が同じ状態を使う（F-606）
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { type NoteName, equalsNote } from '../domain/pitch'
import { majorScale, nextOnCircle } from '../domain/scale'
import { dayNumber, keyForDay } from '../domain/dailyKey'
import { type Question } from '../domain/quiz'
import { type PentaMode } from '../components/sections/PentaSection'
import { useQuizRunner, type QuizPhase } from './useQuizRunner'
import { useKeyRoulette } from './useKeyRoulette'
import { SECTIONS, type SectionId } from './sections'

export type ChordSectionId = 'seventh' | 'diatonic' | 'nonDiatonic'
export const CHORD_COUNT: Record<ChordSectionId, number> = { seventh: 4, diatonic: 7, nonDiatonic: 8 }
const NO_SELECTION: Record<ChordSectionId, number> = { seventh: 0, diatonic: 0, nonDiatonic: 0 }
export const isChordSection = (id: string): id is ChordSectionId => id in CHORD_COUNT

export type DrillState = {
  today: string
  currentKey: NoteName
  /** 今日のキー（F-101）。進めても手で選んでも変わらない */
  todayKey: NoteName
  /** ヘッダーに出す文字。開いた瞬間はルーレットで回り（F-103）、止まれば今のキー */
  keyLabel: string
  /** 手で選んだキー（「次のキー」で進んだ先も同じ扱い。F-102・F-104）。今日のキーなら null */
  manualKey: NoteName | null
  scale: NoteName[]
  /** スマホで見ている節（F-601）。PC 表示は使わないが、切り替えで失わないようここに持つ */
  focus: SectionId
  setFocus(id: SectionId): void
  moveFocus(delta: number): void
  chordIndex: Record<ChordSectionId, number>
  selectChord(section: ChordSectionId, index: number): void
  pentaMode: PentaMode
  togglePenta(): void
  quiz: { question: Question; phase: QuizPhase; advance(): void }
  nextKey(): void
  selectKey(k: NoteName): void
}

function todayString(now: Date): string {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Tokyo', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(now)
  const get = (t: string) => parts.find((p) => p.type === t)?.value
  return `${get('year')}-${get('month')}-${get('day')}`
}

export function useDrillState({ now: nowProp }: { now?: Date } = {}): DrillState {
  // 描画中に Date を呼ばない（lint の purity）。開いたまま日付をまたいだら 1 分ごとの確認とタブ復帰で追随する
  const [now, setNow] = useState(() => nowProp ?? new Date())
  const day = dayNumber(now)
  const today = todayString(now)
  useEffect(() => {
    const refresh = () => setNow((prev) => (todayString(prev) === todayString(new Date()) ? prev : new Date()))
    const id = setInterval(refresh, 60_000)
    const onVisible = () => { if (document.visibilityState === 'visible') refresh() }
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      clearInterval(id)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [])
  // 保存はしない（F-505 廃止）。開き直すと手の選択なし＝今日のキーから
  const [focus, setFocus] = useState<SectionId>('scale')
  const [manualKey, setManualKey] = useState<NoteName | null>(null)
  const [pentaMode, setPentaMode] = useState<PentaMode>('major')
  const [chordIndex, setChordIndex] = useState<Record<ChordSectionId, number>>(NO_SELECTION)

  // 日付が変わったら今日のキーに戻す（手の選択なし）。見ている場所は動かさない（F-101）
  const prevToday = useRef(today)
  useEffect(() => {
    if (prevToday.current === today) return
    prevToday.current = today
    setManualKey(null)
    setChordIndex(NO_SELECTION)
  }, [today])

  const todayKey = keyForDay(day)
  const currentKey = manualKey ?? todayKey
  const scale = useMemo(() => majorScale(currentKey), [currentKey])
  const keyLabel = useKeyRoulette({ today: todayKey, current: currentKey, trigger: today })
  const quiz = useQuizRunner({ scale })

  const moveFocus = useCallback((delta: number) => {
    setFocus((f) => SECTIONS[Math.min(SECTIONS.length - 1, Math.max(0, SECTIONS.indexOf(f) + delta))])
  }, [setFocus])

  // キーを変えても見ている場所は動かさない（F-102・F-104）
  const selectKey = useCallback((k: NoteName) => {
    setManualKey(equalsNote(k, todayKey) ? null : k)
    setChordIndex(NO_SELECTION)
  }, [todayKey, setManualKey, setChordIndex])

  // 次のキー＝今のキーの 5 度上（F-102）。今日のキーに戻ったら手の選択なしに戻す
  const nextKey = useCallback(() => {
    const next = nextOnCircle(currentKey)
    setManualKey(equalsNote(next, todayKey) ? null : next)
    setChordIndex(NO_SELECTION)
  }, [currentKey, todayKey, setManualKey, setChordIndex])

  const selectChord = useCallback((section: ChordSectionId, index: number) => {
    setChordIndex((c) => ({ ...c, [section]: Math.min(CHORD_COUNT[section] - 1, Math.max(0, index)) }))
  }, [setChordIndex])

  const togglePenta = useCallback(() => setPentaMode((m) => (m === 'major' ? 'minor' : 'major')), [setPentaMode])

  return {
    today, currentKey, todayKey, keyLabel, manualKey, scale,
    focus, setFocus, moveFocus,
    chordIndex, selectChord,
    pentaMode, togglePenta,
    quiz, nextKey, selectKey,
  }
}
