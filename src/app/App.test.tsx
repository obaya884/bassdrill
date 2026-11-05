import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { formatNote } from '../domain/pitch'
import { dayNumber, keyForDay } from '../domain/dailyKey'
import { App } from './App'

const NOW = new Date('2026-11-05T09:00:00+09:00')

describe('App', () => {
  beforeEach(() => localStorage.clear())

  it('J/K で節が移り、現在地が更新される', async () => {
    render(<App now={NOW} />)
    expect(screen.getByText('節 1 / 7 キー')).toBeInTheDocument()
    await userEvent.keyboard('j')
    expect(screen.getByText('節 2 / 7 メジャースケール')).toBeInTheDocument()
    await userEvent.keyboard('k')
    expect(screen.getByText('節 1 / 7 キー')).toBeInTheDocument()
    await userEvent.keyboard('k')
    expect(screen.getByText('節 1 / 7 キー')).toBeInTheDocument() // 先頭で止まる
  })
  it('今日のキーが表示される', () => {
    render(<App now={NOW} />)
    expect(screen.getByTestId('current-key').textContent).toBe(formatNote(keyForDay(dayNumber(NOW))))
    expect(screen.getByText('1 / 12')).toBeInTheDocument()
  })
  it('N で次のキーに進み k/12 が増える。12 回で元に戻る', async () => {
    render(<App now={NOW} />)
    const first = screen.getByTestId('current-key').textContent
    await userEvent.keyboard('n')
    expect(screen.getByText('2 / 12')).toBeInTheDocument()
    expect(screen.getByTestId('current-key').textContent).toBe(formatNote(keyForDay(dayNumber(NOW), 1)))
    for (let i = 0; i < 11; i++) await userEvent.keyboard('n')
    expect(screen.getByTestId('current-key').textContent).toBe(first)
    expect(screen.getByText('1 / 12')).toBeInTheDocument()
  })
  it('5 度圏のクリックでキーが変わり、N で手の選択は解除される', async () => {
    render(<App now={NOW} />)
    await userEvent.click(screen.getByRole('button', { name: 'E♭' }))
    expect(screen.getByTestId('current-key').textContent).toBe('E♭')
    expect(screen.getByText('手で選んだキー')).toBeInTheDocument()
    await userEvent.keyboard('n')
    expect(screen.getByTestId('current-key').textContent).toBe(formatNote(keyForDay(dayNumber(NOW), 1)))
    expect(screen.getByText('今日のキー')).toBeInTheDocument()
  })
  it('状態は localStorage に残り、開き直しても続きから', async () => {
    const { unmount } = render(<App now={NOW} />)
    await userEvent.keyboard('nn')
    unmount()
    render(<App now={NOW} />)
    expect(screen.getByText('3 / 12')).toBeInTheDocument()
  })
  it('Space はページをスクロールさせない（preventDefault）', () => {
    render(<App now={NOW} />)
    const ev = new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true })
    window.dispatchEvent(ev)
    expect(ev.defaultPrevented).toBe(true)
  })
  it('? でヘルプが開き、Esc で閉じる', async () => {
    render(<App now={NOW} />)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    await userEvent.keyboard('?')
    expect(screen.getByRole('dialog', { name: 'キー操作' })).toBeInTheDocument()
    await userEvent.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})
