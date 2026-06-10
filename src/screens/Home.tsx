import { useNavigate } from 'react-router-dom'
import { useStore } from '../context/store'
import { greeting, money, currentMonthKey, monthLabel } from '../lib/util'
import {
  portfolioSummary,
  smartSummary,
  buildAlerts,
  propertyRentStatus,
} from '../lib/selectors'
import { StatusPill, TonePill } from '../components/bits'
import { IconWrench, IconCalendar, IconChevron, IconBell } from '../components/Icon'

export default function Home() {
  const store = useStore()
  const nav = useNavigate()
  const month = currentMonthKey()
  const summary = portfolioSummary(store, month)
  const alerts = buildAlerts(store, month)
  const collectedPct = summary.expectedRent > 0 ? Math.round((summary.collected / summary.expectedRent) * 100) : 0

  return (
    <div className="screen">
      <header className="app-header">
        <div className="eyebrow">Gal Properties</div>
        <h1>{greeting()}</h1>
        <p className="subtitle">{smartSummary(store)}</p>
      </header>

      <div className="metric-grid">
        <div className="metric wide">
          <div className="label">Collected · {monthLabel(month)}</div>
          <div className="value">
            {money(summary.collected)} <span style={{ color: 'var(--text-3)', fontWeight: 700, fontSize: 16 }}>/ {money(summary.expectedRent)}</span>
          </div>
          <div className="bar">
            <span style={{ width: `${collectedPct}%` }} />
          </div>
          <div className="sub">{collectedPct}% of expected rent collected</div>
        </div>

        <div className="metric">
          <div className="label">Remaining Balance</div>
          <div className="value sm" style={{ color: summary.remaining > 0 ? 'var(--orange-ink)' : 'var(--green-ink)' }}>
            {money(summary.remaining)}
          </div>
          <div className="sub">{summary.unitsNeedingAttention} need attention</div>
        </div>
        <div className="metric">
          <div className="label">Expected Rent</div>
          <div className="value sm">{money(summary.expectedRent)}</div>
          <div className="sub">{summary.totalUnits} units</div>
        </div>
        <div className="metric" onClick={() => nav('/repairs')}>
          <div className="label">Open Repairs</div>
          <div className="value sm">{summary.openRepairs}</div>
          <div className="sub">Tap to view</div>
        </div>
        <div className="metric">
          <div className="label">Lease Ending Soon</div>
          <div className="value sm">{summary.leaseEndingSoon}</div>
          <div className="sub">Within 60 days</div>
        </div>
      </div>

      <div className="section-label" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <IconBell size={15} /> Needs attention
      </div>
      {alerts.length === 0 ? (
        <div className="card" style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <span style={{ fontSize: 26 }}>✨</span>
          <div>
            <div style={{ fontWeight: 700 }}>All calm</div>
            <div style={{ fontSize: 13.5, color: 'var(--text-2)' }}>Nothing needs your attention right now.</div>
          </div>
        </div>
      ) : (
        <div className="card flush">
          <div className="row-list">
            {alerts.slice(0, 6).map((a) => (
              <div className="row" key={a.id} onClick={() => a.propertyId && nav(`/property/${a.propertyId}`)}>
                <div className="ic" style={{ background: tintBg(a.level), color: tintInk(a.level) }}>
                  {a.title.toLowerCase().includes('repair') ? <IconWrench size={18} /> : a.title.toLowerCase().includes('lease') ? <IconCalendar size={18} /> : '•'}
                </div>
                <div className="main">
                  <div className="t">{a.title}</div>
                  <div className="s">{a.detail}</div>
                </div>
                <TonePill tone={a.level}>{a.level === 'red' ? 'Urgent' : a.level === 'orange' ? 'Soon' : 'Info'}</TonePill>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="section-label">Property status</div>
      <div className="stack">
        {store.properties.map((p) => {
          const status = propertyRentStatus(store, p, month)
          const open = store.repairs.filter((r) => r.propertyId === p.id && r.status !== 'completed').length
          return (
            <div className="card" key={p.id} onClick={() => nav(`/property/${p.id}`)} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div className="main" style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 15.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.address}</div>
                <div style={{ fontSize: 13, color: 'var(--text-2)', marginTop: 2 }}>
                  {p.city} · {p.units.length} unit{p.units.length !== 1 ? 's' : ''}
                  {open > 0 ? ` · ${open} repair${open > 1 ? 's' : ''}` : ''}
                </div>
              </div>
              <StatusPill status={status} />
              <span className="chev"><IconChevron size={18} /></span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function tintBg(level: string) {
  return level === 'red' ? 'var(--red-soft)' : level === 'orange' ? 'var(--orange-soft)' : 'var(--blue-soft)'
}
function tintInk(level: string) {
  return level === 'red' ? 'var(--red-ink)' : level === 'orange' ? 'var(--orange-ink)' : 'var(--blue-ink)'
}
