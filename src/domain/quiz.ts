// 度数の出題（F-401〜F-403）。キー度数（スケール上の位置）で問う。
import { type NoteName, formatNote } from './pitch'

export type QuizKind = 'degreeToNote' | 'noteToDegree'

/** index はスケールの 0〜6。baseIndex !== targetIndex */
export type Question = Readonly<{ kind: QuizKind; baseIndex: number; targetIndex: number }>

/** 基準からスケールを上に数えた位置（2〜7） */
export function degreeBetween(baseIndex: number, targetIndex: number): number {
  return ((targetIndex - baseIndex + 7) % 7) + 1
}

function sameQuestion(a: Question, b: Question): boolean {
  return a.kind === b.kind && a.baseIndex === b.baseIndex && a.targetIndex === b.targetIndex
}

/** 次の問題。形式は 1:1、基準と答えは別の音、直前と同一の問題は引き直す（F-402） */
export function nextQuestion(rng: () => number, prev?: Question): Question {
  for (;;) {
    const kind: QuizKind = rng() < 0.5 ? 'degreeToNote' : 'noteToDegree'
    const baseIndex = Math.floor(rng() * 7)
    const targetIndex = (baseIndex + 1 + Math.floor(rng() * 6)) % 7
    const q = { kind, baseIndex, targetIndex }
    if (!prev || !sameQuestion(q, prev)) return q
  }
}

export function questionText(q: Question, scale: NoteName[]): string {
  const base = formatNote(scale[q.baseIndex])
  return q.kind === 'degreeToNote'
    ? `${base} から見て ${degreeBetween(q.baseIndex, q.targetIndex)} 度は？`
    : `${base} から見た ${formatNote(scale[q.targetIndex])} は？`
}

export function answerText(q: Question, scale: NoteName[]): string {
  return q.kind === 'degreeToNote'
    ? formatNote(scale[q.targetIndex])
    : `${degreeBetween(q.baseIndex, q.targetIndex)} 度`
}
