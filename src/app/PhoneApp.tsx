// スマホ表示（F-601〜F-606。画面定義書 13 §8）: ヘッダー → 点 → 7 節を横に並べた帯 → 下部バー
import { useCallback, useState } from 'react'
import { formatNote } from '../domain/pitch'
import { PhoneHeader } from '../components/phone/PhoneHeader'
import { PageDots } from '../components/phone/PageDots'
import { BottomBar } from '../components/phone/BottomBar'
import { KeySection } from '../components/sections/KeySection'
import { ScaleSection } from '../components/sections/ScaleSection'
import { PentaSection } from '../components/sections/PentaSection'
import { SeventhSection, DiatonicSection, NonDiatonicSection } from '../components/sections/chordSections'
import { QuizSection } from '../components/sections/QuizSection'
import { SECTIONS, SECTION_TITLES, type SectionId } from './sections'
import { useKeyboard } from './useKeyboard'
import { useSwipe } from './useSwipe'
import { type DrillState } from './useDrillState'

export function PhoneApp({ state }: { state: DrillState }) {
  const { focus, currentKey, manualKey, keyOffset, chordIndex, pentaMode, quiz, scale, auto, intervalSec } = state
  useKeyboard(state.onAction)
  const index = SECTIONS.indexOf(focus)

  // 帯のページ送り（13 §8.5）。追随中は dragX で帯をずらし、離したら 200ms で収める
  const [dragX, setDragX] = useState(0)
  const [dragging, setDragging] = useState(false)
  const onDrag = useCallback((dx: number) => {
    setDragging(true)
    setDragX(dx)
  }, [])
  const onRelease = useCallback(() => {
    setDragging(false)
    setDragX(0)
  }, [])
  const swipe = useSwipe({
    onSwipeLeft: () => state.moveFocus(1),
    onSwipeRight: () => state.moveFocus(-1),
    ignoreWithin: '[data-fretboard-scroll]',
    onDrag,
    onRelease,
  })

  const body = (id: SectionId) => {
    switch (id) {
      case 'key': return <KeySection keyNote={currentKey} manual={manualKey !== null} />
      case 'scale': return <ScaleSection keyNote={currentKey} />
      case 'penta': return <PentaSection keyNote={currentKey} mode={pentaMode} />
      case 'seventh': return <SeventhSection keyNote={currentKey} selected={chordIndex.seventh} />
      case 'quiz': return <QuizSection question={quiz.question} phase={quiz.phase} scale={scale} auto={auto} intervalSec={intervalSec} />
      case 'diatonic': return <DiatonicSection keyNote={currentKey} selected={chordIndex.diatonic} />
      case 'nonDiatonic': return <NonDiatonicSection keyNote={currentKey} selected={chordIndex.nonDiatonic} />
    }
  }

  return (
    <div className="h-dvh flex flex-col bg-bg text-ink overflow-hidden">
      <PhoneHeader title={`節 ${index + 1} / 7 ${SECTION_TITLES[focus]}`} keyName={formatNote(currentKey)} keyOffset={keyOffset} onKeyTap={() => {}} />
      <PageDots count={SECTIONS.length} index={index} onPrev={() => state.moveFocus(-1)} onNext={() => state.moveFocus(1)} />
      <div className="flex-1 overflow-hidden">
        <div
          data-testid="page-strip"
          className={`flex h-full ${dragging ? '' : 'transition-transform duration-200 ease-out'}`}
          style={{ transform: `translateX(calc(-${index * 100}% + ${dragX}px))`, touchAction: 'pan-y' }}
          {...swipe}
        >
          {SECTIONS.map((id) => (
            <section
              key={id}
              id={`page-${id}`}
              data-focused={focus === id ? 'true' : undefined}
              aria-current={focus === id ? 'true' : undefined}
              className="w-full shrink-0 h-full overflow-y-auto px-3 py-3"
            >
              <h2 className="text-[22px] font-semibold mb-3">{`${SECTIONS.indexOf(id) + 1} ${SECTION_TITLES[id]}`}</h2>
              {body(id)}
            </section>
          ))}
        </div>
      </div>
      <BottomBar section={focus} state={state} />
    </div>
  )
}
