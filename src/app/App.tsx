import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { type NoteName, equalsNote, formatNote } from '../domain/pitch'
import { KEYS, majorScale } from '../domain/scale'
import { dayNumber, keyForDay } from '../domain/dailyKey'
import { CircleOfFifths } from '../components/CircleOfFifths'
import { Section } from '../components/Section'
import { ShortcutBar, HelpDialog } from '../components/ShortcutBar'
import { KeySection } from '../components/sections/KeySection'
import { ScaleSection } from '../components/sections/ScaleSection'
import { PentaSection, type PentaMode } from '../components/sections/PentaSection'
import { SeventhSection, DiatonicSection, NonDiatonicSection } from '../components/sections/chordSections'
import { QuizSection } from '../components/sections/QuizSection'
import { useQuizRunner } from './useQuizRunner'
import { SECTIONS, SECTION_TITLES, type SectionId } from './sections'
import { useKeyboard, type Action } from './useKeyboard'
import { loadStored, saveStored, MIN_INTERVAL_SEC, MAX_INTERVAL_SEC } from './storage'

type ChordSectionId = 'seventh' | 'diatonic' | 'nonDiatonic'
const CHORD_COUNT: Record<ChordSectionId, number> = { seventh: 4, diatonic: 7, nonDiatonic: 8 }
const NO_SELECTION: Record<ChordSectionId, number> = { seventh: 0, diatonic: 0, nonDiatonic: 0 }
const isChordSection = (id: string): id is ChordSectionId => id in CHORD_COUNT

function todayString(now: Date): string {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Tokyo', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(now)
  const get = (t: string) => parts.find((p) => p.type === t)?.value
  return `${get('year')}-${get('month')}-${get('day')}`
}

function keyFromName(name: string | null): NoteName | null {
  return name ? (KEYS.find((k) => formatNote(k) === name) ?? null) : null
}

export function App({ now: nowProp }: { now?: Date }) {
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
  const [intervalSec, setIntervalSec] = useState(stored.intervalSec)
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

  const moveFocus = useCallback((delta: number) => {
    setFocus((f) => SECTIONS[Math.min(SECTIONS.length - 1, Math.max(0, SECTIONS.indexOf(f) + delta))])
  }, [setFocus])

  const selectKey = useCallback((k: NoteName) => {
    setManualKey(equalsNote(k, keyForDay(day, keyOffset)) ? null : k)
    setChordIndex(NO_SELECTION)
    setFocus('key')
  }, [day, keyOffset, setManualKey, setChordIndex, setFocus])

  const moveChord = useCallback((delta: number) => {
    const f = focusRef.current
    if (!isChordSection(f)) return
    setChordIndex((c) => ({ ...c, [f]: Math.min(CHORD_COUNT[f] - 1, Math.max(0, c[f] + delta)) }))
  }, [setChordIndex])

  const onAction = useCallback((a: Action) => {
    switch (a) {
      case 'nextSection': moveFocus(1); break
      case 'prevSection': moveFocus(-1); break
      case 'nextKey':
        setManualKey(null)
        setKeyOffset((o) => (o + 1) % 12)
        setChordIndex(NO_SELECTION)
        setFocus('key')
        break
      case 'next': moveChord(1); break
      case 'prev': moveChord(-1); break
      case 'togglePenta': setPentaMode((m) => (m === 'major' ? 'minor' : 'major')); break
      case 'toggleAuto': setAuto((v) => !v); break
      case 'advance':
        if (focusRef.current === 'quiz') quizAdvance()
        break
      case 'intervalUp': setIntervalSec((s) => Math.min(MAX_INTERVAL_SEC, s + 1)); break
      case 'intervalDown': setIntervalSec((s) => Math.max(MIN_INTERVAL_SEC, s - 1)); break
      case 'help': setHelpOpen((h) => !h); break
      case 'escape': setHelpOpen(false); break
      default: break
    }
  }, [moveFocus, moveChord, quizAdvance, setManualKey, setKeyOffset, setChordIndex, setFocus, setPentaMode, setAuto, setIntervalSec, setHelpOpen])
  useKeyboard(onAction)

  const focusIndex = SECTIONS.indexOf(focus)

  return (
    <div className="min-h-screen bg-bg text-ink">
      <header className="fixed top-0 inset-x-0 h-[88px] z-10 bg-surface border-b border-line">
        <div className="max-w-[1200px] mx-auto h-full px-6 flex items-center justify-between">
          <div className="text-[14px] text-muted w-64">{`節 ${focusIndex + 1} / 7 ${SECTION_TITLES[focus]}`}</div>
          <div data-testid="current-key" className="text-[40px] font-bold text-accent leading-none">{formatNote(currentKey)}</div>
          <div className="flex items-center gap-4 w-64 justify-end">
            <CircleOfFifths current={currentKey} onSelect={selectKey} />
            <span className="text-[14px] text-muted">{`${keyOffset + 1} / 12`}</span>
          </div>
        </div>
      </header>

      <main className="max-w-[1200px] mx-auto px-6 pt-[calc(88px+40vh)] pb-[calc(40px+40vh)] space-y-16">
        {SECTIONS.map((id, i) => (
          <Section key={id} id={id} title={SECTION_TITLES[id]} focused={focus === id} index={i}>
            {id === 'key' && <KeySection keyNote={currentKey} manual={manualKey !== null} />}
            {id === 'scale' && <ScaleSection keyNote={currentKey} />}
            {id === 'penta' && <PentaSection keyNote={currentKey} mode={pentaMode} />}
            {id === 'seventh' && <SeventhSection keyNote={currentKey} selected={chordIndex.seventh} />}
            {id === 'quiz' && <QuizSection question={quiz.question} phase={quiz.phase} scale={scale} auto={auto} intervalSec={intervalSec} />}
            {id === 'diatonic' && <DiatonicSection keyNote={currentKey} selected={chordIndex.diatonic} />}
            {id === 'nonDiatonic' && <NonDiatonicSection keyNote={currentKey} selected={chordIndex.nonDiatonic} />}
          </Section>
        ))}
      </main>

      <ShortcutBar />
      {helpOpen && <HelpDialog onClose={() => setHelpOpen(false)} />}
    </div>
  )
}
