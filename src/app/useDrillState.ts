// App の状態と操作（キー・フォーカス・コード選択・出題・設定）。PC とスマホの両方の木が同じ状態を使う（F-606）
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { type NoteName, equalsNote, formatNote } from '../domain/pitch'
import { KEYS, majorScale } from '../domain/scale'
import { dayNumber, keyForDay } from '../domain/dailyKey'
import { type Question } from '../domain/quiz'
import { type PentaMode } from '../components/sections/PentaSection'
import { useQuizRunner, type QuizPhase } from './useQuizRunner'
import { SECTIONS, type SectionId } from './sections'
import { type Action } from './useKeyboard'
import { type DisplayMode } from './useDisplayMode'
import { loadStored, saveStored, MIN_INTERVAL_SEC, MAX_INTERVAL_SEC } from './storage'

export type ChordSectionId = 'seventh' | 'diatonic' | 'nonDiatonic'
export const CHORD_COUNT: Record<ChordSectionId, number> = { seventh: 4, diatonic: 7, nonDiatonic: 8 }
const NO_SELECTION: Record<ChordSectionId, number> = { seventh: 0, diatonic: 0, nonDiatonic: 0 }
export const isChordSection = (id: string): id is ChordSectionId => id in CHORD_COUNT

export type DrillState = {
  today: string
  currentKey: NoteName
  manualKey: NoteName | null
  keyOffset: number
  scale: NoteName[]
  focus: SectionId
  setFocus(id: SectionId): void
  moveFocus(delta: number): void
  chordIndex: Record<ChordSectionId, number>
  moveChord(delta: number): void
  selectChord(section: ChordSectionId, index: number): void
  pentaMode: PentaMode
  togglePenta(): void
  auto: boolean
  toggleAuto(): void
  intervalSec: number
  setIntervalSec(n: number): void
  quiz: { question: Question; phase: QuizPhase; advance(): void }
  nextKey(): void
  selectKey(k: NoteName): void
  helpOpen: boolean
  setHelpOpen(v: boolean): void
  onAction(a: Action): void
}

function todayString(now: Date): string {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Tokyo', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(now)
  const get = (t: string) => parts.find((p) => p.type === t)?.value
  return `${get('year')}-${get('month')}-${get('day')}`
}

function keyFromName(name: string | null): NoteName | null {
  return name ? (KEYS.find((k) => formatNote(k) === name) ?? null) : null
}

const clampInterval = (n: number) => Math.min(MAX_INTERVAL_SEC, Math.max(MIN_INTERVAL_SEC, Math.round(n)))

export function useDrillState({ now: nowProp, mode }: { now?: Date; mode: DisplayMode }): DrillState {
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
  const [stored] = useState(() => loadStored(today))
  const [focus, setFocus] = useState<SectionId>('key')
  // キー操作のハンドラから現在のフォーカスを読むための ref。更新関数の中で副作用を起こさない（StrictMode で二重実行されるため）
  const focusRef = useRef<SectionId>('key')
  useEffect(() => {
    focusRef.current = focus
  }, [focus])
  const [keyOffset, setKeyOffset] = useState(stored.keyOffset)
  const [manualKey, setManualKey] = useState<NoteName | null>(() => keyFromName(stored.manualKey))
  const [intervalSec, setIntervalSecRaw] = useState(stored.intervalSec)
  const [helpOpen, setHelpOpen] = useState(false)
  const [pentaMode, setPentaMode] = useState<PentaMode>('major')
  const [chordIndex, setChordIndex] = useState<Record<ChordSectionId, number>>(NO_SELECTION)
  const [auto, setAuto] = useState(false)

  // 日付が変わったら今日のキーに戻す（位置 0・手の選択なし・節 1）
  const prevToday = useRef(today)
  useEffect(() => {
    if (prevToday.current === today) return
    prevToday.current = today
    setKeyOffset(0)
    setManualKey(null)
    setChordIndex(NO_SELECTION)
    setFocus('key')
  }, [today])

  const currentKey = manualKey ?? keyForDay(day, keyOffset)
  const scale = useMemo(() => majorScale(currentKey), [currentKey])
  const quiz = useQuizRunner({ scale, active: focus === 'quiz', auto, intervalSec })
  const quizAdvance = quiz.advance

  useEffect(() => {
    saveStored({ intervalSec, date: today, keyOffset, manualKey: manualKey ? formatNote(manualKey) : null })
  }, [intervalSec, today, keyOffset, manualKey])

  // スマホ表示ではキーを変えても節に留まる（F-604）。PC 表示では節 1 へ戻る（F-102）
  const returnToKey = mode === 'desktop'

  const moveFocus = useCallback((delta: number) => {
    setFocus((f) => SECTIONS[Math.min(SECTIONS.length - 1, Math.max(0, SECTIONS.indexOf(f) + delta))])
  }, [setFocus])

  const selectKey = useCallback((k: NoteName) => {
    setManualKey(equalsNote(k, keyForDay(day, keyOffset)) ? null : k)
    setChordIndex(NO_SELECTION)
    if (returnToKey) setFocus('key')
  }, [day, keyOffset, returnToKey, setManualKey, setChordIndex, setFocus])

  const nextKey = useCallback(() => {
    setManualKey(null)
    setKeyOffset((o) => (o + 1) % 12)
    setChordIndex(NO_SELECTION)
    if (returnToKey) setFocus('key')
  }, [returnToKey, setManualKey, setKeyOffset, setChordIndex, setFocus])

  const moveChord = useCallback((delta: number) => {
    const f = focusRef.current
    if (!isChordSection(f)) return
    setChordIndex((c) => ({ ...c, [f]: Math.min(CHORD_COUNT[f] - 1, Math.max(0, c[f] + delta)) }))
  }, [setChordIndex])

  const selectChord = useCallback((section: ChordSectionId, index: number) => {
    setChordIndex((c) => ({ ...c, [section]: Math.min(CHORD_COUNT[section] - 1, Math.max(0, index)) }))
  }, [setChordIndex])

  const setIntervalSec = useCallback((n: number) => setIntervalSecRaw(clampInterval(n)), [setIntervalSecRaw])
  const togglePenta = useCallback(() => setPentaMode((m) => (m === 'major' ? 'minor' : 'major')), [setPentaMode])
  const toggleAuto = useCallback(() => setAuto((v) => !v), [setAuto])

  const onAction = useCallback((a: Action) => {
    switch (a) {
      case 'nextSection': moveFocus(1); break
      case 'prevSection': moveFocus(-1); break
      case 'nextKey': nextKey(); break
      case 'next': moveChord(1); break
      case 'prev': moveChord(-1); break
      case 'togglePenta': togglePenta(); break
      case 'toggleAuto': toggleAuto(); break
      case 'advance':
        if (focusRef.current === 'quiz') quizAdvance()
        break
      case 'intervalUp': setIntervalSecRaw((s) => clampInterval(s + 1)); break
      case 'intervalDown': setIntervalSecRaw((s) => clampInterval(s - 1)); break
      case 'help': if (mode === 'desktop') setHelpOpen((h) => !h); break
      case 'escape': setHelpOpen(false); break
      default: break
    }
  }, [mode, moveFocus, moveChord, quizAdvance, nextKey, togglePenta, toggleAuto, setIntervalSecRaw, setHelpOpen])

  return {
    today, currentKey, manualKey, keyOffset, scale,
    focus, setFocus, moveFocus,
    chordIndex, moveChord, selectChord,
    pentaMode, togglePenta, auto, toggleAuto, intervalSec, setIntervalSec,
    quiz, nextKey, selectKey, helpOpen, setHelpOpen, onAction,
  }
}
