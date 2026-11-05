// 度数の出題の状態機械（F-403）。出題中 → 答え表示 → 次の出題中
import { useCallback, useEffect, useRef, useState } from 'react'
import { type NoteName } from '../domain/pitch'
import { nextQuestion, type Question } from '../domain/quiz'

export type QuizPhase = 'asking' | 'answered'

type Options = { scale: NoteName[]; rng?: () => number }
type State = { question: Question; phase: QuizPhase }

export function useQuizRunner({ scale, rng = Math.random }: Options) {
  const rngRef = useRef(rng)
  useEffect(() => {
    rngRef.current = rng
  }, [rng])
  const [state, setState] = useState<State>(() => ({ question: nextQuestion(rng), phase: 'asking' }))

  // scale が変わったら新しい問題から（F-102）
  const scaleKey = scale.map((n) => `${n.letter}${n.accidental}`).join(' ')
  const prevScaleKey = useRef(scaleKey)
  useEffect(() => {
    if (prevScaleKey.current === scaleKey) return
    prevScaleKey.current = scaleKey
    setState((s) => ({ question: nextQuestion(rngRef.current, s.question), phase: 'asking' }))
  }, [scaleKey])

  const advance = useCallback(() => {
    setState((s) =>
      s.phase === 'asking'
        ? { ...s, phase: 'answered' }
        : { question: nextQuestion(rngRef.current, s.question), phase: 'asking' },
    )
  }, [])

  return { question: state.question, phase: state.phase, advance }
}
