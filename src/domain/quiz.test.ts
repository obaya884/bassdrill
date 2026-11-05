import { describe, it, expect } from 'vitest'
import { formatNote, note } from './pitch'
import { majorScale } from './scale'
import { mulberry32 } from './dailyKey'
import { INTERVALS, INTERVAL_SPEC, intervalNote, nextQuestion, questionText, questionSegments, answerText, answerNote, type Question } from './quiz'

const C = majorScale(note('C'))
const q = (kind: Question['kind'], baseIndex: number, interval: Question['interval']): Question => ({ kind, baseIndex, interval })

describe('quiz: 音程（F-401）', () => {
  it('8 つの音程と表記', () => {
    expect(INTERVALS).toEqual(['2', 'b3', '3', '4', '5', '6', 'b7', '7'])
    expect(INTERVALS.map((i) => INTERVAL_SPEC[i].label)).toEqual(['2 度（9 度）', '♭3 度', '3 度', '4 度（11 度）', '5 度', '6 度', '♭7 度', '7 度'])
    expect(INTERVALS.map((i) => INTERVAL_SPEC[i].semitones)).toEqual([2, 3, 4, 5, 7, 9, 10, 11])
  })
  it('C からの 8 音', () => {
    expect(INTERVALS.map((i) => formatNote(intervalNote(note('C'), i)))).toEqual(['D', 'E♭', 'E', 'F', 'G', 'A', 'B♭', 'B'])
  })
  it('文字送りで綴る（E から 3 度は G♯、B♭ から ♭3 度は D♭、F から 7 度は E、A♭ から ♭7 度は G♭）', () => {
    expect(formatNote(intervalNote(note('E'), '3'))).toBe('G♯')
    expect(formatNote(intervalNote(note('B', -1), 'b3'))).toBe('D♭')
    expect(formatNote(intervalNote(note('F'), '7'))).toBe('E')
    expect(formatNote(intervalNote(note('A', -1), 'b7'))).toBe('G♭')
    expect(formatNote(intervalNote(note('G', 1), '3'))).toBe('B♯')
    expect(formatNote(intervalNote(note('C', -1), '4'))).toBe('F♭')
    expect(formatNote(intervalNote(note('C', -1), '6'))).toBe('A♭')
  })
  it('ダブル変化記号になる答えは最も単純な綴りに読み替える', () => {
    expect(formatNote(intervalNote(note('C', -1), 'b3'))).toBe('D') // E𝄫
    expect(formatNote(intervalNote(note('C', -1), 'b7'))).toBe('A') // B𝄫
    expect(formatNote(intervalNote(note('A', 1), '3'))).toBe('D') // C𝄪
    expect(formatNote(intervalNote(note('A', 1), '6'))).toBe('G') // F𝄪
    expect(formatNote(intervalNote(note('A', 1), '7'))).toBe('A') // G𝄪
    expect(formatNote(intervalNote(note('D', 1), '3'))).toBe('G') // F𝄪
    expect(formatNote(intervalNote(note('D', 1), '7'))).toBe('D') // C𝄪
  })
  it('12 キーの全基準 × 8 音程で半音数が合い、ダブル変化記号が出ない', () => {
    for (const key of ['C', 'G', 'D', 'A', 'E', 'B'].map((l) => note(l as 'C'))) {
      for (const base of majorScale(key)) check(base)
    }
    for (const key of [note('G', -1), note('D', -1), note('A', -1), note('E', -1), note('B', -1), note('F')]) {
      for (const base of majorScale(key)) check(base)
    }
    function check(base: ReturnType<typeof note>) {
      for (const i of INTERVALS) {
        const n = intervalNote(base, i)
        expect(Math.abs(n.accidental)).toBeLessThanOrEqual(1)
        const pc = (x: ReturnType<typeof note>) => (({ C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 })[x.letter] + x.accidental + 12) % 12
        expect((pc(n) - pc(base) + 12) % 12).toBe(INTERVAL_SPEC[i].semitones)
      }
    }
  })
})

describe('quiz: 出題と文言', () => {
  it('文言', () => {
    expect(questionText(q('degreeToNote', 4, '4'), C)).toBe('G から見て 4 度（11 度）は？')
    expect(answerText(q('degreeToNote', 4, '4'), C)).toBe('C')
    expect(questionText(q('degreeToNote', 0, 'b3'), C)).toBe('C から見て ♭3 度は？')
    expect(answerText(q('degreeToNote', 0, 'b3'), C)).toBe('E♭')
    expect(questionText(q('noteToDegree', 4, '3'), C)).toBe('G から見た B は？')
    expect(answerText(q('noteToDegree', 4, '3'), C)).toBe('3 度')
    expect(questionText(q('noteToDegree', 2, '3'), C)).toBe('E から見た G♯ は？')
    expect(answerText(q('noteToDegree', 0, 'b7'), C)).toBe('♭7 度')
    expect(formatNote(answerNote(q('noteToDegree', 2, '3'), C))).toBe('G♯')
    expect(questionSegments(q('degreeToNote', 4, '4'), C)).toEqual([
      { text: 'G から見て ', noWrap: false }, { text: '4 度（11 度）', noWrap: true }, { text: 'は？', noWrap: false },
    ])
    expect(questionSegments(q('noteToDegree', 2, '3'), C)).toEqual([
      { text: 'E から見た ', noWrap: false }, { text: 'G♯', noWrap: true }, { text: ' は？', noWrap: false },
    ])
  })
  it('基準はスケールの 7 音、音程は 8 つから、直前と同一の問題は出ない', () => {
    let prev: Question | undefined
    const rng = mulberry32(7)
    const seen = new Set<string>()
    for (let i = 0; i < 1000; i++) {
      const next = nextQuestion(rng, prev)
      expect(next.baseIndex).toBeGreaterThanOrEqual(0)
      expect(next.baseIndex).toBeLessThan(7)
      expect(INTERVALS).toContain(next.interval)
      if (prev) expect(next).not.toEqual(prev)
      seen.add(next.interval)
      prev = next
    }
    expect(seen.size).toBe(8)
  })
  it('2 形式が両方出る', () => {
    const rng = mulberry32(3)
    const kinds = new Set(Array.from({ length: 50 }, () => nextQuestion(rng).kind))
    expect(kinds).toEqual(new Set(['degreeToNote', 'noteToDegree']))
  })
  it('rng を固定すれば決定的', () => {
    expect(nextQuestion(mulberry32(1))).toEqual(nextQuestion(mulberry32(1)))
  })
})
