// 度数の出題（F-401〜F-403）。基準を根音と見た音程（コード度数）で問う。
import { type NoteName, formatNote, hasDoubleAccidental, pitchClass, simpleSpellings, spellFromLetter, stepLetter } from './pitch'

export type QuizKind = 'degreeToNote' | 'noteToDegree'

/** 出題する 8 つの音程。2 度・4 度はテンションの呼び名を併記する（要件定義書 F-401） */
export type IntervalId = '2' | 'b3' | '3' | '4' | '5' | '6' | 'b7' | '7'
export const INTERVALS: readonly IntervalId[] = ['2', 'b3', '3', '4', '5', '6', 'b7', '7']
export const INTERVAL_SPEC: Record<IntervalId, Readonly<{ label: string; semitones: number; letterSteps: number }>> = {
  '2': { label: '2 度（9 度）', semitones: 2, letterSteps: 1 },
  b3: { label: '♭3 度', semitones: 3, letterSteps: 2 },
  '3': { label: '3 度', semitones: 4, letterSteps: 2 },
  '4': { label: '4 度（11 度）', semitones: 5, letterSteps: 3 },
  '5': { label: '5 度', semitones: 7, letterSteps: 4 },
  '6': { label: '6 度', semitones: 9, letterSteps: 5 },
  b7: { label: '♭7 度', semitones: 10, letterSteps: 6 },
  '7': { label: '7 度', semitones: 11, letterSteps: 6 },
}

/** 出題の段階（F-403）。出題中 → 答え表示 → 次の出題中 */
export type QuizPhase = 'asking' | 'answered'

/** baseIndex はスケールの 0〜6 */
export type Question = Readonly<{ kind: QuizKind; baseIndex: number; interval: IntervalId }>

/**
 * 基準から音程ぶん上の音。綴りは基準の文字から文字を送って付け、
 * ダブル変化記号になるときは答えだけを最も単純な綴りに読み替える（F-401）
 */
export function intervalNote(base: NoteName, interval: IntervalId): NoteName {
  const { semitones, letterSteps } = INTERVAL_SPEC[interval]
  const pc = (pitchClass(base) + semitones) % 12
  let spelled: NoteName | null
  try {
    spelled = spellFromLetter(stepLetter(base.letter, letterSteps), pc)
  } catch {
    spelled = null // 文字送りでは ±2 にも収まらない綴り
  }
  return spelled && !hasDoubleAccidental(spelled) ? spelled : simpleSpellings(pc)[0]
}

function sameQuestion(a: Question, b: Question): boolean {
  return a.kind === b.kind && a.baseIndex === b.baseIndex && a.interval === b.interval
}

/** 次の問題。形式は 1:1、直前と同一の問題は引き直す（F-402） */
export function nextQuestion(rng: () => number, prev?: Question): Question {
  for (;;) {
    const kind: QuizKind = rng() < 0.5 ? 'degreeToNote' : 'noteToDegree'
    const baseIndex = Math.floor(rng() * 7)
    const interval = INTERVALS[Math.floor(rng() * INTERVALS.length)]
    const q = { kind, baseIndex, interval }
    if (!prev || !sameQuestion(q, prev)) return q
  }
}

export function baseNote(q: Question, scale: NoteName[]): NoteName {
  return scale[q.baseIndex]
}

export function answerNote(q: Question, scale: NoteName[]): NoteName {
  return intervalNote(baseNote(q, scale), q.interval)
}

/** 問題文の分節。noWrap の分節（度数の表記・音名）は途中で折り返さない（画面定義書 13 §2.1） */
export type TextSegment = Readonly<{ text: string; noWrap: boolean }>

export function questionSegments(q: Question, scale: NoteName[]): TextSegment[] {
  const base = formatNote(baseNote(q, scale))
  return q.kind === 'degreeToNote'
    ? [{ text: `${base} から見て `, noWrap: false }, { text: INTERVAL_SPEC[q.interval].label, noWrap: true }, { text: 'は？', noWrap: false }]
    : [{ text: `${base} から見た `, noWrap: false }, { text: formatNote(answerNote(q, scale)), noWrap: true }, { text: ' は？', noWrap: false }]
}

export function questionText(q: Question, scale: NoteName[]): string {
  return questionSegments(q, scale).map((s) => s.text).join('')
}

export function answerText(q: Question, scale: NoteName[]): string {
  return q.kind === 'degreeToNote' ? formatNote(answerNote(q, scale)) : INTERVAL_SPEC[q.interval].label
}
