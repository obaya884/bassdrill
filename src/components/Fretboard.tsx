// SVG 指板。マーカーを受けて描くだけでロジックを持たない（画面定義書 13 §4）
import { formatNote } from '../domain/pitch'
import { FRET_COUNT, MARKER_FRETS, STRINGS, type Marker } from '../domain/fretboard'

const VIEW_W = 1040
const VIEW_H = 260
const NAME_COL = 56
const COLS = FRET_COUNT + 1
const COL_W = (VIEW_W - NAME_COL) / COLS
const STRING_Y = [50, 106, 162, 218]
const STRING_WIDTH = [1.5, 2, 2.5, 3]
const RADIUS = 20

const FILL: Record<Marker['kind'], string> = { tone: 'fill-accent', root: 'fill-root', outside: 'fill-outside' }

const colCenter = (fret: number) => NAME_COL + COL_W * fret + COL_W / 2

export function Fretboard({ markers }: { markers: Marker[] }) {
  return (
    <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} className="w-full h-auto select-none" role="img" aria-label="指板">
      {STRINGS.map((s, i) => (
        <g key={s.name}>
          <text data-testid={`string-${s.name}`} x={NAME_COL / 2} y={STRING_Y[i]} dy="0.35em" textAnchor="middle" className="fill-muted" fontSize={13}>
            {s.name}
          </text>
          <line x1={NAME_COL} x2={VIEW_W} y1={STRING_Y[i]} y2={STRING_Y[i]} className="stroke-line" strokeWidth={STRING_WIDTH[i]} />
        </g>
      ))}
      {Array.from({ length: COLS }, (_, fret) => (
        <line key={fret} x1={NAME_COL + COL_W * (fret + 1)} x2={NAME_COL + COL_W * (fret + 1)} y1={STRING_Y[0] - 28} y2={STRING_Y[3] + 28}
          className="stroke-line" strokeWidth={fret === 0 ? 4 : 1} />
      ))}
      {MARKER_FRETS.map((fret) =>
        fret === 12 ? (
          <g key={fret}>
            <circle cx={colCenter(fret)} cy={(STRING_Y[0] + STRING_Y[1]) / 2} r={9} className="fill-line" />
            <circle cx={colCenter(fret)} cy={(STRING_Y[2] + STRING_Y[3]) / 2} r={9} className="fill-line" />
          </g>
        ) : (
          <circle key={fret} cx={colCenter(fret)} cy={VIEW_H / 2} r={9} className="fill-line" />
        ),
      )}
      {markers.map((m) => (
        <g key={`${m.string}-${m.fret}`} data-testid="marker" data-string={m.string} data-fret={m.fret} data-kind={m.kind} data-root={m.isRoot ? 'true' : undefined}>
          {/* 色以外の手がかり（N-05）: 根音は実線の縁、外れ音は破線の縁。根音かつ外れ音は破線＋太い縁 */}
          <circle
            cx={colCenter(m.fret)} cy={STRING_Y[m.string]} r={RADIUS}
            className={`${FILL[m.kind]} ${m.isRoot || m.kind === 'outside' ? 'stroke-ink' : ''}`}
            strokeWidth={m.isRoot ? 3 : m.kind === 'outside' ? 2 : 0}
            strokeDasharray={m.kind === 'outside' ? '6 4' : undefined}
          />
          <text x={colCenter(m.fret)} y={STRING_Y[m.string]} dy="0.35em" textAnchor="middle" className="fill-bg" fontSize={18} fontWeight={700}>
            {formatNote(m.note)}
          </text>
          <text x={colCenter(m.fret)} y={STRING_Y[m.string] + RADIUS + 14} textAnchor="middle" className="fill-muted" fontSize={13}>
            {m.label}
          </text>
        </g>
      ))}
    </svg>
  )
}
