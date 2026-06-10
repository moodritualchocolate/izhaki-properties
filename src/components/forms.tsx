import { useState } from 'react'
import { useStore } from '../context/store'
import { Sheet } from './Sheet'
import type { Property, Unit, Tenant, Repair, Vendor, DocumentType, RepairStatus } from '../lib/types'

// ---------------- Property ----------------
export function PropertyForm({ open, onClose, property }: { open: boolean; onClose: () => void; property?: Property }) {
  const store = useStore()
  const [address, setAddress] = useState(property?.address ?? '')
  const [city, setCity] = useState(property?.city ?? '')
  const [state, setState] = useState(property?.state ?? 'FL')
  const [zip, setZip] = useState(property?.zip ?? '')
  const [imageUrl, setImageUrl] = useState(property?.imageUrl ?? '')
  const [notes, setNotes] = useState(property?.notes ?? '')

  const save = () => {
    const data = { address, city, state, zip, imageUrl: imageUrl || undefined, notes }
    if (property) store.updateProperty(property.id, data)
    else store.addProperty(data)
    onClose()
  }

  return (
    <Sheet open={open} onClose={onClose} title={property ? 'Edit property' : 'Add property'}>
      <div className="field">
        <label>Address</label>
        <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="123 Main St" />
      </div>
      <div className="field-row">
        <div className="field">
          <label>City</label>
          <input value={city} onChange={(e) => setCity(e.target.value)} />
        </div>
        <div className="field">
          <label>State</label>
          <input value={state} onChange={(e) => setState(e.target.value)} />
        </div>
      </div>
      <div className="field">
        <label>ZIP</label>
        <input value={zip} onChange={(e) => setZip(e.target.value)} />
      </div>
      <div className="field">
        <label>Property image URL</label>
        <input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://…" />
      </div>
      <div className="field">
        <label>Notes</label>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
      </div>
      <FormActions onCancel={onClose} onSave={save} canDelete={!!property} onDelete={property ? () => { store.deleteProperty(property.id); onClose() } : undefined} />
    </Sheet>
  )
}

// ---------------- Unit ----------------
export function UnitForm({ open, onClose, propertyId, unit }: { open: boolean; onClose: () => void; propertyId: string; unit?: Unit }) {
  const store = useStore()
  const [unitName, setUnitName] = useState(unit?.unitName ?? '')
  const [rent, setRent] = useState(unit?.rent != null ? String(unit.rent) : '')
  const [leaseStart, setLeaseStart] = useState(unit?.leaseStart ?? '')
  const [leaseEnd, setLeaseEnd] = useState(unit?.leaseEnd ?? '')
  const [deposit, setDeposit] = useState(unit?.deposit != null ? String(unit.deposit) : '')
  const [notes, setNotes] = useState(unit?.notes ?? '')

  const save = () => {
    const data = {
      unitName,
      rent: rent.trim() === '' ? null : Number(rent),
      leaseStart: leaseStart || undefined,
      leaseEnd: leaseEnd || undefined,
      deposit: deposit.trim() === '' ? null : Number(deposit),
      notes,
    }
    if (unit) store.updateUnit(unit.id, data)
    else store.addUnit(propertyId, data)
    onClose()
  }

  return (
    <Sheet open={open} onClose={onClose} title={unit ? 'Edit unit' : 'Add unit'}>
      <div className="field">
        <label>Unit name</label>
        <input value={unitName} onChange={(e) => setUnitName(e.target.value)} placeholder="Unit #1" />
      </div>
      <div className="field-row">
        <div className="field">
          <label>Monthly rent</label>
          <input type="number" inputMode="decimal" value={rent} onChange={(e) => setRent(e.target.value)} placeholder="Missing" />
        </div>
        <div className="field">
          <label>Deposit</label>
          <input type="number" inputMode="decimal" value={deposit} onChange={(e) => setDeposit(e.target.value)} placeholder="Optional" />
        </div>
      </div>
      <div className="field-row">
        <div className="field">
          <label>Lease start</label>
          <input value={leaseStart} onChange={(e) => setLeaseStart(e.target.value)} placeholder="MM/DD/YYYY" />
        </div>
        <div className="field">
          <label>Lease end</label>
          <input value={leaseEnd} onChange={(e) => setLeaseEnd(e.target.value)} placeholder="MM/DD/YYYY" />
        </div>
      </div>
      <div className="field">
        <label>Notes</label>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
      </div>
      <FormActions onCancel={onClose} onSave={save} canDelete={!!unit} onDelete={unit ? () => { store.deleteUnit(unit.id); onClose() } : undefined} />
    </Sheet>
  )
}

// ---------------- Tenant ----------------
export function TenantForm({ open, onClose, unitId, tenant }: { open: boolean; onClose: () => void; unitId: string; tenant?: Tenant }) {
  const store = useStore()
  const [name, setName] = useState(tenant?.name ?? '')
  const [phone, setPhone] = useState(tenant?.phone ?? '')
  const [email, setEmail] = useState(tenant?.email ?? '')
  const [notes, setNotes] = useState(tenant?.notes ?? '')

  const save = () => {
    const data = { name, phone: phone || undefined, email: email || undefined, notes }
    if (tenant) store.updateTenant(unitId, tenant.id, data)
    else store.addTenant(unitId, data)
    onClose()
  }

  return (
    <Sheet open={open} onClose={onClose} title={tenant ? 'Edit tenant' : 'Add tenant'}>
      <div className="field">
        <label>Full name</label>
        <input value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div className="field">
        <label>Phone</label>
        <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="000-000-0000" />
      </div>
      <div className="field">
        <label>Email</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div className="field">
        <label>Notes</label>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
      </div>
      <FormActions onCancel={onClose} onSave={save} canDelete={!!tenant} onDelete={tenant ? () => { store.deleteTenant(unitId, tenant.id); onClose() } : undefined} />
    </Sheet>
  )
}

// ---------------- Repair ----------------
const REPAIR_STATUSES: { v: RepairStatus; l: string }[] = [
  { v: 'open', l: 'Open' },
  { v: 'in_progress', l: 'In Progress' },
  { v: 'completed', l: 'Completed' },
]
export function RepairForm({ open, onClose, repair, defaultPropertyId }: { open: boolean; onClose: () => void; repair?: Repair; defaultPropertyId?: string }) {
  const store = useStore()
  const [propertyId, setPropertyId] = useState(repair?.propertyId ?? defaultPropertyId ?? store.properties[0]?.id ?? '')
  const [unitId, setUnitId] = useState(repair?.unitId ?? '')
  const [title, setTitle] = useState(repair?.title ?? '')
  const [description, setDescription] = useState(repair?.description ?? '')
  const [vendorId, setVendorId] = useState(repair?.vendorId ?? '')
  const [cost, setCost] = useState(repair?.cost != null ? String(repair.cost) : '')
  const [date, setDate] = useState(repair?.date ?? new Date().toISOString().slice(0, 10))
  const [status, setStatus] = useState<RepairStatus>(repair?.status ?? 'open')
  const [beforeImage, setBeforeImage] = useState(repair?.beforeImage ?? '')
  const [afterImage, setAfterImage] = useState(repair?.afterImage ?? '')
  const [invoice, setInvoice] = useState(repair?.invoice ?? '')
  const [notes, setNotes] = useState(repair?.notes ?? '')

  const property = store.properties.find((p) => p.id === propertyId)

  const save = () => {
    const data = {
      propertyId, unitId: unitId || undefined, title, description, vendorId: vendorId || undefined,
      cost: cost.trim() === '' ? null : Number(cost), date, status,
      beforeImage: beforeImage || undefined, afterImage: afterImage || undefined, invoice: invoice || undefined, notes,
    }
    if (repair) store.updateRepair(repair.id, data)
    else store.addRepair(data)
    onClose()
  }

  return (
    <Sheet open={open} onClose={onClose} title={repair ? 'Edit repair' : 'New repair'}>
      <div className="field">
        <label>Property</label>
        <select value={propertyId} onChange={(e) => { setPropertyId(e.target.value); setUnitId('') }}>
          {store.properties.map((p) => <option key={p.id} value={p.id}>{p.address}</option>)}
        </select>
      </div>
      <div className="field">
        <label>Unit</label>
        <select value={unitId} onChange={(e) => setUnitId(e.target.value)}>
          <option value="">Whole property</option>
          {property?.units.map((u) => <option key={u.id} value={u.id}>{u.unitName}</option>)}
        </select>
      </div>
      <div className="field">
        <label>Title</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. AC not cooling" />
      </div>
      <div className="field">
        <label>Description</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>
      <div className="field">
        <label>Status</label>
        <div className="segmented">
          {REPAIR_STATUSES.map((s) => (
            <button key={s.v} className={status === s.v ? 'active' : ''} onClick={() => setStatus(s.v)}>{s.l}</button>
          ))}
        </div>
      </div>
      <div className="field-row">
        <div className="field">
          <label>Vendor</label>
          <select value={vendorId} onChange={(e) => setVendorId(e.target.value)}>
            <option value="">None</option>
            {store.vendors.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
          </select>
        </div>
        <div className="field">
          <label>Cost</label>
          <input type="number" inputMode="decimal" value={cost} onChange={(e) => setCost(e.target.value)} placeholder="Optional" />
        </div>
      </div>
      <div className="field">
        <label>Date</label>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      </div>
      <div className="field">
        <label>Before photo URL</label>
        <input value={beforeImage} onChange={(e) => setBeforeImage(e.target.value)} placeholder="https://… (optional)" />
      </div>
      <div className="field">
        <label>After photo URL</label>
        <input value={afterImage} onChange={(e) => setAfterImage(e.target.value)} placeholder="https://… (optional)" />
      </div>
      <div className="field">
        <label>Invoice URL / reference</label>
        <input value={invoice} onChange={(e) => setInvoice(e.target.value)} placeholder="Upload placeholder" />
      </div>
      <div className="field">
        <label>Notes</label>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
      </div>
      <FormActions onCancel={onClose} onSave={save} canDelete={!!repair} onDelete={repair ? () => { store.deleteRepair(repair.id); onClose() } : undefined} />
    </Sheet>
  )
}

// ---------------- Vendor ----------------
export function VendorForm({ open, onClose, vendor }: { open: boolean; onClose: () => void; vendor?: Vendor }) {
  const store = useStore()
  const [name, setName] = useState(vendor?.name ?? '')
  const [profession, setProfession] = useState(vendor?.profession ?? '')
  const [phone, setPhone] = useState(vendor?.phone ?? '')
  const [email, setEmail] = useState(vendor?.email ?? '')
  const [rating, setRating] = useState(vendor?.rating ?? 0)
  const [trusted, setTrusted] = useState(vendor?.trusted ?? false)
  const [notes, setNotes] = useState(vendor?.notes ?? '')

  const save = () => {
    const data = { name, profession, phone: phone || undefined, email: email || undefined, rating, trusted, notes }
    if (vendor) store.updateVendor(vendor.id, data)
    else store.addVendor(data)
    onClose()
  }

  return (
    <Sheet open={open} onClose={onClose} title={vendor ? 'Edit vendor' : 'Add vendor'}>
      <div className="field">
        <label>Name</label>
        <input value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div className="field">
        <label>Profession</label>
        <input value={profession} onChange={(e) => setProfession(e.target.value)} placeholder="Plumber, Electrician…" />
      </div>
      <div className="field-row">
        <div className="field">
          <label>Phone</label>
          <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
        <div className="field">
          <label>Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
      </div>
      <div className="field">
        <label>Rating</label>
        <div style={{ fontSize: 30, letterSpacing: 4, cursor: 'pointer' }}>
          {[1, 2, 3, 4, 5].map((n) => (
            <span key={n} onClick={() => setRating(n)} style={{ color: n <= rating ? '#f5b50a' : 'var(--hairline-strong)' }}>★</span>
          ))}
        </div>
      </div>
      <div className="field">
        <label>Trusted</label>
        <div className="segmented">
          <button className={trusted ? 'active' : ''} onClick={() => setTrusted(true)}>Trusted</button>
          <button className={!trusted ? 'active' : ''} onClick={() => setTrusted(false)}>Unverified</button>
        </div>
      </div>
      <div className="field">
        <label>Notes</label>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
      </div>
      <FormActions onCancel={onClose} onSave={save} canDelete={!!vendor} onDelete={vendor ? () => { store.deleteVendor(vendor.id); onClose() } : undefined} />
    </Sheet>
  )
}

// ---------------- Document ----------------
const DOC_TYPES: DocumentType[] = ['Lease', 'Insurance', 'Tax', 'Invoice', 'Permit', 'HOA Letter', 'Eviction', 'Photo', 'Other']
export function DocumentForm({ open, onClose, propertyId }: { open: boolean; onClose: () => void; propertyId: string }) {
  const store = useStore()
  const [type, setType] = useState<DocumentType>('Lease')
  const [name, setName] = useState('')
  const [url, setUrl] = useState('')

  const save = () => {
    store.addDocument({ propertyId, type, name: name || type, url: url || undefined })
    onClose()
  }

  return (
    <Sheet open={open} onClose={onClose} title="Add document" subtitle="Attach a link or note a placeholder for now.">
      <div className="field">
        <label>Type</label>
        <select value={type} onChange={(e) => setType(e.target.value as DocumentType)}>
          {DOC_TYPES.map((t) => <option key={t}>{t}</option>)}
        </select>
      </div>
      <div className="field">
        <label>Name</label>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. 2025 Lease Agreement" />
      </div>
      <div className="field">
        <label>File URL</label>
        <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://… (optional)" />
      </div>
      <FormActions onCancel={onClose} onSave={save} />
    </Sheet>
  )
}

// ---------------- Shared form actions ----------------
function FormActions({ onCancel, onSave, canDelete, onDelete }: { onCancel: () => void; onSave: () => void; canDelete?: boolean; onDelete?: () => void }) {
  return (
    <>
      <div className="sheet-actions">
        <button className="btn full" onClick={onCancel}>Cancel</button>
        <button className="btn primary full" onClick={onSave}>Save</button>
      </div>
      {canDelete && onDelete && (
        <button className="btn danger full" style={{ marginTop: 10 }} onClick={() => { if (confirm('Delete this? This cannot be undone.')) onDelete() }}>
          Delete
        </button>
      )}
    </>
  )
}
