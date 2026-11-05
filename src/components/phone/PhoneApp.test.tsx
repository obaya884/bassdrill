import { describe, it, expect, beforeEach } from 'vitest'
import { StrictMode } from 'react'
import { render, screen, fireEvent, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { App } from '../../app/App'
import { formatNote } from '../../domain/pitch'
import { dayNumber, keyForDay } from '../../domain/dailyKey'
import { focused } from '../../test/focused'
import { setViewport } from '../../test/viewport'

const NOW = new Date('2026-11-05T09:00:00+09:00')
const next = () => userEvent.click(screen.getByRole('button', { name: '次の節' }))
const currentTitle = () => focused().getByRole('heading', { level: 2 }).textContent

describe('PhoneApp: 骨組み（F-601・F-602）', () => {
  beforeEach(() => {
    localStorage.clear()
    setViewport(390)
  })

  it('幅 390 では 6 節のページ送りで、最初の節はメジャースケール。下部バーと現在地と k/12 は無い', () => {
    render(<App now={NOW} />)
    expect(screen.getByTestId('page-strip')).toBeInTheDocument()
    expect(currentTitle()).toBe('メジャースケール')
    expect(screen.getAllByRole('heading', { level: 2 })).toHaveLength(6)
    expect(screen.queryByText(/節 \d/)).not.toBeInTheDocument()
    expect(screen.queryByText(/\/ 12/)).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '次のキー' })).not.toBeInTheDocument()
    expect(screen.getByText('今日のキー')).toBeInTheDocument()
  })
  it('› ‹ で節が移り、端で止まる', async () => {
    render(<App now={NOW} />)
    await next()
    expect(currentTitle()).toBe('ペンタトニック')
    await userEvent.click(screen.getByRole('button', { name: '前の節' }))
    expect(currentTitle()).toBe('メジャースケール')
    expect(screen.getByRole('button', { name: '前の節' })).toBeDisabled()
    for (let i = 0; i < 8; i++) await next()
    expect(currentTitle()).toBe('ノンダイアトニック')
    expect(screen.getByRole('button', { name: '次の節' })).toBeDisabled()
  })
})

describe('PhoneApp: キー選択シート（F-104・F-604）', () => {
  beforeEach(() => {
    localStorage.clear()
    setViewport(390)
  })

  it('ヘッダーのキーでシートが開き、E♭ を選ぶと閉じて手で選んだキーになり、節は動かない', async () => {
    render(<App now={NOW} />)
    await next()
    await userEvent.click(screen.getByTestId('current-key'))
    const sheet = screen.getByRole('dialog', { name: 'キーを選ぶ' })
    expect(within(sheet).getByRole('group', { name: '5 度圏' })).toBeInTheDocument()
    expect(within(sheet).getByRole('button', { name: formatNote(keyForDay(dayNumber(NOW))) })).toHaveAttribute('data-current', 'true')
    await userEvent.click(within(sheet).getByRole('button', { name: 'E♭' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.getByTestId('current-key')).toHaveTextContent('E♭')
    expect(screen.getByText('手で選んだキー')).toBeInTheDocument()
    expect(currentTitle()).toBe('ペンタトニック')
  })
  it('シートの「次のキー」で進み、節は動かない', async () => {
    render(<App now={NOW} />)
    await next(); await next()
    await userEvent.click(screen.getByTestId('current-key'))
    await userEvent.click(screen.getByRole('button', { name: '次のキー' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.getByTestId('current-key')).toHaveTextContent(formatNote(keyForDay(dayNumber(NOW), 1)))
    expect(currentTitle()).toBe('7th コード（四和音）')
  })
  it('シートの外をタップすると閉じる', async () => {
    render(<App now={NOW} />)
    await userEvent.click(screen.getByTestId('current-key'))
    await userEvent.click(screen.getByTestId('sheet-backdrop'))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
  it('シートが開いている間は帯のスワイプが効かない', async () => {
    render(<App now={NOW} />)
    await userEvent.click(screen.getByTestId('current-key'))
    const strip = screen.getByTestId('page-strip')
    fireEvent.pointerDown(strip, { clientX: 300, clientY: 300, pointerId: 1 })
    fireEvent.pointerUp(strip, { clientX: 100, clientY: 300, pointerId: 1 })
    expect(currentTitle()).toBe('メジャースケール')
  })
})

describe('PhoneApp: 節の中身（F-602・F-603・F-403・F-304）', () => {
  beforeEach(() => {
    localStorage.clear()
    setViewport(390)
  })
  const tap = (el: Element, x = 100, y = 100) => {
    fireEvent.pointerDown(el, { clientX: x, clientY: y, pointerId: 1 })
    fireEvent.pointerUp(el, { clientX: x + 2, clientY: y + 1, pointerId: 1 })
  }

  it('度数カードの 答え → 次 ボタンで進む（StrictMode でも 1 段）。カードのタップでは進まない', async () => {
    render(<StrictMode><App now={NOW} /></StrictMode>)
    for (let i = 0; i < 3; i++) await next()
    expect(currentTitle()).toBe('度数')
    tap(focused().getByTestId('quiz-card'))
    expect(screen.queryByTestId('quiz-answer')).not.toBeInTheDocument()
    await userEvent.click(focused().getByRole('button', { name: '答え' }))
    expect(focused().getByTestId('quiz-answer')).toBeInTheDocument()
    await userEvent.click(focused().getByRole('button', { name: '次' }))
    expect(screen.queryByTestId('quiz-answer')).not.toBeInTheDocument()
  })
  it('コード表の行タップで選べ、ペンタのボタンで切り替わる', async () => {
    render(<App now={NOW} />)
    await next()
    await userEvent.click(focused().getByRole('button', { name: 'メジャー / マイナー' }))
    expect(focused().getByRole('heading', { name: /マイナーペンタ$/ })).toBeInTheDocument()
    await next()
    await userEvent.click(focused().getByText('Im7♭5'))
    expect(focused().getByRole('row', { selected: true })).toHaveTextContent('Im7♭5')
  })
  it('帯の上で左にスワイプすると次の節へ、右で前の節へ', () => {
    render(<App now={NOW} />)
    const strip = screen.getByTestId('page-strip')
    fireEvent.pointerDown(strip, { clientX: 300, clientY: 300, pointerId: 1 })
    fireEvent.pointerMove(strip, { clientX: 200, clientY: 305, pointerId: 1 })
    fireEvent.pointerUp(strip, { clientX: 200, clientY: 305, pointerId: 1 })
    expect(currentTitle()).toBe('ペンタトニック')
    fireEvent.pointerDown(strip, { clientX: 100, clientY: 300, pointerId: 1 })
    fireEvent.pointerUp(strip, { clientX: 200, clientY: 300, pointerId: 1 })
    expect(currentTitle()).toBe('メジャースケール')
  })
  it('指板の箱の中で始めた横の動きでは節が移らない', () => {
    render(<App now={NOW} />)
    const box = focused().getByTestId('fretboard-scroll')
    fireEvent.pointerDown(box, { clientX: 300, clientY: 300, pointerId: 1 })
    fireEvent.pointerUp(box, { clientX: 100, clientY: 300, pointerId: 1 })
    expect(currentTitle()).toBe('メジャースケール')
  })
  it('各節に touch-action: pan-y が付き、節を移ると縦スクロールと指板の横スクロールが先頭に戻る', async () => {
    render(<App now={NOW} />)
    const sec = document.querySelector('section[data-focused="true"]') as HTMLElement
    expect(sec.style.touchAction).toBe('pan-y')
    const box = sec.querySelector('[data-fretboard-scroll]') as HTMLElement
    sec.scrollTop = 120
    box.scrollLeft = 300
    await next()
    await userEvent.click(screen.getByRole('button', { name: '前の節' }))
    expect(sec.scrollTop).toBe(0)
    expect(box.scrollLeft).toBe(0)
  })
})
