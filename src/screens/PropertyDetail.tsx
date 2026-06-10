import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useStore } from '../context/store'
import type { Property, Unit } from '../lib/types'
import {
  propertyMonthlyRent,
  propertyOpenRepairs,
  propertyHealth,
  healthLabel,
  findUnitContext,
} from '../lib/selectors'
import { money, formatDate, currentMonthKey, monthLabel, telHref, whatsappHref, relativeTime, daysUntil } from '../lib/util'
import { LINK_LABELS } from '../lib/links'
import { StatusPill, TonePill, Stars, Avatar, Missing, Empty } from '../components/bits'
import { PaymentControl } from '../components/PaymentControl'
import {
  IconChevron, IconEdit, IconPhone, IconChat, IconPlus, IconExternal, IconMap,
  IconWrench, IconDoc, IconCamera, IconCalendar, IconCheck,
} from '../components/Icon'
import { PropertyForm, UnitForm, TenantForm, RepairForm, DocumentForm } from '../components/forms'

const TABS = ['Overview', 'Units', 'Payments', 'Repairs', 'Vendors', 'Documents', 'Timeline'] as const
type Tab = (typeof TABS)[number]

export default function PropertyDetail() {
  const { id } = useParams()
  const nav = useNavigate()
  const store = useStore()
  const property = store.properties.find((p) => p.id === id)
  const [tab, setTab] = useState<Tab>('Overview')
  const [editing, setEditing] = useState(false)

  if (!property) {
    return (
      <div className="screen">
        <Empty icon="🏚️" title="Property not found" sub="It may have been removed." />
        <button className="btn primary full" onClick={() => nav('/properties')}>Back to properties</button>
      </div>
    )
  }

  return (
    <div className="screen">
      <div className="hero">
        {property.imageUrl ? <img src={property.imageUrl} alt={property.address} /> : (
          <div className="placeholder" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <IconCamera size={28} /> No property image yet
          </div>
        )}
        <button className="back" onClick={() => nav(-1)} aria-label="Back">
          <span style={{ transform: 'rotate(180deg)', display: 'flex' }}><IconChevron size={20} /></span>
        </button>
      </div>

      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, margin: '14px 2px 4px' }}>
        <div style={{ flex: 1 }}>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, letterSpacing: '-0.02em' }}>{property.address}</h1>
          <div style={{ color: 'var(--text-2)', marginTop: 3, fontSize: 14 }}>{[property.city, property.state, property.zip].filter(Boolean).join(', ')}</div>
        </div>
        <button className="icon-btn" onClick={() => setEditing(true)} aria-label="Edit property"><IconEdit size={18} /></button>
      </div>

      <div className="tabs">
        {TABS.map((t) => (
          <button key={t} className={`tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>{t}</button>
        ))}
      </div>

      {tab === 'Overview' && <OverviewTab property={property} onEdit={() => setEditing(true)} />}
      {tab === 'Units' && <UnitsTab property={property} />}
      {tab === 'Payments' && <PaymentsTab property={property} />}
      {tab === 'Repairs' && <RepairsTab property={property} />}
      {tab === 'Vendors' && <VendorsTab />}
      {tab === 'Documents' && <DocumentsTab property={property} />}
      {tab === 'Timeline' && <TimelineTab property={property} />}

      <PropertyForm open={editing} onClose={() => setEditing(false)} property={property} />
    </div>
  )
}

// ---------------- Overview ----------------
function OverviewTab({ property, onEdit }: { property: Property; onEdit: () => void }) {
  const store = useStore()
  const health = propertyHealth(store, property)
  const hl = healthLabel(health)
  const rent = propertyMonthlyRent(property)
  const open = propertyOpenRepairs(store, property.id)
  const [noteOpen, setNoteOpen] = useState(false)
  const [note, setNote] = useState('')

  return (
    <div className="stack">
      <div className="metric-grid">
        <div className="metric"><div className="label">Total Rent</div><div className="value sm">{rent > 0 ? money(rent) : '—'}</div><div className="sub">{rent > 0 ? 'per month' : 'Add rent'}</div></div>
        <div className="metric"><div className="label">Units</div><div className="value sm">{property.units.length}</div><div className="sub">{open} open repairs</div></div>
        <div className="metric wide">
          <div className="label">Health score</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 6 }}>
            <div className="value" style={{ margin: 0 }}>{health}</div>
            <TonePill tone={hl.tone}>{hl.label}</TonePill>
          </div>
          <div className="bar"><span style={{ width: `${health}%`, background: hl.tone === 'red' ? 'var(--red)' : hl.tone === 'orange' ? 'var(--orange)' : 'var(--green)' }} /></div>
        </div>
      </div>

      <div className="section-label" style={{ marginTop: 8 }}>County & city links</div>
      <div className="link-grid">
        {(Object.keys(LINK_LABELS) as (keyof typeof LINK_LABELS)[]).map((key) => {
          const href = property.links[key]
          if (!href) return null
          return (
            <a className="link-tile" key={key} href={href} target="_blank" rel="noreferrer">
              <span className="lt-ic">{key === 'maps' ? <IconMap size={18} /> : <IconExternal size={17} />}</span>
              {LINK_LABELS[key]}
              <span className="ext"><IconExternal size={14} /></span>
            </a>
          )
        })}
      </div>

      <div className="section-label">Notes</div>
      <div className="card">
        {property.notes ? <div style={{ fontSize: 14.5, lineHeight: 1.5 }}>{property.notes}</div> : <span className="muted">No notes yet.</span>}
        <div className="divider" />
        <button className="btn-ghost" onClick={() => setNoteOpen(true)}>+ Add timeline note</button>
      </div>

      <button className="btn primary full" onClick={onEdit}><IconEdit size={17} /> Edit property</button>

      {noteOpen && (
        <div className="sheet-overlay" onClick={() => setNoteOpen(false)}>
          <div className="sheet" onClick={(e) => e.stopPropagation()}>
            <div className="grabber" />
            <h2>Add note</h2>
            <div className="field"><textarea autoFocus value={note} onChange={(e) => setNote(e.target.value)} placeholder="What happened?" /></div>
            <div className="sheet-actions">
              <button className="btn full" onClick={() => setNoteOpen(false)}>Cancel</button>
              <button className="btn primary full" onClick={() => { if (note.trim()) store.addNote(property.id, note.trim()); setNote(''); setNoteOpen(false) }}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ---------------- Units ----------------
function UnitsTab({ property }: { property: Property }) {
  const [adding, setAdding] = useState(false)
  const [editUnit, setEditUnit] = useState<Unit | null>(null)

  return (
    <div className="stack">
      {property.units.map((u) => <UnitCard key={u.id} unit={u} onEdit={() => setEditUnit(u)} />)}
      {property.units.length === 0 && <Empty icon="🚪" title="No units yet" sub="Add the first unit." />}
      <button className="btn full" onClick={() => setAdding(true)}><IconPlus size={17} /> Add unit</button>

      <UnitForm open={adding} onClose={() => setAdding(false)} propertyId={property.id} />
      {editUnit && <UnitForm open onClose={() => setEditUnit(null)} propertyId={property.id} unit={editUnit} />}
    </div>
  )
}

function UnitCard({ unit, onEdit }: { unit: Unit; onEdit: () => void }) {
  const [addTenant, setAddTenant] = useState(false)
  const [editTenantId, setEditTenantId] = useState<string | null>(null)
  const leaseDays = daysUntil(unit.leaseEnd)
  const primaryPhone = unit.tenants.find((t) => t.phone)?.phone

  return (
    <div className="card">
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 800, fontSize: 17 }}>{unit.unitName}</div>
          <div style={{ fontSize: 13, color: 'var(--text-2)', marginTop: 2 }}>
            {unit.rent != null ? `${money(unit.rent)}/mo` : <Missing>Rent missing</Missing>}
          </div>
        </div>
        <button className="icon-btn" onClick={onEdit} aria-label="Edit unit"><IconEdit size={17} /></button>
      </div>

      <div style={{ marginTop: 12 }}>
        {unit.tenants.length === 0 ? <span className="muted" style={{ fontSize: 13 }}>No tenants</span> : (
          unit.tenants.map((t) => (
            <span key={t.id} className="tenant-chip" onClick={() => setEditTenantId(t.id)}>
              <span className="av"><Avatar name={t.name} /></span>
              {t.name}
            </span>
          ))
        )}
        <span className="tenant-chip" onClick={() => setAddTenant(true)} style={{ background: 'var(--blue-soft)', color: 'var(--blue-ink)', paddingLeft: 10 }}>
          <IconPlus size={13} /> Tenant
        </span>
      </div>

      <div className="divider" />

      <div className="kv"><span className="k">Phone</span><span className="v">{primaryPhone ?? <Missing />}</span></div>
      <div className="kv"><span className="k">Lease start</span><span className="v">{unit.leaseStart ? formatDate(unit.leaseStart) : <Missing />}</span></div>
      <div className="kv">
        <span className="k">Lease end</span>
        <span className="v">
          {unit.leaseEnd ? formatDate(unit.leaseEnd) : <Missing />}
          {leaseDays !== null && leaseDays >= 0 && leaseDays <= 60 && <span style={{ marginLeft: 6 }}><TonePill tone="orange">{leaseDays}d</TonePill></span>}
        </span>
      </div>
      {unit.deposit != null && <div className="kv"><span className="k">Deposit</span><span className="v">{money(unit.deposit)}</span></div>}
      {unit.expenses.length > 0 && (
        <div className="kv">
          <span className="k">Expenses</span>
          <span className="v">{unit.expenses.map((e) => `${e.label} ${money(e.amount)}`).join(' · ')}</span>
        </div>
      )}
      {unit.notes && <div className="kv"><span className="k">Notes</span><span className="v">{unit.notes}</span></div>}

      <div className="icon-actions" style={{ marginTop: 14 }}>
        <a className={`icon-btn ${primaryPhone ? 'accent' : ''}`} href={telHref(primaryPhone)} style={{ flex: 1, pointerEvents: primaryPhone ? 'auto' : 'none', opacity: primaryPhone ? 1 : 0.4 }}><IconPhone size={18} /></a>
        <a className={`icon-btn ${primaryPhone ? 'green' : ''}`} href={whatsappHref(primaryPhone)} target="_blank" rel="noreferrer" style={{ flex: 1, pointerEvents: primaryPhone ? 'auto' : 'none', opacity: primaryPhone ? 1 : 0.4 }}><IconChat size={18} /></a>
        <button className="icon-btn" onClick={onEdit} style={{ flex: 1 }}><IconEdit size={17} /></button>
      </div>

      {addTenant && <TenantForm open onClose={() => setAddTenant(false)} unitId={unit.id} />}
      {editTenantId && <TenantForm open onClose={() => setEditTenantId(null)} unitId={unit.id} tenant={unit.tenants.find((t) => t.id === editTenantId)} />}
    </div>
  )
}

// ---------------- Payments ----------------
function PaymentsTab({ property }: { property: Property }) {
  const month = currentMonthKey()
  return (
    <div className="stack">
      <div className="section-label" style={{ marginTop: 0 }}>{monthLabel(month)}</div>
      {property.units.map((u) => (
        <div className="card" key={u.id}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div>
              <div style={{ fontWeight: 700 }}>{u.unitName}</div>
              <div style={{ fontSize: 13, color: 'var(--text-2)' }}>{u.rent != null ? `${money(u.rent)} due` : 'Rent missing'}</div>
            </div>
          </div>
          <PaymentControl unitId={u.id} month={month} rent={u.rent} />
        </div>
      ))}
    </div>
  )
}

// ---------------- Repairs ----------------
function RepairsTab({ property }: { property: Property }) {
  const store = useStore()
  const [adding, setAdding] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const repairs = store.repairs.filter((r) => r.propertyId === property.id)

  return (
    <div className="stack">
      {repairs.length === 0 && <Empty icon="🛠️" title="No repairs" sub="Log a repair to track it." />}
      {repairs.map((r) => <RepairCard key={r.id} repair={r} onEdit={() => setEditId(r.id)} />)}
      <button className="btn full" onClick={() => setAdding(true)}><IconPlus size={17} /> Add repair</button>
      {adding && <RepairForm open onClose={() => setAdding(false)} defaultPropertyId={property.id} />}
      {editId && <RepairForm open onClose={() => setEditId(null)} repair={repairs.find((r) => r.id === editId)} />}
    </div>
  )
}

export function RepairCard({ repair, onEdit }: { repair: import('../lib/types').Repair; onEdit: () => void }) {
  const store = useStore()
  const vendor = store.vendors.find((v) => v.id === repair.vendorId)
  const unit = repair.unitId ? findUnitContext(store, repair.unitId) : null
  const tone = repair.status === 'completed' ? 'green' : repair.status === 'in_progress' ? 'blue' : 'orange'
  const statusLabel = repair.status === 'completed' ? 'Completed' : repair.status === 'in_progress' ? 'In Progress' : 'Open'

  return (
    <div className="card">
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
        <div className="ic" style={{ background: 'var(--gray-soft)' }}><IconWrench size={18} /></div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 15.5 }}>{repair.title}</div>
          <div style={{ fontSize: 13, color: 'var(--text-2)', marginTop: 2 }}>
            {unit ? unit.unit.unitName : 'Whole property'}{vendor ? ` · ${vendor.name}` : ''}{repair.cost != null ? ` · ${money(repair.cost)}` : ''}
          </div>
        </div>
        <button className="icon-btn" onClick={onEdit} aria-label="Edit repair" style={{ width: 38, height: 38 }}><IconEdit size={16} /></button>
      </div>
      {repair.description && <div style={{ fontSize: 14, color: 'var(--text-2)', marginTop: 10, lineHeight: 1.45 }}>{repair.description}</div>}
      {(repair.beforeImage || repair.afterImage) && (
        <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
          {repair.beforeImage && <img src={repair.beforeImage} alt="before" style={{ flex: 1, height: 90, objectFit: 'cover', borderRadius: 12 }} />}
          {repair.afterImage && <img src={repair.afterImage} alt="after" style={{ flex: 1, height: 90, objectFit: 'cover', borderRadius: 12 }} />}
        </div>
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12 }}>
        <TonePill tone={tone}>{statusLabel}</TonePill>
        <span style={{ fontSize: 12.5, color: 'var(--text-3)', fontWeight: 600 }}>{formatDate(toMMDD(repair.date))}</span>
        {repair.status !== 'completed' && (
          <button className="btn sm" style={{ marginLeft: 'auto' }} onClick={() => store.updateRepair(repair.id, { status: 'completed' })}><IconCheck size={15} /> Done</button>
        )}
      </div>
    </div>
  )
}

function toMMDD(iso: string) {
  const [y, m, d] = iso.split('-')
  if (y && m && d) return `${m}/${d}/${y}`
  return iso
}

// ---------------- Vendors ----------------
function VendorsTab() {
  const store = useStore()
  return (
    <div className="stack">
      {store.vendors.length === 0 && <Empty icon="🧰" title="No vendors yet" sub="Add vendors from the More tab or Repairs." />}
      {store.vendors.map((v) => (
        <div className="card" key={v.id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div className="ic" style={{ background: 'var(--gray-soft)' }}>🧰</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700 }}>{v.name} {v.trusted && <TonePill tone="green">Trusted</TonePill>}</div>
            <div style={{ fontSize: 13, color: 'var(--text-2)' }}>{v.profession || 'Vendor'} {v.rating ? <Stars rating={v.rating} /> : null}</div>
          </div>
          {v.phone && <a className="icon-btn accent" href={telHref(v.phone)}><IconPhone size={17} /></a>}
        </div>
      ))}
    </div>
  )
}

// ---------------- Documents ----------------
function DocumentsTab({ property }: { property: Property }) {
  const store = useStore()
  const [adding, setAdding] = useState(false)
  const docs = store.documents.filter((d) => d.propertyId === property.id)
  return (
    <div className="stack">
      {docs.length === 0 && <Empty icon="📄" title="No documents" sub="Lease, insurance, tax, permits & more." />}
      {docs.length > 0 && (
        <div className="card flush"><div className="row-list">
          {docs.map((d) => (
            <div className="row" key={d.id}>
              <div className="ic"><IconDoc size={18} /></div>
              <div className="main"><div className="t">{d.name}</div><div className="s">{d.type} · {d.date}</div></div>
              {d.url ? <a className="btn-ghost" href={d.url} target="_blank" rel="noreferrer">Open</a> : <span className="muted" style={{ fontSize: 13 }}>Placeholder</span>}
              <button className="btn-ghost" style={{ color: 'var(--red-ink)' }} onClick={() => store.deleteDocument(d.id)}>Remove</button>
            </div>
          ))}
        </div></div>
      )}
      <button className="btn full" onClick={() => setAdding(true)}><IconPlus size={17} /> Add document</button>
      {adding && <DocumentForm open onClose={() => setAdding(false)} propertyId={property.id} />}
    </div>
  )
}

// ---------------- Timeline ----------------
const TL_ICON: Record<string, React.ReactNode> = {
  rent_paid: <IconCheck size={16} />, partial_payment: '½', rent_unpaid: '!', repair_opened: <IconWrench size={15} />,
  repair_completed: <IconCheck size={16} />, vendor_added: '🧰', document_uploaded: <IconDoc size={15} />,
  lease_reminder: <IconCalendar size={15} />, note_added: '📝', month_closed: '📅',
}
function TimelineTab({ property }: { property: Property }) {
  const store = useStore()
  const events = store.timeline.filter((e) => e.propertyId === property.id)
  if (events.length === 0) return <Empty icon="🗂️" title="No activity yet" sub="Payments, repairs and notes will appear here." />
  return (
    <div className="timeline">
      {events.map((e) => (
        <div className="tl-item" key={e.id}>
          <div className="tl-dot">{TL_ICON[e.type] ?? '•'}</div>
          <div className="tl-body">
            <div className="tl-t">{e.title}</div>
            {e.description && <div className="tl-d">{e.description}</div>}
            <div className="tl-time">{relativeTime(e.date)}</div>
          </div>
        </div>
      ))}
    </div>
  )
}
