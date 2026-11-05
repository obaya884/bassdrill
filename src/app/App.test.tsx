import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { StrictMode } from 'react'
import { render, screen, within, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { formatNote } from '../domain/pitch'
import { dayNumber, keyForDay } from '../domain/dailyKey'
import { nextOnCircle } from '../domain/scale'
import { App } from './App'
import { setReducedMotion, setViewport } from '../test/viewport'

const NOW = new Date('2026-11-05T09:00:00+09:00')
const section = (id: string) => within(document.querySelector(`#section-${id}`) as HTMLElement)
const openChooser = () => userEvent.click(screen.getByTestId('current-key'))

describe('App（PC 表示）', () => {
  beforeEach(() => setViewport(1280))

  it('6 節が番号なしで縦に並び、ショートカット行・ヘルプ・現在地・k/12 が無い', () => {
    render(<App now={NOW} />)
    expect(screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent)).toEqual([
      'メジャースケール', 'ペンタトニック', '7th コード（四和音）', '度数', 'ダイアトニック', 'ノンダイアトニック',
    ])
    expect(screen.queryByText(/J\/K/)).not.toBeInTheDocument()
    expect(screen.queryByText(/節 \d/)).not.toBeInTheDocument()
    expect(screen.queryByText(/\/ 12/)).not.toBeInTheDocument()
    expect(document.querySelector('[data-focused]')).toBeNull()
  })
  it('今日のキーがヘッダーに出て、補助文言も 5 度圏の図もヘッダーには無い', () => {
    render(<App now={NOW} />)
    expect(screen.getByRole('banner')).toHaveTextContent('Bass Drill')
    expect(screen.getByTestId('current-key')).toHaveTextContent(formatNote(keyForDay(dayNumber(NOW))))
    expect(screen.queryByText('今日のキー')).not.toBeInTheDocument()
    expect(screen.queryByRole('group', { name: '5 度圏' })).not.toBeInTheDocument()
  })
  it('ヘッダーのキーでポップオーバーが開き、E♭ を選ぶと閉じる。円では今日のキーが色、E♭ が今のキー', async () => {
    render(<App now={NOW} />)
    await openChooser()
    const pop = screen.getByRole('dialog', { name: 'キーを選ぶ' })
    await userEvent.click(within(pop).getByRole('button', { name: 'E♭' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.getByTestId('current-key')).toHaveTextContent('E♭')
    expect(screen.queryByText('手で選んだキー')).not.toBeInTheDocument()
    await openChooser()
    const circle = within(screen.getByRole('dialog', { name: 'キーを選ぶ' })).getByRole('group', { name: '5 度圏' })
    expect(within(circle).getByRole('button', { name: formatNote(keyForDay(dayNumber(NOW))) })).toHaveAttribute('data-today', 'true')
    expect(within(circle).getByRole('button', { name: 'E♭' })).toHaveAttribute('data-current', 'true')
    expect(within(circle).getByRole('button', { name: 'E♭' })).not.toHaveAttribute('data-today')
  })
  it('ポップオーバーの外をクリックすると閉じる', async () => {
    render(<App now={NOW} />)
    await openChooser()
    await userEvent.click(screen.getByTestId('popover-backdrop'))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
  it('ポップオーバーの「次のキー」で 5 度上に進み、節の要素は作り直されない', async () => {
    render(<App now={NOW} />)
    const before = document.querySelector('#section-quiz')
    await openChooser()
    await userEvent.click(screen.getByRole('button', { name: '次のキー' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.getByTestId('current-key')).toHaveTextContent(formatNote(nextOnCircle(keyForDay(dayNumber(NOW)))))
    expect(document.querySelector('#section-quiz')).toBe(before)
    expect(localStorage.length).toBe(0)
  })
  it('ポップオーバーの中は 5 度圏の円で、PC でもそこから選ぶ', async () => {
    render(<App now={NOW} />)
    await openChooser()
    const circle = within(screen.getByRole('dialog', { name: 'キーを選ぶ' })).getByRole('group', { name: '5 度圏' })
    await userEvent.click(within(circle).getByRole('button', { name: 'A' }))
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
  it('開き直すと今日のキーに戻り、ブラウザに何も残らない', async () => {
    const { unmount } = render(<App now={NOW} />)
    await openChooser()
    await userEvent.click(screen.getByRole('button', { name: '次のキー' }))
    await openChooser()
    await userEvent.click(screen.getByRole('button', { name: '次のキー' }))
    await openChooser()
    await userEvent.click(screen.getByRole('button', { name: 'A' }))
    expect(screen.getByTestId('current-key')).toHaveTextContent('A')
    unmount()
    expect(localStorage.length).toBe(0)
    render(<App now={NOW} />)
    expect(screen.getByTestId('current-key')).toHaveTextContent(formatNote(keyForDay(dayNumber(NOW))))
  })
})

describe('App: 開いた瞬間のルーレット（F-103）', () => {
  beforeEach(() => {
    setViewport(1280)
    setReducedMotion(false)
    vi.useFakeTimers()
  })
  afterEach(() => vi.useRealTimers())

  it('ヘッダーの文字だけが回り、約 0.8 秒で今日のキーに止まる。本体は最初から今日のキー', () => {
    render(<App now={NOW} />)
    const today = formatNote(keyForDay(dayNumber(NOW)))
    const header = screen.getByTestId('current-key')
    expect(header).toHaveAttribute('aria-label', `キー ${today} を変える`)
    expect(section('penta').getByText(`${today} メジャーペンタ`)).toBeInTheDocument()
    const seen = new Set<string>()
    for (let i = 0; i < 15; i++) {
      seen.add(header.textContent!.replace(' ▾', '').trim())
      act(() => { vi.advanceTimersByTime(50) })
    }
    expect(seen.size).toBeGreaterThan(3)
    act(() => { vi.advanceTimersByTime(1000) })
    expect(header).toHaveTextContent(today)
  })
})

describe('App: 開いたまま日付をまたぐ', () => {
  beforeEach(() => {
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
  })
})

describe('App: 表示モードの切り替え（F-606）', () => {
  beforeEach(() => setViewport(1280))

  it('幅が変わると木が切り替わり、出題とコード選択とキーを引き継ぐ', async () => {
    render(<App now={NOW} />)
    await userEvent.click(section('seventh').getByText(/^C7$/))
    await userEvent.click(section('quiz').getByRole('button', { name: '答え' }))
    const q = section('quiz').getByTestId('quiz-question').textContent
    act(() => setViewport(390))
    expect(screen.getByTestId('page-strip')).toBeInTheDocument()
    act(() => setViewport(1280))
    expect(screen.queryByTestId('page-strip')).not.toBeInTheDocument()
    expect(section('quiz').getByTestId('quiz-question').textContent).toBe(q)
    expect(section('quiz').getByTestId('quiz-answer')).toBeInTheDocument()
    expect(section('seventh').getByRole('row', { selected: true })).toHaveTextContent('I7')
  })
})
