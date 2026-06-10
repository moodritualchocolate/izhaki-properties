import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../context/store'
import { money, telHref } from '../lib/util'
import { Stars, TonePill, Empty } from '../components/bits'
import { IconPlus, IconPhone, IconChevron, IconEdit } from '../components/Icon'
import { VendorForm } from '../components/forms'
import type { Vendor } from '../lib/types'

export default function Vendors() {
  const store = useStore()
  const nav = useNavigate()
  const [adding, setAdding] = useState(false)
  const [edit, setEdit] = useState<Vendor | null>(null)

  const vendorStats = (vendorId: string) => {
    const jobs = store.repairs.filter((r) => r.vendorId === vendorId)
    const costs = jobs.map((j) => j.cost ?? 0).filter((c) => c > 0)
    const avg = costs.length ? costs.reduce((a, b) => a + b, 0) / costs.length : 0
    const props = new Set(jobs.map((j) => j.propertyId)).size
    return { jobs: jobs.length, avg, props }
  }

  return (
    <div className="screen">
      <div className="page-title">
        <button className="btn-ghost" style={{ position: 'absolute', left: 16, top: 'calc(var(--safe-top) + 28px)' }} onClick={() => nav('/more')}>
          <span style={{ display: 'inline-flex', transform: 'rotate(180deg)' }}><IconChevron size={16} /></span> More
        </button>
        <h1 style={{ marginLeft: 56 }}>Vendors</h1>
        <span className="count">{store.vendors.length}</span>
      </div>

      <div className="stack">
        {store.vendors.length === 0 && <Empty icon="🧰" title="No vendors yet" sub="Add your trusted plumbers, electricians and handymen." />}
        {store.vendors.map((v) => {
          const st = vendorStats(v.id)
          return (
            <div className="card" key={v.id}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <div className="ic" style={{ background: 'var(--gray-soft)', width: 44, height: 44 }}>🧰</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                    {v.name} {v.trusted && <TonePill tone="green">Trusted</TonePill>}
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text-2)', marginTop: 2 }}>{v.profession || 'Vendor'}</div>
                  {v.rating ? <div style={{ marginTop: 4 }}><Stars rating={v.rating} /></div> : null}
                </div>
                <button className="icon-btn" style={{ width: 38, height: 38 }} onClick={() => setEdit(v)}><IconEdit size={16} /></button>
              </div>
              <div className="divider" />
              <div style={{ display: 'flex', justifyContent: 'space-between', textAlign: 'center' }}>
                <div><div style={{ fontWeight: 800 }}>{st.jobs}</div><div style={{ fontSize: 12, color: 'var(--text-3)' }}>Jobs</div></div>
                <div><div style={{ fontWeight: 800 }}>{st.avg ? money(st.avg) : '—'}</div><div style={{ fontSize: 12, color: 'var(--text-3)' }}>Avg cost</div></div>
                <div><div style={{ fontWeight: 800 }}>{st.props}</div><div style={{ fontSize: 12, color: 'var(--text-3)' }}>Properties</div></div>
              </div>
              {v.notes && <div style={{ fontSize: 13.5, color: 'var(--text-2)', marginTop: 12 }}>{v.notes}</div>}
              {(v.phone || v.email) && (
                <div className="icon-actions" style={{ marginTop: 12 }}>
                  {v.phone && <a className="icon-btn accent" href={telHref(v.phone)} style={{ flex: 1 }}><IconPhone size={18} /></a>}
                  {v.email && <a className="btn sm" href={`mailto:${v.email}`} style={{ flex: 2 }}>Email</a>}
                </div>
              )}
            </div>
          )
        })}
      </div>

      <button className="fab" onClick={() => setAdding(true)} aria-label="Add vendor"><IconPlus size={26} /></button>
      {adding && <VendorForm open onClose={() => setAdding(false)} />}
      {edit && <VendorForm open onClose={() => setEdit(null)} vendor={edit} />}
    </div>
  )
}
