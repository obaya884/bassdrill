// 下部バー（F-602。画面定義書 13 §8.1）。節ごとに要るボタンだけ出す
import { type SectionId } from '../../app/sections'
import { type DrillState, isChordSection } from '../../app/useDrillState'

function Btn({ label, onClick, accent = false }: { label: string; onClick(): void; accent?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`min-h-11 px-4 rounded-xl text-[15px] font-semibold ${accent ? 'bg-accent text-bg' : 'bg-surface-raised text-ink'}`}
    >
      {label}
    </button>
  )
}

export function BottomBar({ section, state }: { section: SectionId; state: DrillState }) {
  return (
    <footer className="shrink-0 h-[calc(64px+env(safe-area-inset-bottom))] bg-surface border-t border-line flex items-center justify-center gap-3 pb-[env(safe-area-inset-bottom)] pl-[max(12px,env(safe-area-inset-left))] pr-[max(12px,env(safe-area-inset-right))]">
      {section === 'penta' && <Btn label="メジャー / マイナー" onClick={state.togglePenta} />}
      {isChordSection(section) && (
        <>
          <Btn label="◀" onClick={() => state.moveChord(-1)} />
          <Btn label="▶" onClick={() => state.moveChord(1)} />
        </>
      )}
      {section === 'quiz' && (
        <>
          <Btn label="答え / 次" onClick={state.quiz.advance} accent />
          <Btn label="自動送り" onClick={state.toggleAuto} />
        </>
      )}
      <Btn label="次のキー" onClick={state.nextKey} accent={section !== 'quiz'} />
    </footer>
  )
}
