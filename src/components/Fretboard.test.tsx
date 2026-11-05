import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { note } from '../domain/pitch'
import { majorScale } from '../domain/scale'
import { markersFor, type ToneSpec } from '../domain/fretboard'
import { Fretboard } from './Fretboard'

describe('Fretboard', () => {
  const scale: ToneSpec[] = majorScale(note('C')).map((n, i) => ({ note: n, label: String(i + 1), kind: i === 0 ? 'root' : 'tone' }))

  it('マーカーの数だけ丸を描き、根音に data-kind=root を付ける', () => {
    const markers = markersFor(scale)
    render(<Fretboard markers={markers} />)
    const ms = screen.getAllByTestId('marker')
    expect(ms).toHaveLength(markers.length)
    expect(ms.filter((m) => m.dataset.kind === 'root')).toHaveLength(markers.filter((m) => m.kind === 'root').length)
    expect(screen.queryAllByText('F♯')).toHaveLength(0)
  })
  it('各マーカーは弦とフレットの属性と、音名・度数の文字を持つ', () => {
    render(<Fretboard markers={markersFor(scale)} />)
    const m = screen.getAllByTestId('marker').find((el) => el.dataset.string === '3' && el.dataset.fret === '8')!
    expect(m).toBeDefined()
    expect(m).toHaveTextContent('C')
    expect(m).toHaveTextContent('1')
  })
  it('弦名 G D A E を左に出す', () => {
    render(<Fretboard markers={[]} />)
    for (const name of ['G', 'D', 'A', 'E']) expect(screen.getByTestId(`string-${name}`)).toHaveTextContent(name)
  })
})
