// スマホ表示（F-601〜F-606。画面定義書 13 §8）: ヘッダー → 点 → 7 節を横に並べた帯 → 下部バー
import { useCallback, useEffect, useRef, useState } from 'react'
import { formatNote } from '../domain/pitch'
import { PhoneHeader } from '../components/phone/PhoneHeader'
import { PageDots } from '../components/phone/PageDots'
import { BottomBar } from '../components/phone/BottomBar'
import { KeySection } from '../components/sections/KeySection'
import { ScaleSection } from '../components/sections/ScaleSection'
import { PentaSection } from '../components/sections/PentaSection'
import { SeventhSection, DiatonicSection, NonDiatonicSection } from '../components/sections/chordSections'
import { PhoneQuizCard, QUIZ_CARD_SELECTOR } from '../components/phone/PhoneQuizCard'
import { KeySheet } from '../components/phone/KeySheet'
import { IntervalSheet } from '../components/phone/IntervalSheet'
import { SECTIONS, SECTION_TITLES, type SectionId } from './sections'
import { useKeyboard, type Action } from './useKeyboard'
import { useSwipe } from './useSwipe'
import { type DrillState } from './useDrillState'

export function PhoneApp({ state }: { state: DrillState }) {
  const { focus, currentKey, manualKey, keyOffset, chordIndex, pentaMode, quiz, scale, auto, intervalSec, selectChord, selectKey, setIntervalSec } = state

  // シート（F-604・F-602）。開いている間、キー入力は Escape（閉じる）以外を無視する
  type SheetKind = 'none' | 'key' | 'interval'
  const [sheet, setSheet] = useState<SheetKind>('none')
  const sheetRef = useRef<SheetKind>('none')
  useEffect(() => {
    sheetRef.current = sheet
  }, [sheet])
  const closeSheet = useCallback(() => setSheet('none'), [])
  const stateOnAction = state.onAction
  const onAction = useCallback((a: Action) => {
    if (sheetRef.current !== 'none') {
      if (a === 'escape') setSheet('none')
      return
    }
    stateOnAction(a)
  }, [stateOnAction])
  useKeyboard(onAction)
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
  // 度数カードの上で始まって 48px 未満で終わったタッチだけ「答え / 次」（F-602）
  const quizAdvance = quiz.advance
  const onTap = useCallback((target: Element) => {
    if (target.closest(QUIZ_CARD_SELECTOR) && !target.closest('button')) quizAdvance()
  }, [quizAdvance])
  const swipe = useSwipe({
    onSwipeLeft: () => state.moveFocus(1),
    onSwipeRight: () => state.moveFocus(-1),
    onTap,
    ignoreWithin: '[data-fretboard-scroll]',
    onDrag,
    onRelease,
  })

  const body = (id: SectionId) => {
    switch (id) {
      case 'key': return <KeySection keyNote={currentKey} manual={manualKey !== null} />
      case 'scale': return <ScaleSection keyNote={currentKey} compact />
      case 'penta': return <PentaSection keyNote={currentKey} mode={pentaMode} compact />
      case 'seventh': return <SeventhSection keyNote={currentKey} selected={chordIndex.seventh} compact onSelect={(i) => selectChord('seventh', i)} />
      case 'quiz': return <PhoneQuizCard question={quiz.question} phase={quiz.phase} scale={scale} auto={auto} intervalSec={intervalSec} onOpenInterval={() => setSheet('interval')} />
      case 'diatonic': return <DiatonicSection keyNote={currentKey} selected={chordIndex.diatonic} compact onSelect={(i) => selectChord('diatonic', i)} />
      case 'nonDiatonic': return <NonDiatonicSection keyNote={currentKey} selected={chordIndex.nonDiatonic} compact onSelect={(i) => selectChord('nonDiatonic', i)} />
    }
  }

  return (
    <div className="h-dvh flex flex-col bg-bg text-ink overflow-hidden">
      <PhoneHeader title={`節 ${index + 1} / 7 ${SECTION_TITLES[focus]}`} keyName={formatNote(currentKey)} keyOffset={keyOffset} onKeyTap={() => setSheet('key')} />
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
      {sheet === 'key' && <KeySheet current={currentKey} onSelect={(k) => { selectKey(k); closeSheet() }} onClose={closeSheet} />}
      {sheet === 'interval' && <IntervalSheet value={intervalSec} onChange={setIntervalSec} onClose={closeSheet} />}
    </div>
  )
}
