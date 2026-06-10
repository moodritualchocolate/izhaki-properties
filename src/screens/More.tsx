import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../context/store'
import { buildMonthlySummary } from '../lib/selectors'
import { money, currentMonthKey, monthLabel, recentMonths, shortMonthLabel } from '../lib/util'
import { Sheet } from '../components/Sheet'
import { TonePill } from '../components/bits'
import { IconChevron, IconCalendar, IconDoc, IconCheck } from '../components/Icon'

export default function More() {
  const store = useStore()
  const nav = useNavigate()
  const [closing, setClosing] = useState(false)
  const [month, setMonth] = useState(currentMonthKey())

  const propertyCount = store.properties.length
  const unitCount = store.properties.reduce((a, p) => a + p.units.length, 0)
  const tenantCount = store.properties.reduce((a, p) => a + p.units.reduce((b, u) => b + u.tenants.length, 0), 0)

  return (
    <div className="screen">
      <div className="page-title"><h1>More</h1></div>

      <div className="metric-grid" style={{ marginBottom: 16 }}>
        <div className="metric"><div className="label">Properties</div><div className="value sm">{propertyCount}</div></div>
        <div className="metric"><div className="label">Units</div><div className="value sm">{unitCount}</div></div>
        <div className="metric"><div className="label">Tenants</div><div className="value sm">{tenantCount}</div></div>
        <div className="metric"><div className="label">Vendors</div><div className="value sm">{store.vendors.length}</div></div>
      </div>

      <button className="btn primary full" onClick={() => setClosing(true)}>
        <IconCalendar size={18} /> Close month
      </button>

      <div className="section-label">Manage</div>
      <div className="card flush"><div className="row-list">
        <div className="row" onClick={() => nav('/vendors')}>
          <div className="ic">🧰</div>
          <div className="main"><div className="t">Vendors</div><div className="s">{store.vendors.length} saved</div></div>
          <span className="chev"><IconChevron size={18} /></span>
        </div>
        <div className="row" onClick={() => nav('/properties')}>
          <div className="ic">🏠</div>
          <div className="main"><div className="t">Properties</div><div className="s">{propertyCount} in portfolio</div></div>
          <span className="chev"><IconChevron size={18} /></span>
        </div>
        <div className="row" onClick={() => nav('/repairs')}>
          <div className="ic">🛠️</div>
          <div className="main"><div className="t">Repairs</div><div className="s">{store.repairs.filter((r) => r.status !== 'completed').length} open</div></div>
          <span className="chev"><IconChevron size={18} /></span>
        </div>
        <div className="row">
          <div className="ic"><IconDoc size={18} /></div>
          <div className="main"><div className="t">Documents</div><div className="s">{store.documents.length} stored · per property</div></div>
        </div>
      </div></div>

      <div className="section-label">Sync</div>
      <SyncCard />

      <div className="section-label">Data</div>
      <div className="card flush"><div className="row-list">
        <div className="row" onClick={() => {
          const blob = new Blob([JSON.stringify({ properties: store.properties, payments: store.payments, repairs: store.repairs, vendors: store.vendors, documents: store.documents }, null, 2)], { type: 'application/json' })
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url; a.download = `gal-properties-${currentMonthKey()}.json`; a.click()
          URL.revokeObjectURL(url)
        }}>
          <div className="ic">⬇️</div>
          <div className="main"><div className="t">Export data</div><div className="s">Download a JSON backup</div></div>
        </div>
        <div className="row" onClick={() => { if (confirm('Reset all data back to the original seed? Your edits will be lost.')) store.resetAll() }}>
          <div className="ic">♻️</div>
          <div className="main"><div className="t" style={{ color: 'var(--red-ink)' }}>Reset to seed data</div><div className="s">Restore the original portfolio</div></div>
        </div>
      </div></div>

      <div style={{ textAlign: 'center', color: 'var(--text-3)', fontSize: 13, marginTop: 28 }}>
        Gal Properties · The iPhone of our properties<br />Private control center for Gal & Nadav
      </div>

      <MonthlyClosingSheet open={closing} onClose={() => setClosing(false)} month={month} setMonth={setMonth} />
    </div>
  )
}

function MonthlyClosingSheet({ open, onClose, month, setMonth }: { open: boolean; onClose: () => void; month: string; setMonth: (m: string) => void }) {
  const store = useStore()
  const months = recentMonths(12)
  const summary = buildMonthlySummary(store, month)
  const closed = store.closedMonths.includes(month)

  const exportSummary = () => {
    const lines = [
      `Gal Properties — Monthly Summary`,
      monthLabel(month),
      ``,
      `Expected rent:   ${money(summary.expectedRent)}`,
      `Collected:       ${money(summary.collected)}`,
      `Remaining:       ${money(summary.remaining)}`,
      `Expenses:        ${money(summary.expenses)}`,
      `Repair costs:    ${money(summary.repairCosts)}`,
      `Net estimate:    ${money(summary.net)}`,
      ``,
      `Completed repairs: ${summary.completedRepairs}`,
      `Open repairs:      ${summary.openRepairs}`,
      ``,
      `Unpaid units:`,
      ...(summary.unpaidUnits.length ? summary.unpaidUnits.map((u) => `  • ${u.label} — ${money(u.amount)}`) : ['  None 🎉']),
    ].join('\n')
    const blob = new Blob([lines], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `summary-${month}.txt`; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <Sheet open={open} onClose={onClose} title="Monthly closing" subtitle="Review the month, then close it.">
      <div className="filter-row">
        {months.map((m) => (
          <button key={m} className={`chip ${month === m ? 'active' : ''}`} onClick={() => setMonth(m)}>{shortMonthLabel(m)}</button>
        ))}
      </div>

      <div className="card" style={{ marginBottom: 12 }}>
        <div className="kv"><span className="k">Expected rent</span><span className="v">{money(summary.expectedRent)}</span></div>
        <div className="kv"><span className="k">Collected</span><span className="v" style={{ color: 'var(--green-ink)' }}>{money(summary.collected)}</span></div>
        <div className="kv"><span className="k">Remaining unpaid</span><span className="v" style={{ color: summary.remaining > 0 ? 'var(--orange-ink)' : 'inherit' }}>{money(summary.remaining)}</span></div>
        <div className="kv"><span className="k">Expenses</span><span className="v">{money(summary.expenses)}</span></div>
        <div className="kv"><span className="k">Repair costs</span><span className="v">{money(summary.repairCosts)}</span></div>
        <div className="kv"><span className="k" style={{ fontWeight: 800, color: 'var(--text)' }}>Net estimate</span><span className="v" style={{ fontWeight: 800, fontSize: 17, color: summary.net >= 0 ? 'var(--green-ink)' : 'var(--red-ink)' }}>{money(summary.net)}</span></div>
      </div>

      <div className="card" style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', gap: 16 }}>
          <div><div style={{ fontWeight: 800, fontSize: 20 }}>{summary.completedRepairs}</div><div style={{ fontSize: 12, color: 'var(--text-3)' }}>Completed repairs</div></div>
          <div><div style={{ fontWeight: 800, fontSize: 20 }}>{summary.openRepairs}</div><div style={{ fontSize: 12, color: 'var(--text-3)' }}>Open repairs</div></div>
        </div>
      </div>

      {summary.unpaidUnits.length > 0 && (
        <>
          <div className="section-label" style={{ marginTop: 4 }}>Unpaid tenants</div>
          <div className="card flush"><div className="row-list">
            {summary.unpaidUnits.map((u, i) => (
              <div className="row" key={i}>
                <div className="main"><div className="t" style={{ fontSize: 14 }}>{u.label}</div></div>
                <TonePill tone="red">{money(u.amount)}</TonePill>
              </div>
            ))}
          </div></div>
        </>
      )}

      <div className="sheet-actions">
        <button className="btn full" onClick={exportSummary}>Export summary</button>
        <button className="btn primary full" onClick={() => store.closeMonth(month)} disabled={closed} style={{ opacity: closed ? 0.5 : 1 }}>
          {closed ? <><IconCheck size={16} /> Closed</> : 'Close month'}
        </button>
      </div>
    </Sheet>
  )
}


function SyncCard() {
  const store = useStore()
  const [joining, setJoining] = useState(false)
  const [codeInput, setCodeInput] = useState('')
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    if (!store.syncCode) return
    try {
      await navigator.clipboard.writeText(store.syncCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch { /* ignore */ }
  }

  if (store.syncCode) {
    return (
      <div className="card" style={{ padding: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <span style={{ width: 8, height: 8, borderRadius: 99, background: 'var(--green-ink, #2e7d32)' }} />
          <strong>Cloud sync is on</strong>
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 10 }}>
          Changes on this device appear on every device that uses the same sync code.
        </div>
        <div style={{ fontFamily: 'monospace', fontSize: 14, background: 'var(--bg-2, #f1f1ee)', borderRadius: 10, padding: '10px 12px', wordBreak: 'break-all', marginBottom: 10 }}>
          {store.syncCode}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn" style={{ flex: 1 }} onClick={copy}>{copied ? 'Copied!' : 'Copy code'}</button>
          <button
            className="btn"
            style={{ flex: 1, color: 'var(--red-ink)' }}
            onClick={() => { if (confirm('Turn off sync on this device? Data stays on the device and in the cloud.')) store.disableSync() }}
          >
            Turn off
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="card" style={{ padding: 16 }}>
      <div style={{ fontWeight: 600, marginBottom: 6 }}>Sync between devices</div>
      <div style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 12 }}>
        Keep iPhone and computer up to date automatically. Start sync here, then enter the same code on the other device.
      </div>
      {joining ? (
        <div>
          <input
            className="input"
            style={{ width: '100%', marginBottom: 8, fontFamily: 'monospace' }}
            placeholder="Paste sync code from the other device"
            value={codeInput}
            onChange={(e) => setCodeInput(e.target.value)}
          />
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn" style={{ flex: 1 }} onClick={() => setJoining(false)}>Cancel</button>
            <button
              className="btn primary"
              style={{ flex: 1 }}
              disabled={codeInput.trim().length < 20}
              onClick={() => { if (codeInput.trim().length >= 20) store.enableSync(codeInput) }}
            >
              Connect
            </button>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn primary" style={{ flex: 1 }} onClick={() => store.enableSync()}>Start sync</button>
          <button className="btn" style={{ flex: 1 }} onClick={() => setJoining(true)}>I have a code</button>
        </div>
      )}
    </div>
  )
}
