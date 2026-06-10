import { useState } from 'react'
import { useStore } from '../context/store'
import { money, currentMonthKey, monthLabel, recentMonths, shortMonthLabel } from '../lib/util'
import { portfolioSummary } from '../lib/selectors'
import { PaymentControl } from '../components/PaymentControl'
import { StatusPill } from '../components/bits'

export default function Payments() {
  const store = useStore()
  const months = recentMonths(12)
  const [month, setMonth] = useState(currentMonthKey())
  const summary = portfolioSummary(store, month)
  const pct = summary.expectedRent > 0 ? Math.round((summary.collected / summary.expectedRent) * 100) : 0

  return (
    <div className="screen">
      <div className="page-title">
        <h1>Payments</h1>
      </div>

      <div className="filter-row">
        {months.map((m) => (
          <button key={m} className={`chip ${month === m ? 'active' : ''}`} onClick={() => setMonth(m)}>
            {shortMonthLabel(m)}
          </button>
        ))}
      </div>

      <div className="metric wide" style={{ marginBottom: 16 }}>
        <div className="label">Collected · {monthLabel(month)}</div>
        <div className="value">
          {money(summary.collected)} <span style={{ color: 'var(--text-3)', fontWeight: 700, fontSize: 16 }}>/ {money(summary.expectedRent)}</span>
        </div>
        <div className="bar"><span style={{ width: `${pct}%` }} /></div>
        <div className="sub">{money(summary.remaining)} remaining · {pct}% collected</div>
      </div>

      {store.properties.map((p) => (
        <div key={p.id}>
          <div className="section-label">{p.address}</div>
          <div className="stack">
            {p.units.map((u) => {
              const pay = store.getPayment(u.id, month)
              return (
                <div className="card" key={u.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <div>
                      <div style={{ fontWeight: 700 }}>{u.unitName}</div>
                      <div style={{ fontSize: 13, color: 'var(--text-2)' }}>
                        {u.tenants[0]?.name ?? 'No tenant'} · {u.rent != null ? `${money(u.rent)}` : 'Rent missing'}
                      </div>
                    </div>
                    <StatusPill status={pay?.status ?? 'pending'} />
                  </div>
                  <PaymentControl unitId={u.id} month={month} rent={u.rent} />
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
