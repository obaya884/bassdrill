import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { StrictMode } from 'react'
import { render, screen, within, act } from '@testing-library/react'
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

describe('App: 度数の節', () => {
  beforeEach(() => localStorage.clear())

  it('節 5 で Space が答えを出し、節 1 では何も起きない', async () => {
    render(<App now={NOW} />)
    await userEvent.keyboard(' ')
    expect(screen.queryByTestId('quiz-answer')).not.toBeInTheDocument()
    await userEvent.keyboard('jjjj') // 節 5
    expect(screen.getByText('節 5 / 7 度数')).toBeInTheDocument()
    expect(screen.getByTestId('quiz-question')).toHaveTextContent(/から見/)
    await userEvent.keyboard(' ')
    expect(screen.getByTestId('quiz-answer')).toBeInTheDocument()
    await userEvent.keyboard(' ')
    expect(screen.queryByTestId('quiz-answer')).not.toBeInTheDocument()
  })
  it('A で自動送りが切り替わり、+/- で間隔が 2〜15 に収まる', async () => {
    render(<App now={NOW} />)
    await userEvent.keyboard('jjjj')
    expect(screen.getByText('自動送り: オフ')).toBeInTheDocument()
    await userEvent.keyboard('a')
    expect(screen.getByText('自動送り: オン 5 秒')).toBeInTheDocument()
    for (let i = 0; i < 20; i++) await userEvent.keyboard('-')
    expect(screen.getByText('自動送り: オン 2 秒')).toBeInTheDocument()
    for (let i = 0; i < 20; i++) await userEvent.keyboard('=')
    expect(screen.getByText('自動送り: オン 15 秒')).toBeInTheDocument()
    await userEvent.keyboard('a')
    expect(screen.getByText('自動送り: オフ')).toBeInTheDocument()
  })
})

describe('App: StrictMode', () => {
  beforeEach(() => localStorage.clear())

  it('StrictMode でも → は 1 つだけ進み、Space は 1 段だけ進む', async () => {
    render(<StrictMode><App now={NOW} /></StrictMode>)
    await userEvent.keyboard('jjj{ArrowRight}')
    expect(focused().getByRole('row', { selected: true })).toHaveTextContent('Im7')
    await userEvent.keyboard('j') // 節 5
    await userEvent.keyboard(' ')
    expect(screen.getByTestId('quiz-answer')).toBeInTheDocument()
  })
})

describe('App: 開いたまま日付をまたぐ', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.useFakeTimers()
  })
  afterEach(() => vi.useRealTimers())

  it('0:00 を過ぎると今日のキーが切り替わり、位置と手の選択が戻る', () => {
    vi.setSystemTime(new Date('2026-11-05T23:59:30+09:00'))
    render(<App now={new Date()} />)
    expect(screen.getByTestId('current-key').textContent).toBe(formatNote(keyForDay(20762)))
    act(() => {
      vi.advanceTimersByTime(60_000)
    })
    expect(screen.getByTestId('current-key').textContent).toBe(formatNote(keyForDay(20763)))
    expect(screen.getByText('1 / 12')).toBeInTheDocument()
    expect(screen.getByText('今日のキー')).toBeInTheDocument()
  })
})
