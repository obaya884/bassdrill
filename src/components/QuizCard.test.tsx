import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { note } from '../domain/pitch'
import { majorScale } from '../domain/scale'
import { QuizCard } from './QuizCard'

const C = majorScale(note('C'))
const q = { kind: 'degreeToNote' as const, baseIndex: 4, targetIndex: 0 }

describe('QuizCard', () => {
  it('出題中は「答え」、答え表示中は「次」。押すたびに onAdvance を 1 回', async () => {
    const onAdvance = vi.fn()
    const { rerender } = render(<QuizCard question={q} phase="asking" scale={C} onAdvance={onAdvance} />)
    expect(screen.getByTestId('quiz-question')).toHaveTextContent('G から見て 4 度は？')
    expect(screen.queryByTestId('quiz-answer')).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: '答え' }))
    expect(onAdvance).toHaveBeenCalledTimes(1)
    rerender(<QuizCard question={q} phase="answered" scale={C} onAdvance={onAdvance} />)
    expect(screen.getByTestId('quiz-answer')).toHaveTextContent('C')
    await userEvent.click(screen.getByRole('button', { name: '次' }))
    expect(onAdvance).toHaveBeenCalledTimes(2)
    expect(screen.getAllByTestId('marker').length).toBeGreaterThan(0) // 基準と答えの 2 音
  })
  it('問題文やカードをクリックしても onAdvance は呼ばれない', async () => {
    const onAdvance = vi.fn()
    render(<QuizCard question={q} phase="asking" scale={C} onAdvance={onAdvance} />)
    await userEvent.click(screen.getByTestId('quiz-question'))
    await userEvent.click(screen.getByTestId('quiz-card'))
    expect(onAdvance).not.toHaveBeenCalled()
    expect(screen.queryAllByTestId('marker')).toHaveLength(0)
  })
  it('compact では指板がスクロールの箱に入る', () => {
    render(<QuizCard question={q} phase="asking" scale={C} onAdvance={() => {}} compact />)
    expect(screen.getByTestId('fretboard-scroll')).toBeInTheDocument()
  })
})

describe('QuizCard: 高さの安定（F-102）', () => {
  it('出題中も答えの行の場所を確保し、答え表示で高さが変わらない', () => {
    const { rerender } = render(<QuizCard question={q} phase="asking" scale={C} onAdvance={() => {}} />)
    const slot = screen.getByTestId('quiz-answer-slot')
    expect(slot).toHaveAttribute('aria-hidden', 'true')
    expect(slot.className).toMatch(/invisible/)
    rerender(<QuizCard question={q} phase="answered" scale={C} onAdvance={() => {}} />)
    expect(screen.getByTestId('quiz-answer-slot').className).not.toMatch(/invisible/)
    expect(screen.getByTestId('quiz-answer')).toHaveTextContent('C')
  })
})
