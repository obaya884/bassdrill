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

describe('Fretboard: 色以外の手がかり（N-05）', () => {
  it('外れ音のマーカーは破線の縁を持ち、根音は実線の縁を持つ', () => {
    render(<Fretboard markers={markersFor([
      { note: note('F', 1), label: '3', kind: 'outside' },
      { note: note('D'), label: '1', kind: 'root' },
      { note: note('A'), label: '5', kind: 'tone' },
    ])} />)
    const circle = (kind: string) => screen.getAllByTestId('marker').find((m) => m.dataset.kind === kind)!.querySelector('circle')!
    expect(circle('outside').getAttribute('stroke-dasharray')).toBeTruthy()
    expect(circle('root').getAttribute('stroke-dasharray')).toBeNull()
    expect(Number(circle('root').getAttribute('stroke-width'))).toBeGreaterThan(0)
    expect(Number(circle('tone').getAttribute('stroke-width') ?? 0)).toBe(0)
  })
})
