import { note } from '../domain/pitch'
import { majorScale } from '../domain/scale'
import { markersFor } from '../domain/fretboard'
import { Fretboard } from '../components/Fretboard'
import { CircleOfFifths } from '../components/CircleOfFifths'

// Task 10 の仮置き。Task 11 で骨組みに置き換える
export function App() {
  const scale = majorScale(note('C')).map((n, i) => ({ note: n, label: String(i + 1), kind: i === 0 ? ('root' as const) : ('tone' as const) }))
  return (
    <main className="min-h-screen bg-bg text-ink p-8 max-w-[1200px] mx-auto">
      <CircleOfFifths current={note('C')} onSelect={() => {}} />
      <Fretboard markers={markersFor(scale)} />
    </main>
  )
}
