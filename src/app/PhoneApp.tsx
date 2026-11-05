// スマホ表示（F-601〜F-606。画面定義書 13 §8）: ヘッダー → 点 → 6 節を横に並べた帯。下部バーは無い
import { useCallback, useEffect, useRef, useState } from 'react'
import { formatNote } from '../domain/pitch'
import { PhoneHeader } from '../components/phone/PhoneHeader'
import { PageDots } from '../components/phone/PageDots'
import { Sheet } from '../components/phone/Sheet'
import { KeyChooser } from '../components/KeyChooser'
import { QuizCard } from '../components/QuizCard'
import { ScaleSection } from '../components/sections/ScaleSection'
import { PentaSection } from '../components/sections/PentaSection'
import { SeventhSection, DiatonicSection, NonDiatonicSection } from '../components/sections/chordSections'
import { SECTIONS, SECTION_TITLES, type SectionId } from './sections'
import { useSwipe } from './useSwipe'
import { type DrillState } from './useDrillState'

export function PhoneApp({ state }: { state: DrillState }) {
  const { focus, currentKey, todayKey, keyLabel, chordIndex, pentaMode, quiz, scale, selectChord, selectKey, nextKey, togglePenta } = state
  const index = SECTIONS.indexOf(focus)

  // キー選択シート（F-104・F-604）。開いている間、帯のスワイプは効かない
  const [sheetOpen, setSheetOpen] = useState(false)
  const closeSheet = useCallback(() => setSheetOpen(false), [])

  // 節を移ったら、その節の縦スクロールと指板の横スクロールを先頭に戻す（13 §8.3・§8.5）
  const stripRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const sec = stripRef.current?.children[index] as HTMLElement | undefined
    if (!sec) return
    sec.scrollTop = 0
    for (const box of sec.querySelectorAll<HTMLElement>('[data-fretboard-scroll]')) box.scrollLeft = 0
  }, [index])

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
      case 'scale': return <ScaleSection keyNote={currentKey} compact />
      case 'penta': return <PentaSection keyNote={currentKey} mode={pentaMode} onToggle={togglePenta} compact />
      case 'seventh': return <SeventhSection keyNote={currentKey} selected={chordIndex.seventh} compact onSelect={(i) => selectChord('seventh', i)} />
      case 'quiz': return <QuizCard question={quiz.question} phase={quiz.phase} scale={scale} onAdvance={quiz.advance} compact />
      case 'diatonic': return <DiatonicSection keyNote={currentKey} selected={chordIndex.diatonic} compact onSelect={(i) => selectChord('diatonic', i)} />
      case 'nonDiatonic': return <NonDiatonicSection keyNote={currentKey} selected={chordIndex.nonDiatonic} compact onSelect={(i) => selectChord('nonDiatonic', i)} />
    }
  }

  return (
    <div className="h-dvh flex flex-col bg-bg text-ink overflow-hidden">
      <PhoneHeader keyName={formatNote(currentKey)} label={keyLabel} onKeyTap={() => setSheetOpen(true)} />
      <PageDots count={SECTIONS.length} index={index} onPrev={() => state.moveFocus(-1)} onNext={() => state.moveFocus(1)} />
      <div className="flex-1 overflow-hidden">
        <div
          ref={stripRef}
          data-testid="page-strip"
          className={`flex h-full ${dragging ? '' : 'transition-transform duration-200 ease-out'}`}
          style={{ transform: `translateX(calc(-${index * 100}% + ${dragX}px))`, touchAction: 'pan-y' }}
          {...(sheetOpen ? {} : swipe)}
        >
          {SECTIONS.map((id) => (
            <section
              key={id}
              id={`page-${id}`}
              data-focused={focus === id ? 'true' : undefined}
              aria-current={focus === id ? 'true' : undefined}
              className="w-full shrink-0 h-full overflow-y-auto pt-3 pb-[calc(16px+env(safe-area-inset-bottom))] pl-[max(12px,env(safe-area-inset-left))] pr-[max(12px,env(safe-area-inset-right))]"
              style={{ touchAction: 'pan-y' }}
            >
              <h2 className="text-[22px] font-semibold mb-3">{SECTION_TITLES[id]}</h2>
              {body(id)}
            </section>
          ))}
        </div>
      </div>
      {sheetOpen && (
        <Sheet label="キーを選ぶ" onClose={closeSheet}>
          <KeyChooser current={currentKey} today={todayKey} onSelect={(k) => { selectKey(k); closeSheet() }} onNext={() => { nextKey(); closeSheet() }} />
        </Sheet>
      )}
    </div>
  )
}
