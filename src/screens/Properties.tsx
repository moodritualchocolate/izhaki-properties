import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../context/store'
import { money, currentMonthKey } from '../lib/util'
import {
  propertyMonthlyRent,
  propertyRentStatus,
  propertyOpenRepairs,
  propertyHealth,
  healthLabel,
} from '../lib/selectors'
import { StatusPill, TonePill } from '../components/bits'
import { IconSearch, IconPlus, IconCamera } from '../components/Icon'
import { PropertyForm } from '../components/forms'

type Filter = 'all' | 'unpaid' | 'partial' | 'paid' | 'repairs' | 'lease'

const FILTERS: { v: Filter; l: string }[] = [
  { v: 'all', l: 'All' },
  { v: 'unpaid', l: 'Unpaid' },
  { v: 'partial', l: 'Partial' },
  { v: 'paid', l: 'Paid' },
  { v: 'repairs', l: 'Open repairs' },
  { v: 'lease', l: 'Lease ending' },
]

export default function Properties() {
  const store = useStore()
  const nav = useNavigate()
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<Filter>('all')
  const [adding, setAdding] = useState(false)
  const month = currentMonthKey()

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return store.properties.filter((p) => {
      if (q) {
        const hay = [
          p.address,
          p.city,
          ...p.units.flatMap((u) => [u.unitName, ...u.tenants.flatMap((t) => [t.name, t.phone ?? ''])]),
        ]
          .join(' ')
          .toLowerCase()
        if (!hay.includes(q)) return false
      }
      const status = propertyRentStatus(store, p, month)
      if (filter === 'unpaid' && status !== 'unpaid') return false
      if (filter === 'partial' && status !== 'partial') return false
      if (filter === 'paid' && status !== 'paid') return false
      if (filter === 'repairs' && propertyOpenRepairs(store, p.id) === 0) return false
      if (filter === 'lease') {
        const soon = p.units.some((u) => u.leaseEnd && hasLeaseSoon(u.leaseEnd))
        if (!soon) return false
      }
      return true
    })
  }, [store, query, filter, month])

  return (
    <div className="screen">
      <div className="page-title">
        <h1>Properties</h1>
        <span className="count">{store.properties.length} total</span>
      </div>

      <div className="searchbar">
        <span className="s-ic"><IconSearch size={17} /></span>
        <input placeholder="Search address, tenant, phone" value={query} onChange={(e) => setQuery(e.target.value)} />
      </div>

      <div className="filter-row">
        {FILTERS.map((f) => (
          <button key={f.v} className={`chip ${filter === f.v ? 'active' : ''}`} onClick={() => setFilter(f.v)}>{f.l}</button>
        ))}
      </div>

      {filtered.map((p) => {
        const rent = propertyMonthlyRent(p)
        const status = propertyRentStatus(store, p, month)
        const open = propertyOpenRepairs(store, p.id)
        const health = propertyHealth(store, p)
        const hl = healthLabel(health)
        return (
          <div className="prop-card" key={p.id} onClick={() => nav(`/property/${p.id}`)}>
            <div className="prop-image">
              {p.imageUrl ? (
                <img src={p.imageUrl} alt={p.address} />
              ) : (
                <div className="placeholder">
                  <IconCamera size={26} />
                  No property image yet
                </div>
              )}
              <div className="img-badges">
                <span />
                <TonePill tone={hl.tone}>{hl.label}</TonePill>
              </div>
            </div>
            <div className="prop-body">
              <div className="addr">{p.address}</div>
              <div className="city">{[p.city, p.state].filter(Boolean).join(', ')}</div>
              <div className="prop-meta">
                {rent > 0 ? <span className="rent">{money(rent)}/mo</span> : <span className="missing">Add rent</span>}
                <span>{p.units.length} unit{p.units.length !== 1 ? 's' : ''}</span>
                {open > 0 && <span>{open} repair{open > 1 ? 's' : ''}</span>}
              </div>
              <div className="prop-foot">
                <StatusPill status={status} />
                {open > 0 && <TonePill tone="orange">{open} open</TonePill>}
              </div>
            </div>
          </div>
        )
      })}

      {filtered.length === 0 && (
        <div className="empty">
          <div className="e-ic">🏠</div>
          <div className="e-t">No properties match</div>
          <div className="e-s">Try clearing your search or filters.</div>
        </div>
      )}

      <button className="fab" onClick={() => setAdding(true)} aria-label="Add property">
        <IconPlus size={26} />
      </button>
      <PropertyForm open={adding} onClose={() => setAdding(false)} />
    </div>
  )
}

function hasLeaseSoon(leaseEnd: string): boolean {
  const parts = leaseEnd.split(/[/\-.]/).map(Number)
  if (parts.length < 3) return false
  let [mm, dd, yyyy] = parts
  const last = new Date(yyyy, mm, 0).getDate()
  if (dd > last) dd = last
  const d = new Date(yyyy, mm - 1, dd)
  const diff = Math.round((d.getTime() - Date.now()) / 86400000)
  return diff >= 0 && diff <= 60
}
