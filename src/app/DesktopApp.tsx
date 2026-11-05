// PC 表示（F-501〜F-505。画面定義書 13 §1〜§4）
import { formatNote } from '../domain/pitch'
import { CircleOfFifths } from '../components/CircleOfFifths'
import { Section } from '../components/Section'
import { ShortcutBar, HelpDialog } from '../components/ShortcutBar'
import { KeySection } from '../components/sections/KeySection'
import { ScaleSection } from '../components/sections/ScaleSection'
import { PentaSection } from '../components/sections/PentaSection'
import { SeventhSection, DiatonicSection, NonDiatonicSection } from '../components/sections/chordSections'
import { QuizSection } from '../components/sections/QuizSection'
import { SECTIONS, SECTION_TITLES } from './sections'
import { useKeyboard } from './useKeyboard'
import { type DrillState } from './useDrillState'

export function DesktopApp({ state }: { state: DrillState }) {
  const { currentKey, manualKey, keyOffset, focus, chordIndex, pentaMode, quiz, scale, auto, intervalSec, helpOpen, setHelpOpen, selectKey } = state
  useKeyboard(state.onAction)
  const focusIndex = SECTIONS.indexOf(focus)

  return (
    <div className="min-h-screen bg-bg text-ink">
      <header className="fixed top-0 inset-x-0 h-[88px] z-10 bg-surface border-b border-line">
        <div className="max-w-[1200px] mx-auto h-full px-6 flex items-center justify-between">
          <div className="text-[14px] text-muted w-64">{`節 ${focusIndex + 1} / 7 ${SECTION_TITLES[focus]}`}</div>
          <div data-testid="current-key" className="text-[40px] font-bold text-accent leading-none">{formatNote(currentKey)}</div>
          <div className="flex items-center gap-4 w-64 justify-end">
            <CircleOfFifths current={currentKey} onSelect={selectKey} />
            <span className="text-[14px] text-muted">{`${keyOffset + 1} / 12`}</span>
          </div>
        </div>
      </header>

      <main className="max-w-[1200px] mx-auto px-6 pt-[calc(88px+40vh)] pb-[calc(40px+40vh)] space-y-16">
        {SECTIONS.map((id, i) => (
          <Section key={id} id={id} title={SECTION_TITLES[id]} focused={focus === id} index={i}>
            {id === 'key' && <KeySection keyNote={currentKey} manual={manualKey !== null} />}
            {id === 'scale' && <ScaleSection keyNote={currentKey} />}
            {id === 'penta' && <PentaSection keyNote={currentKey} mode={pentaMode} />}
            {id === 'seventh' && <SeventhSection keyNote={currentKey} selected={chordIndex.seventh} />}
            {id === 'quiz' && <QuizSection question={quiz.question} phase={quiz.phase} scale={scale} auto={auto} intervalSec={intervalSec} />}
            {id === 'diatonic' && <DiatonicSection keyNote={currentKey} selected={chordIndex.diatonic} />}
            {id === 'nonDiatonic' && <NonDiatonicSection keyNote={currentKey} selected={chordIndex.nonDiatonic} />}
          </Section>
        ))}
      </main>

      <ShortcutBar />
      {helpOpen && <HelpDialog onClose={() => setHelpOpen(false)} />}
    </div>
  )
}
