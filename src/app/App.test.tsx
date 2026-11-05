import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { formatNote } from '../domain/pitch'
import { dayNumber, keyForDay } from '../domain/dailyKey'
import { App } from './App'

const NOW = new Date('2026-11-05T09:00:00+09:00')
/** フォーカス中の節（コード表は 3 節が同時に描かれるので絞る） */
const focused = () => within(document.querySelector('section[data-focused="true"]') as HTMLElement)

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

describe('App: コードとペンタの節', () => {
  beforeEach(() => localStorage.clear())

  it('節 4 で → ← がコードを送り、端で止まる', async () => {
    render(<App now={NOW} />)
    await userEvent.keyboard('jjj') // 節 4
    expect(screen.getByText('節 4 / 7 セブンスコード')).toBeInTheDocument()
    await userEvent.keyboard('{ArrowLeft}')
    expect(focused().getByRole('row', { selected: true })).toHaveTextContent('M7')
    await userEvent.keyboard('{ArrowRight}{ArrowRight}{ArrowRight}{ArrowRight}')
    expect(focused().getByRole('row', { selected: true })).toHaveTextContent('m7♭5')
  })
  it('節 1 では → を押しても何も起きない', async () => {
    render(<App now={NOW} />)
    await userEvent.keyboard('{ArrowRight}')
    expect(screen.getByText('節 1 / 7 キー')).toBeInTheDocument()
  })
  it('節 3 で M がペンタを切り替える', async () => {
    render(<App now={NOW} />)
    await userEvent.keyboard('jj')
    expect(screen.getByRole('heading', { name: /メジャーペンタ$/ })).toBeInTheDocument()
    await userEvent.keyboard('m')
    expect(screen.getByRole('heading', { name: /マイナーペンタ$/ })).toBeInTheDocument()
  })
  it('キーが変わるとコードの選択は先頭に戻る', async () => {
    render(<App now={NOW} />)
    await userEvent.keyboard('jjj{ArrowRight}{ArrowRight}')
    expect(focused().getByRole('row', { selected: true })).toHaveTextContent('I7')
    await userEvent.keyboard('n')
    await userEvent.keyboard('jjj')
    expect(focused().getByRole('row', { selected: true })).toHaveTextContent('IM7')
  })
})
