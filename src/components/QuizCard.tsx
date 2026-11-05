// 度数の問題カード（F-403。画面定義書 13 §2.1・§8.2）: 問題文・答え・右下の「答え／次」ボタン。カードの他の場所にハンドラは付けない
import { type NoteName } from '../domain/pitch'
import { answerNote, answerText, baseNote, questionSegments, type Question } from '../domain/quiz'
import { markersFor } from '../domain/fretboard'
import { Fretboard } from './Fretboard'
import { FretboardScroller } from './phone/FretboardScroller'
import { type QuizPhase } from '../app/useQuizRunner'

type Props = { question: Question; phase: QuizPhase; scale: NoteName[]; onAdvance(): void; compact?: boolean }

export function QuizCard({ question, phase, scale, onAdvance, compact = false }: Props) {
  const answered = phase === 'answered'
  const markers = answered
    ? markersFor([
        { note: baseNote(question, scale), label: '基準', kind: 'root' },
        { note: answerNote(question, scale), label: '答え', kind: 'tone' },
      ])
    : []
  const fretboard = <Fretboard markers={markers} />
  return (
    <div className="space-y-4">
      <div data-testid="quiz-card" className={`relative rounded-2xl bg-surface border border-line flex flex-col items-center justify-center select-none ${compact ? 'px-3 pt-6 pb-16 min-h-[180px]' : 'px-6 pt-10 pb-20 min-h-[240px]'}`}>
        <div data-testid="quiz-question" className={`font-semibold leading-tight text-center ${compact ? 'text-[32px]' : 'text-[56px]'}`}>
          {questionSegments(question, scale).map((s, i) => (
            <span key={i} className={s.noWrap ? 'whitespace-nowrap' : undefined}>{s.text}</span>
          ))}
        </div>
        {/* 答えの行は出題中も場所を確保し、答え表示でカードの高さが変わらないようにする（F-102: 見ている場所を動かさない） */}
        <div
          data-testid="quiz-answer-slot"
          aria-hidden={answered ? undefined : 'true'}
          className={`mt-3 font-bold text-accent leading-tight ${compact ? 'text-[32px]' : 'text-[56px]'} ${answered ? '' : 'invisible'}`}
        >
          {answered ? <span data-testid="quiz-answer">{answerText(question, scale)}</span> : '　'}
        </div>
        <button
          type="button"
          onClick={onAdvance}
          className="absolute right-4 bottom-4 min-h-11 min-w-24 px-5 rounded-xl bg-accent text-bg text-[15px] font-semibold"
        >
          {answered ? '次' : '答え'}
        </button>
      </div>
      {compact ? <FretboardScroller>{fretboard}</FretboardScroller> : fretboard}
    </div>
  )
}
