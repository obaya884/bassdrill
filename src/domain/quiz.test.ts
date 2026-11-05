import { describe, it, expect } from 'vitest'
import { note } from './pitch'
import { majorScale } from './scale'
import { mulberry32 } from './dailyKey'
import { degreeBetween, nextQuestion, questionText, answerText, type Question } from './quiz'

const C = majorScale(note('C'))

describe('quiz', () => {
  it('degreeBetween は上に数えて 2〜7', () => {
    expect(degreeBetween(4, 6)).toBe(3) // G→B
    expect(degreeBetween(1, 0)).toBe(7) // D→C
    expect(degreeBetween(4, 0)).toBe(4) // G→C
  })
  it('文言', () => {
    expect(questionText({ kind: 'degreeToNote', baseIndex: 4, targetIndex: 0 }, C)).toBe('G から見て 4 度は？')
    expect(answerText({ kind: 'degreeToNote', baseIndex: 4, targetIndex: 0 }, C)).toBe('C')
    expect(questionText({ kind: 'noteToDegree', baseIndex: 4, targetIndex: 6 }, C)).toBe('G から見た B は？')
    expect(answerText({ kind: 'noteToDegree', baseIndex: 4, targetIndex: 6 }, C)).toBe('3 度')
  })
  it('基準と答えは一致せず、直前と同一の問題は出ない', () => {
    let prev: Question | undefined
    const rng = mulberry32(7)
    for (let i = 0; i < 1000; i++) {
      const q = nextQuestion(rng, prev)
      expect(q.baseIndex).not.toBe(q.targetIndex)
      expect(q.baseIndex).toBeGreaterThanOrEqual(0)
      expect(q.targetIndex).toBeLessThan(7)
      if (prev) expect(q).not.toEqual(prev)
      prev = q
    }
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
