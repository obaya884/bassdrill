import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { StrictMode } from 'react'
import { render, screen, within, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { formatNote } from '../domain/pitch'
import { dayNumber, keyForDay } from '../domain/dailyKey'
import { App } from './App'
import { setViewport } from '../test/viewport'
import { STORAGE_KEY } from './storage'

const NOW = new Date('2026-11-05T09:00:00+09:00')
const section = (id: string) => within(document.querySelector(`#section-${id}`) as HTMLElement)
const openChooser = () => userEvent.click(screen.getByTestId('current-key'))

describe('App（PC 表示）', () => {
  beforeEach(() => {
    localStorage.clear()
    setViewport(1280)
  })

  it('6 節が番号なしで縦に並び、ショートカット行・ヘルプ・現在地・k/12 が無い', () => {
    render(<App now={NOW} />)
    expect(screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent)).toEqual([
      'メジャースケール', 'ペンタトニック', 'セブンスコード', '度数', 'ダイアトニック', 'ノンダイアトニック',
    ])
    expect(screen.queryByText(/J\/K/)).not.toBeInTheDocument()
    expect(screen.queryByText(/節 \d/)).not.toBeInTheDocument()
    expect(screen.queryByText(/\/ 12/)).not.toBeInTheDocument()
    expect(document.querySelector('[data-focused]')).toBeNull()
  })
  it('今日のキーがヘッダーに出て、5 度圏がある', () => {
    render(<App now={NOW} />)
    expect(screen.getByTestId('current-key')).toHaveTextContent(formatNote(keyForDay(dayNumber(NOW))))
    expect(screen.getByText('今日のキー')).toBeInTheDocument()
    expect(screen.getByLabelText('5 度圏')).toBeInTheDocument()
  })
  it('ヘッダーのキーでポップオーバーが開き、E♭ を選ぶと閉じて手で選んだキーになる', async () => {
    render(<App now={NOW} />)
    await openChooser()
    const pop = screen.getByRole('dialog', { name: 'キーを選ぶ' })
    await userEvent.click(within(pop).getByRole('button', { name: 'E♭' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.getByTestId('current-key')).toHaveTextContent('E♭')
    expect(screen.getByText('手で選んだキー')).toBeInTheDocument()
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!).manualKey).toBe('E♭')
  })
  it('ポップオーバーの外をクリックすると閉じる', async () => {
    render(<App now={NOW} />)
    await openChooser()
    await userEvent.click(screen.getByTestId('popover-backdrop'))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
  it('ポップオーバーの「次のキー」で明日のキーに進み、節の要素は作り直されない', async () => {
    render(<App now={NOW} />)
    const before = document.querySelector('#section-quiz')
    await openChooser()
    await userEvent.click(screen.getByRole('button', { name: '次のキー' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.getByTestId('current-key')).toHaveTextContent(formatNote(keyForDay(dayNumber(NOW), 1)))
    expect(document.querySelector('#section-quiz')).toBe(before)
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!).keyOffset).toBe(1)
  })
  it('5 度圏のクリックでも選べる', async () => {
    render(<App now={NOW} />)
    await userEvent.click(within(screen.getByLabelText('5 度圏')).getByRole('button', { name: 'A' }))
    expect(screen.getByTestId('current-key')).toHaveTextContent('A')
  })
  it('コード表の行クリックで選び、キーが変わると先頭に戻る', async () => {
    render(<App now={NOW} />)
    await userEvent.click(section('seventh').getByText('Im7♭5'))
    expect(section('seventh').getByRole('row', { selected: true })).toHaveTextContent('Im7♭5')
    await openChooser()
    await userEvent.click(screen.getByRole('button', { name: '次のキー' }))
    expect(section('seventh').getByRole('row', { selected: true })).toHaveTextContent('IM7')
  })
  it('度数カードの 答え → 次 で進み、問題文のクリックでは進まない（StrictMode）', async () => {
    render(<StrictMode><App now={NOW} /></StrictMode>)
    const q = section('quiz')
    await userEvent.click(q.getByTestId('quiz-question'))
    expect(q.queryByTestId('quiz-answer')).not.toBeInTheDocument()
    await userEvent.click(q.getByRole('button', { name: '答え' }))
    expect(q.getByTestId('quiz-answer')).toBeInTheDocument()
    await userEvent.click(q.getByRole('button', { name: '次' }))
    expect(q.queryByTestId('quiz-answer')).not.toBeInTheDocument()
  })
  it('ペンタのボタンで切り替わる', async () => {
    render(<App now={NOW} />)
    await userEvent.click(section('penta').getByRole('button', { name: 'メジャー / マイナー' }))
    expect(section('penta').getByRole('heading', { name: /マイナーペンタ$/ })).toBeInTheDocument()
  })
  it('Space を押してもページの既定動作を止めない', () => {
    render(<App now={NOW} />)
    const ev = new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true })
    window.dispatchEvent(ev)
    expect(ev.defaultPrevented).toBe(false)
  })
  it('状態は localStorage に残り、開き直しても続きから', async () => {
    const { unmount } = render(<App now={NOW} />)
    await openChooser()
    await userEvent.click(screen.getByRole('button', { name: '次のキー' }))
    await openChooser()
    await userEvent.click(screen.getByRole('button', { name: '次のキー' }))
    unmount()
    render(<App now={NOW} />)
    expect(screen.getByTestId('current-key')).toHaveTextContent(formatNote(keyForDay(dayNumber(NOW), 2)))
  })
})

describe('App: 開いたまま日付をまたぐ', () => {
  beforeEach(() => {
    localStorage.clear()
    setViewport(1280)
    vi.useFakeTimers()
  })
  afterEach(() => vi.useRealTimers())

  it('0:00 を過ぎると今日のキーに切り替わり、位置と手の選択が戻る', () => {
    vi.setSystemTime(new Date('2026-11-05T23:59:30+09:00'))
    render(<App now={new Date()} />)
    expect(screen.getByTestId('current-key')).toHaveTextContent(formatNote(keyForDay(20762)))
    act(() => {
      vi.advanceTimersByTime(60_000)
    })
    expect(screen.getByTestId('current-key')).toHaveTextContent(formatNote(keyForDay(20763)))
    expect(screen.getByText('今日のキー')).toBeInTheDocument()
  })
})

describe('App: 表示モードの切り替え（F-606）', () => {
  beforeEach(() => {
    localStorage.clear()
    setViewport(1280)
  })

  it('幅が変わると木が切り替わり、出題とコード選択とキーを引き継ぐ', async () => {
    render(<App now={NOW} />)
    await userEvent.click(section('seventh').getByText(/^C7$/))
    await userEvent.click(section('quiz').getByRole('button', { name: '答え' }))
    const q = section('quiz').getByTestId('quiz-question').textContent
    act(() => setViewport(390))
    expect(screen.getByTestId('page-strip')).toBeInTheDocument()
    expect(screen.queryByLabelText('5 度圏')).not.toBeInTheDocument()
    act(() => setViewport(1280))
    expect(screen.queryByTestId('page-strip')).not.toBeInTheDocument()
    expect(section('quiz').getByTestId('quiz-question').textContent).toBe(q)
    expect(section('quiz').getByTestId('quiz-answer')).toBeInTheDocument()
    expect(section('seventh').getByRole('row', { selected: true })).toHaveTextContent('I7')
  })
})
