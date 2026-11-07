// PC 表示（F-501・F-502。画面定義書 13 §1〜§3）: 固定ヘッダー（キーのボタンとポップオーバー、右端に音の入切）と、6 節を等倍で縦に並べた本体。キーボードは購読しない
import { useState } from 'react'
import { formatNote } from '../domain/pitch'
import { KeyPopover } from '../components/KeyPopover'
import { SoundToggle } from '../components/SoundToggle'
import { QuizCard } from '../components/QuizCard'
import { ScaleSection } from '../components/sections/ScaleSection'
import { PentaSection } from '../components/sections/PentaSection'
import { PlayButton } from '../components/PlayButton'
import { SeventhSection, DiatonicSection, NonDiatonicSection } from '../components/sections/chordSections'
import { SECTIONS, SECTION_TITLES, type SectionId } from './sections'
import { type DrillState } from './useDrillState'

export function DesktopApp({ state }: { state: DrillState }) {
  const { currentKey, todayKey, keyLabel, chordIndex, pentaMode, quiz, scale, sound, selectKey, nextKey, selectChord, togglePenta, playScale } = state
  const [chooserOpen, setChooserOpen] = useState(false)
  const close = () => setChooserOpen(false)

  const body = (id: SectionId) => {
    switch (id) {
      case 'scale': return <ScaleSection keyNote={currentKey} soundEnabled={sound.enabled} onPlay={() => playScale('scale')} />
      case 'penta': return <PentaSection keyNote={currentKey} mode={pentaMode} onToggle={togglePenta} soundEnabled={sound.enabled} onPlay={() => playScale('penta')} />
      case 'seventh': return <SeventhSection keyNote={currentKey} selected={chordIndex.seventh} onSelect={(i) => selectChord('seventh', i)} />
      case 'quiz': return <QuizCard question={quiz.question} phase={quiz.phase} scale={scale} onAdvance={quiz.advance} />
      case 'diatonic': return <DiatonicSection keyNote={currentKey} selected={chordIndex.diatonic} onSelect={(i) => selectChord('diatonic', i)} />
      case 'nonDiatonic': return <NonDiatonicSection keyNote={currentKey} selected={chordIndex.nonDiatonic} onSelect={(i) => selectChord('nonDiatonic', i)} />
    }
  }

  return (
    <div className="min-h-screen bg-bg text-ink">
      <header className="fixed top-0 inset-x-0 h-[88px] z-10 bg-surface border-b border-line" role="banner">
        <div className="max-w-[1200px] mx-auto h-full px-6 flex items-center justify-center">
          <div className="absolute left-6 top-1/2 -translate-y-1/2 text-[18px] font-semibold text-muted tracking-wide select-none">Bass Drill</div>
          <div className="relative flex flex-col items-center">
            <button
              type="button"
              data-testid="current-key"
              aria-label={`キー ${formatNote(currentKey)} を変える`}
              aria-expanded={chooserOpen}
              onClick={() => setChooserOpen((o) => !o)}
              className="text-[40px] font-bold text-accent leading-none px-3 min-h-11 rounded-lg hover:bg-surface-raised"
            >
              {keyLabel} <span className="text-[16px] text-muted align-middle">▾</span>
            </button>
            {chooserOpen && (
              <KeyPopover current={currentKey} today={todayKey} onSelect={(k) => { selectKey(k); close() }} onNext={() => { nextKey(); close() }} onClose={close} />
            )}
          </div>
          <div className="absolute right-6 top-1/2 -translate-y-1/2">
            <SoundToggle enabled={sound.enabled} onToggle={sound.toggle} />
          </div>
        </div>
      </header>

      <main className="max-w-[1200px] mx-auto px-6 pt-[120px] pb-[40vh] space-y-16">
        {SECTIONS.map((id) => (
          <section key={id} id={`section-${id}`}>
            <div className="flex items-center gap-4 mb-4">
              <h2 className="text-[28px] font-semibold">{SECTION_TITLES[id]}</h2>
              {/* スケールの再生ボタンは見出しの右（13 §2.2）。ペンタは節の中の切り替えの右 */}
              {id === 'scale' && <PlayButton label="スケールを再生" enabled={sound.enabled} onPlay={() => playScale('scale')} />}
            </div>
            {body(id)}
          </section>
        ))}
      </main>
    </div>
  )
}
