// App の状態と操作（キー・スマホの節・コード選択・出題・ペンタ・音）。PC とスマホの両方の木が同じ状態を使う（F-606）
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { type NoteName, equalsNote } from '../domain/pitch'
import { majorScale, nextOnCircle, type PentaMode } from '../domain/scale'
import { dayNumber, keyForDay } from '../domain/dailyKey'
import { type Question, type QuizPhase, baseNote } from '../domain/quiz'
import { diatonicChords, keySevenths, nonDiatonicChords } from '../domain/progression'
import { chordSound, quizSound } from '../domain/sound'
import { useQuizRunner } from './useQuizRunner'
import { useKeyRoulette } from './useKeyRoulette'
import { useSound } from './useSound'
import { type AudioContextLike } from './audioPlayer'
import { SECTIONS, type SectionId } from './sections'

export type ChordSectionId = 'seventh' | 'diatonic' | 'nonDiatonic'
export const CHORD_COUNT: Record<ChordSectionId, number> = { seventh: 4, diatonic: 7, nonDiatonic: 8 }
const NO_SELECTION: Record<ChordSectionId, number> = { seventh: 0, diatonic: 0, nonDiatonic: 0 }
export const isChordSection = (id: string): id is ChordSectionId => id in CHORD_COUNT
const CHORDS_OF = { seventh: keySevenths, diatonic: diatonicChords, nonDiatonic: nonDiatonicChords } as const

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
  /** 音の入切（F-506）。既定は切。入のとき selectChord と「答え」で鳴る（F-306・F-406） */
  sound: { enabled: boolean; toggle(): void }
  nextKey(): void
  selectKey(k: NoteName): void
}

function todayString(now: Date): string {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Tokyo', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(now)
  const get = (t: string) => parts.find((p) => p.type === t)?.value
  return `${get('year')}-${get('month')}-${get('day')}`
}

type Options = { now?: Date; createAudioContext?: () => AudioContextLike | null }

export function useDrillState({ now: nowProp, createAudioContext }: Options = {}): DrillState {
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
  const runner = useQuizRunner({ scale })
  const sound = useSound({ createContext: createAudioContext })
  const { play } = sound

  // 「答え」で基準→答えを鳴らす。「次」では止めるだけ（F-406）
  const { question, phase, advance: runnerAdvance } = runner
  const quiz = useMemo(() => ({
    question,
    phase,
    advance: () => {
      play(phase === 'asking' ? quizSound(baseNote(question, scale), question.interval) : [])
      runnerAdvance()
    },
  }), [question, phase, runnerAdvance, scale, play])

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

  // 行を選ぶと同時に構成音を鳴らす（F-306）。すでに選択中の行でも鳴る
  const selectChord = useCallback((section: ChordSectionId, index: number) => {
    const i = Math.min(CHORD_COUNT[section] - 1, Math.max(0, index))
    play(chordSound(CHORDS_OF[section](currentKey)[i].chord))
    setChordIndex((c) => ({ ...c, [section]: i }))
  }, [setChordIndex, play, currentKey])

  const togglePenta = useCallback(() => setPentaMode((m) => (m === 'major' ? 'minor' : 'major')), [setPentaMode])

  return {
    today, currentKey, todayKey, keyLabel, manualKey, scale,
    focus, setFocus, moveFocus,
    chordIndex, selectChord,
    pentaMode, togglePenta,
    quiz, nextKey, selectKey,
    sound: { enabled: sound.enabled, toggle: sound.toggle },
  }
}
