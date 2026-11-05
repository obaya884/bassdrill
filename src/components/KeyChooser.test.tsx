import { describe, it, expect, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { note } from '../domain/pitch'
import { KeyChooser } from './KeyChooser'

describe('KeyChooser', () => {
  it('12 キーを 5 度圏の円に並べ、今のキーに data-current、中央に今のキー名、下に「次のキー」', async () => {
    const onSelect = vi.fn(), onNext = vi.fn()
    render(<KeyChooser current={note('C')} today={note('C')} onSelect={onSelect} onNext={onNext} />)
    expect(screen.getByRole('heading', { name: 'キーを選ぶ' })).toBeInTheDocument()
    const circle = screen.getByRole('group', { name: '5 度圏' })
    const keys = within(circle).getAllByRole('button')
    expect(keys.map((b) => b.textContent)).toEqual(['C', 'G', 'D', 'A', 'E', 'B', 'G♭', 'D♭', 'A♭', 'E♭', 'B♭', 'F'])
    expect(within(circle).getByRole('button', { name: 'C' })).toHaveAttribute('data-current', 'true')
    expect(within(circle).getByRole('button', { name: 'G' })).not.toHaveAttribute('data-current')
    expect(within(circle).getByTestId('circle-center')).toHaveTextContent('C')
    // C は 12 時、G は 1 時の位置（左から右へ、上から下へ）
    const pos = (name: string) => within(circle).getByRole('button', { name }).style
    expect(parseFloat(pos('G').left)).toBeGreaterThan(parseFloat(pos('C').left))
    expect(parseFloat(pos('G').top)).toBeGreaterThan(parseFloat(pos('C').top))
    expect(parseFloat(pos('G♭').top)).toBeGreaterThan(parseFloat(pos('C').top) + 200)
    // 隣のボタンと重ならない: 中心間の距離が、大きいほうのボタン（今のキー 56px）と通常（48px）の半径の和より大きい
    const center = (name: string) => {
      const b = within(circle).getByRole('button', { name })
      const w = parseFloat(b.style.width)
      return [parseFloat(b.style.left) + w / 2, parseFloat(b.style.top) + w / 2]
    }
    const [cx, cy] = center('C'), [gx, gy] = center('G')
    expect(Math.hypot(gx - cx, gy - cy)).toBeGreaterThan(56 / 2 + 48 / 2 + 4)
    await userEvent.click(within(circle).getByRole('button', { name: 'E♭' }))
    expect(onSelect).toHaveBeenCalledWith(note('E', -1))
    await userEvent.click(screen.getByRole('button', { name: '次のキー' }))
    expect(onNext).toHaveBeenCalledTimes(1)
  })
  it('今日のキーは pick!! の札（data-today）、今のキーは accent の塗りと 56px（data-current）で示す', () => {
    render(<KeyChooser current={note('G')} today={note('C')} onSelect={vi.fn()} onNext={vi.fn()} />)
    const circle = screen.getByRole('group', { name: '5 度圏' })
    const c = within(circle).getByRole('button', { name: 'C' })
    const g = within(circle).getByRole('button', { name: 'G' })
    expect(c).toHaveAttribute('data-today', 'true')
    expect(c).not.toHaveAttribute('data-current')
    expect(c.className).not.toMatch(/bg-accent/)
    expect(c.style.width).toBe('48px')
    expect(g).toHaveAttribute('data-current', 'true')
    expect(g).not.toHaveAttribute('data-today')
    expect(g.className).toMatch(/bg-accent/)
    expect(g.style.width).toBe('56px')
    expect(within(circle).getByTestId('circle-center')).toHaveTextContent('G')
    expect(within(circle).getByRole('button', { name: 'D' })).not.toHaveAttribute('data-today')
    // 札は 1 つだけ。C（12 時）のボタンの内縁に 2px 重なる位置（ボタン中心から 24 − 2 = 22px 内側）に中心が来る
    const caption = within(circle).getByTestId('pick-caption')
    expect(caption).toHaveTextContent('pick!!')
    expect(within(circle).getAllByTestId('pick-caption')).toHaveLength(1)
    const cx = parseFloat(c.style.left) + parseFloat(c.style.width) / 2
    const cy = parseFloat(c.style.top) + parseFloat(c.style.width) / 2
    expect(Math.abs(parseFloat(caption.style.left) - cx)).toBeLessThan(0.5)
    expect(parseFloat(caption.style.top)).toBeCloseTo(cy + 22, 0)
    expect(caption.className).toMatch(/rounded-full/)
  })
})
