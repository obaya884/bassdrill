// 節 5: 度数の出題（F-401・F-403・F-404。画面定義書 13 §2）
import { type NoteName } from '../../domain/pitch'
import { answerText, questionText, type Question } from '../../domain/quiz'
import { markersFor } from '../../domain/fretboard'
import { Fretboard } from '../Fretboard'
import { type QuizPhase } from '../../app/useQuizRunner'

type Props = { question: Question; phase: QuizPhase; scale: NoteName[]; auto: boolean; intervalSec: number }

export function QuizSection({ question, phase, scale, auto, intervalSec }: Props) {
  const answered = phase === 'answered'
  const markers = answered
    ? markersFor([
        { note: scale[question.baseIndex], label: '基準', kind: 'root' },
        { note: scale[question.targetIndex], label: '答え', kind: 'tone' },
      ])
    : []
  return (
    <div className="relative">
      <div className="absolute right-0 top-0 text-[14px] text-muted">{auto ? `自動送り: オン ${intervalSec} 秒` : '自動送り: オフ'}</div>
      <div className="flex flex-col items-center py-6 min-h-[200px] justify-center">
        <div data-testid="quiz-question" className="text-[56px] font-semibold leading-tight">{questionText(question, scale)}</div>
        {answered && (
          <div data-testid="quiz-answer" className="mt-4 text-[56px] font-bold text-accent leading-tight">{answerText(question, scale)}</div>
        )}
      </div>
      <Fretboard markers={markers} />
    </div>
  )
}
