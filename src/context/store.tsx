import React, { createContext, useContext, useEffect, useMemo, useReducer, useRef, useState } from 'react'
import type {
  AppState,
  Property,
  Unit,
  Tenant,
  Payment,
  Repair,
  Vendor,
  PropertyDocument,
  TimelineEvent,
  PaymentStatus,
} from '../lib/types'
import { buildSeedState } from '../data/seed'
import { uid, currentMonthKey } from '../lib/util'
import { buildLinks } from '../lib/links'
import {
  startSync,
  stopSync,
  pushState,
  getSyncCode,
  saveSyncCode,
  clearSyncCode,
  generateSyncCode,
} from '../lib/sync'

const STORAGE_KEY = 'gal-properties-state-v1'

function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw) as AppState
  } catch {
    /* ignore */
  }
  return buildSeedState()
}

type Action =
  | { type: 'set'; state: AppState }
  | { type: 'patch'; fn: (s: AppState) => AppState }

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'set':
      return action.state
    case 'patch':
      return action.fn(state)
  }
}

interface StoreValue extends AppState {
  // properties
  addProperty: (p: Partial<Property>) => string
  updateProperty: (id: string, patch: Partial<Property>) => void
  deleteProperty: (id: string) => void
  // units
  addUnit: (propertyId: string, u: Partial<Unit>) => string
  updateUnit: (unitId: string, patch: Partial<Unit>) => void
  deleteUnit: (unitId: string) => void
  // tenants
  addTenant: (unitId: string, t: Partial<Tenant>) => void
  updateTenant: (unitId: string, tenantId: string, patch: Partial<Tenant>) => void
  deleteTenant: (unitId: string, tenantId: string) => void
  // payments
  getPayment: (unitId: string, month: string) => Payment | undefined
  setPaymentStatus: (unitId: string, month: string, status: PaymentStatus, extra?: Partial<Payment>) => void
  savePartialPayment: (unitId: string, month: string, data: Partial<Payment>) => void
  // repairs
  addRepair: (r: Partial<Repair>) => void
  updateRepair: (id: string, patch: Partial<Repair>) => void
  deleteRepair: (id: string) => void
  // vendors
  addVendor: (v: Partial<Vendor>) => void
  updateVendor: (id: string, patch: Partial<Vendor>) => void
  deleteVendor: (id: string) => void
  // documents
  addDocument: (d: Partial<PropertyDocument>) => void
  deleteDocument: (id: string) => void
  // timeline / notes
  addNote: (propertyId: string, text: string, unitId?: string) => void
  // monthly closing
  closeMonth: (month: string) => void
  resetAll: () => void
  // sync
  syncCode: string | null
  enableSync: (code?: string) => string
  disableSync: () => void
}

const StoreContext = createContext<StoreValue | null>(null)

function findUnit(state: AppState, unitId: string): { p: Property; u: Unit } | null {
  for (const p of state.properties) {
    const u = p.units.find((x) => x.id === unitId)
    if (u) return { p, u }
  }
  return null
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadState)
  const [syncCode, setSyncCode] = useState<string | null>(getSyncCode())
  const applyingRemote = useRef(false)
  const stateRef = useRef(state)
  stateRef.current = state

  // Realtime cloud sync (optional, enabled from More -> Sync)
  useEffect(() => {
    if (!syncCode) return
    startSync(syncCode, stateRef.current, {
      onRemoteState: (remote) => {
        applyingRemote.current = true
        dispatch({ type: 'set', state: remote })
      },
    })
    return () => stopSync()
  }, [syncCode])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      /* ignore quota */
    }
    if (applyingRemote.current) {
      applyingRemote.current = false
      return
    }
    pushState(state)
  }, [state])

  const value = useMemo<StoreValue>(() => {
    const patch = (fn: (s: AppState) => AppState) => dispatch({ type: 'patch', fn })

    const pushEvent = (s: AppState, ev: Omit<TimelineEvent, 'id'>): AppState => ({
      ...s,
      timeline: [{ ...ev, id: uid('tl') }, ...s.timeline],
    })

    return {
      ...state,

      addProperty: (p) => {
        const id = uid('p')
        patch((s) => ({
          ...s,
          properties: [
            ...s.properties,
            {
              id,
              address: p.address || 'New Property',
              city: p.city || '',
              state: p.state || 'FL',
              zip: p.zip || '',
              county: p.county || (p.city?.includes('Miami') ? 'Miami-Dade' : 'Broward'),
              imageUrl: p.imageUrl,
              notes: p.notes,
              links:
                p.links ??
                buildLinks(
                  p.address || '',
                  p.city || '',
                  p.state || 'FL',
                  p.zip || '',
                  p.county || (p.city?.includes('Miami') ? 'Miami-Dade' : 'Broward'),
                ),
              units: [],
            },
          ],
        }))
        return id
      },

      updateProperty: (id, p) =>
        patch((s) => ({
          ...s,
          properties: s.properties.map((x) => {
            if (x.id !== id) return x
            const merged = { ...x, ...p }
            // regenerate links if address changed and links not explicitly provided
            if ((p.address || p.city || p.zip) && !p.links) {
              merged.links = buildLinks(merged.address, merged.city, merged.state, merged.zip, merged.county)
            }
            return merged
          }),
        })),

      deleteProperty: (id) =>
        patch((s) => ({
          ...s,
          properties: s.properties.filter((x) => x.id !== id),
          payments: s.payments.filter((x) => x.propertyId !== id),
          repairs: s.repairs.filter((x) => x.propertyId !== id),
          documents: s.documents.filter((x) => x.propertyId !== id),
          timeline: s.timeline.filter((x) => x.propertyId !== id),
        })),

      addUnit: (propertyId, u) => {
        const id = uid('u')
        patch((s) => ({
          ...s,
          properties: s.properties.map((p) =>
            p.id === propertyId
              ? {
                  ...p,
                  units: [
                    ...p.units,
                    {
                      id,
                      propertyId,
                      unitName: u.unitName || 'New Unit',
                      rent: u.rent ?? null,
                      tenants: u.tenants ?? [],
                      leaseStart: u.leaseStart,
                      leaseEnd: u.leaseEnd,
                      deposit: u.deposit ?? null,
                      notes: u.notes,
                      expenses: u.expenses ?? [],
                    },
                  ],
                }
              : p,
          ),
        }))
        return id
      },

      updateUnit: (unitId, up) =>
        patch((s) => ({
          ...s,
          properties: s.properties.map((p) => ({
            ...p,
            units: p.units.map((u) => (u.id === unitId ? { ...u, ...up } : u)),
          })),
        })),

      deleteUnit: (unitId) =>
        patch((s) => ({
          ...s,
          properties: s.properties.map((p) => ({
            ...p,
            units: p.units.filter((u) => u.id !== unitId),
          })),
          payments: s.payments.filter((x) => x.unitId !== unitId),
        })),

      addTenant: (unitId, t) =>
        patch((s) => ({
          ...s,
          properties: s.properties.map((p) => ({
            ...p,
            units: p.units.map((u) =>
              u.id === unitId
                ? { ...u, tenants: [...u.tenants, { id: uid('t'), unitId, name: t.name || 'New Tenant', phone: t.phone, email: t.email, notes: t.notes }] }
                : u,
            ),
          })),
        })),

      updateTenant: (unitId, tenantId, tp) =>
        patch((s) => ({
          ...s,
          properties: s.properties.map((p) => ({
            ...p,
            units: p.units.map((u) =>
              u.id === unitId
                ? { ...u, tenants: u.tenants.map((t) => (t.id === tenantId ? { ...t, ...tp } : t)) }
                : u,
            ),
          })),
        })),

      deleteTenant: (unitId, tenantId) =>
        patch((s) => ({
          ...s,
          properties: s.properties.map((p) => ({
            ...p,
            units: p.units.map((u) =>
              u.id === unitId ? { ...u, tenants: u.tenants.filter((t) => t.id !== tenantId) } : u,
            ),
          })),
        })),

      getPayment: (unitId, month) =>
        state.payments.find((p) => p.unitId === unitId && p.month === month),

      setPaymentStatus: (unitId, month, status, extra) =>
        patch((s) => {
          const loc = findUnit(s, unitId)
          if (!loc) return s
          const rent = loc.u.rent ?? 0
          const existing = s.payments.find((p) => p.unitId === unitId && p.month === month)
          let amountPaid = 0
          if (status === 'paid') amountPaid = rent
          else if (status === 'unpaid' || status === 'pending') amountPaid = 0
          else amountPaid = existing?.amountPaid ?? 0
          const payment: Payment = {
            id: existing?.id ?? uid('pay'),
            propertyId: loc.p.id,
            unitId,
            month,
            rentDue: rent,
            amountPaid,
            remainingBalance: Math.max(0, rent - amountPaid),
            status,
            paymentDate: status === 'paid' ? (extra?.paymentDate ?? new Date().toISOString().slice(0, 10)) : extra?.paymentDate,
            method: extra?.method,
            notes: extra?.notes,
          }
          const payments = existing
            ? s.payments.map((p) => (p.id === existing.id ? payment : p))
            : [...s.payments, payment]
          let next = { ...s, payments }
          const unitLabel = `${loc.p.address} · ${loc.u.unitName}`
          if (status === 'paid') {
            next = pushEvent(next, {
              propertyId: loc.p.id,
              unitId,
              type: 'rent_paid',
              title: 'Rent paid',
              description: unitLabel,
              date: new Date().toISOString(),
            })
          } else if (status === 'unpaid') {
            next = pushEvent(next, {
              propertyId: loc.p.id,
              unitId,
              type: 'rent_unpaid',
              title: 'Marked unpaid',
              description: unitLabel,
              date: new Date().toISOString(),
            })
          }
          return next
        }),

      savePartialPayment: (unitId, month, data) =>
        patch((s) => {
          const loc = findUnit(s, unitId)
          if (!loc) return s
          const rentDue = data.rentDue ?? loc.u.rent ?? 0
          const amountPaid = data.amountPaid ?? 0
          const existing = s.payments.find((p) => p.unitId === unitId && p.month === month)
          const payment: Payment = {
            id: existing?.id ?? uid('pay'),
            propertyId: loc.p.id,
            unitId,
            month,
            rentDue,
            amountPaid,
            remainingBalance: Math.max(0, rentDue - amountPaid),
            status: amountPaid >= rentDue && rentDue > 0 ? 'paid' : amountPaid > 0 ? 'partial' : 'unpaid',
            paymentDate: data.paymentDate ?? new Date().toISOString().slice(0, 10),
            method: data.method,
            notes: data.notes,
          }
          const payments = existing
            ? s.payments.map((p) => (p.id === existing.id ? payment : p))
            : [...s.payments, payment]
          return pushEvent({ ...s, payments }, {
            propertyId: loc.p.id,
            unitId,
            type: 'partial_payment',
            title: payment.status === 'paid' ? 'Rent paid' : 'Partial payment',
            description: `${loc.p.address} · ${loc.u.unitName}`,
            date: new Date().toISOString(),
          })
        }),

      addRepair: (r) =>
        patch((s) => {
          const repair: Repair = {
            id: uid('rep'),
            propertyId: r.propertyId!,
            unitId: r.unitId,
            title: r.title || 'New Repair',
            description: r.description,
            vendorId: r.vendorId,
            cost: r.cost ?? null,
            date: r.date || new Date().toISOString().slice(0, 10),
            status: r.status || 'open',
            beforeImage: r.beforeImage,
            afterImage: r.afterImage,
            invoice: r.invoice,
            notes: r.notes,
          }
          const prop = s.properties.find((p) => p.id === repair.propertyId)
          return pushEvent({ ...s, repairs: [repair, ...s.repairs] }, {
            propertyId: repair.propertyId,
            unitId: repair.unitId,
            type: 'repair_opened',
            title: 'Repair opened',
            description: `${repair.title}${prop ? ' · ' + prop.address : ''}`,
            date: new Date().toISOString(),
          })
        }),

      updateRepair: (id, rp) =>
        patch((s) => {
          const before = s.repairs.find((r) => r.id === id)
          const repairs = s.repairs.map((r) => (r.id === id ? { ...r, ...rp } : r))
          let next = { ...s, repairs }
          if (rp.status === 'completed' && before?.status !== 'completed') {
            const prop = s.properties.find((p) => p.id === before?.propertyId)
            next = pushEvent(next, {
              propertyId: before!.propertyId,
              unitId: before!.unitId,
              type: 'repair_completed',
              title: 'Repair completed',
              description: `${before!.title}${prop ? ' · ' + prop.address : ''}`,
              date: new Date().toISOString(),
            })
          }
          return next
        }),

      deleteRepair: (id) =>
        patch((s) => ({ ...s, repairs: s.repairs.filter((r) => r.id !== id) })),

      addVendor: (v) =>
        patch((s) =>
          pushEvent(
            {
              ...s,
              vendors: [
                ...s.vendors,
                {
                  id: uid('v'),
                  name: v.name || 'New Vendor',
                  profession: v.profession,
                  phone: v.phone,
                  email: v.email,
                  rating: v.rating,
                  trusted: v.trusted ?? false,
                  notes: v.notes,
                },
              ],
            },
            {
              propertyId: '',
              type: 'vendor_added',
              title: 'Vendor added',
              description: v.name || 'New Vendor',
              date: new Date().toISOString(),
            },
          ),
        ),

      updateVendor: (id, vp) =>
        patch((s) => ({ ...s, vendors: s.vendors.map((v) => (v.id === id ? { ...v, ...vp } : v)) })),

      deleteVendor: (id) =>
        patch((s) => ({ ...s, vendors: s.vendors.filter((v) => v.id !== id) })),

      addDocument: (d) =>
        patch((s) => {
          const doc: PropertyDocument = {
            id: uid('doc'),
            propertyId: d.propertyId!,
            unitId: d.unitId,
            type: d.type || 'Other',
            name: d.name || 'Document',
            url: d.url,
            date: d.date || new Date().toISOString().slice(0, 10),
          }
          return pushEvent({ ...s, documents: [doc, ...s.documents] }, {
            propertyId: doc.propertyId,
            unitId: doc.unitId,
            type: 'document_uploaded',
            title: 'Document added',
            description: `${doc.type}: ${doc.name}`,
            date: new Date().toISOString(),
          })
        }),

      deleteDocument: (id) =>
        patch((s) => ({ ...s, documents: s.documents.filter((d) => d.id !== id) })),

      addNote: (propertyId, text, unitId) =>
        patch((s) =>
          pushEvent(s, {
            propertyId,
            unitId,
            type: 'note_added',
            title: 'Note',
            description: text,
            date: new Date().toISOString(),
          }),
        ),

      closeMonth: (month) =>
        patch((s) => {
          if (s.closedMonths.includes(month)) return s
          return pushEvent(
            { ...s, closedMonths: [...s.closedMonths, month] },
            {
              propertyId: '',
              type: 'month_closed',
              title: 'Month closed',
              description: month,
              date: new Date().toISOString(),
            },
          )
        }),

      resetAll: () => dispatch({ type: 'set', state: buildSeedState() }),

      syncCode,
      enableSync: (code) => {
        const c = (code && code.trim()) || generateSyncCode()
        saveSyncCode(c)
        setSyncCode(c)
        return c
      },
      disableSync: () => {
        clearSyncCode()
        stopSync()
        setSyncCode(null)
      },
    }
  }, [state, syncCode])

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used within StoreProvider')
  return ctx
}

export { currentMonthKey }
