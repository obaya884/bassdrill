// 度数の出題の状態機械と自動送り（F-403・F-404）
import { useCallback, useEffect, useRef, useState } from 'react'
import { type NoteName } from '../domain/pitch'
import { nextQuestion, type Question } from '../domain/quiz'

export type QuizPhase = 'asking' | 'answered'

type Options = {
  scale: NoteName[]
  /** 節 5 にフォーカスがあるか。false ならタイマーを止める */
  active: boolean
  auto: boolean
  intervalSec: number
  rng?: () => number
}

type State = { question: Question; phase: QuizPhase; tick: number }

export function useQuizRunner({ scale, active, auto, intervalSec, rng = Math.random }: Options) {
  const rngRef = useRef(rng)
  useEffect(() => {
    rngRef.current = rng
  }, [rng])
  const [state, setState] = useState<State>(() => ({ question: nextQuestion(rng), phase: 'asking', tick: 0 }))

  // scale が変わったら新しい問題から（F-102）
  const scaleKey = scale.map((n) => `${n.letter}${n.accidental}`).join(' ')
  const prevScaleKey = useRef(scaleKey)
  useEffect(() => {
    if (prevScaleKey.current === scaleKey) return
    prevScaleKey.current = scaleKey
    setState((s) => ({ question: nextQuestion(rngRef.current, s.question), phase: 'asking', tick: s.tick + 1 }))
  }, [scaleKey])

  const advance = useCallback(() => {
    setState((s) =>
      s.phase === 'asking'
        ? { ...s, phase: 'answered', tick: s.tick + 1 }
        : { question: nextQuestion(rngRef.current, s.question), phase: 'asking', tick: s.tick + 1 },
    )
  }, [])

  // 自動送り。状態が変わるたび（tick）タイマーを張り直す
  useEffect(() => {
    if (!active || !auto) return
    const id = setTimeout(advance, intervalSec * 1000)
    return () => clearTimeout(id)
  }, [active, auto, intervalSec, advance, state.tick])

  return { question: state.question, phase: state.phase, advance }
}
