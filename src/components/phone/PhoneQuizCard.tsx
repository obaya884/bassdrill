// スマホの度数カード（F-602。画面定義書 13 §8.2）。カードのタップは PhoneApp の useSwipe が onTap で拾う
import { type NoteName } from '../../domain/pitch'
import { answerText, questionText, type Question } from '../../domain/quiz'
import { markersFor } from '../../domain/fretboard'
import { Fretboard } from '../Fretboard'
import { FretboardScroller } from './FretboardScroller'
import { type QuizPhase } from '../../app/useQuizRunner'

type Props = { question: Question; phase: QuizPhase; scale: NoteName[]; auto: boolean; intervalSec: number; onOpenInterval(): void }

export const QUIZ_CARD_SELECTOR = '[data-testid="quiz-card"]'

export function PhoneQuizCard({ question, phase, scale, auto, intervalSec, onOpenInterval }: Props) {
  const answered = phase === 'answered'
  const markers = answered
    ? markersFor([
        { note: scale[question.baseIndex], label: '基準', kind: 'root' },
        { note: scale[question.targetIndex], label: '答え', kind: 'tone' },
      ])
    : []
  return (
    <div className="space-y-3">
      <div data-testid="quiz-card" className="relative rounded-2xl bg-surface border border-line px-3 pt-10 pb-6 min-h-[180px] flex flex-col items-center justify-center select-none">
        <button
          type="button"
          aria-label="自動送りの間隔"
          onClick={onOpenInterval}
          className="absolute right-2 top-1 min-h-11 px-2 text-[13px] text-muted"
        >
          {auto ? `自動送り: オン ${intervalSec} 秒` : '自動送り: オフ'}
        </button>
        <div data-testid="quiz-question" className="text-[32px] font-semibold leading-tight text-center">{questionText(question, scale)}</div>
        {answered && (
          <div data-testid="quiz-answer" className="mt-3 text-[32px] font-bold text-accent leading-tight">{answerText(question, scale)}</div>
        )}
        {!answered && <div className="mt-3 text-[13px] text-muted">タップで答え</div>}
      </div>
      <FretboardScroller><Fretboard markers={markers} /></FretboardScroller>
    </div>
  )
}
