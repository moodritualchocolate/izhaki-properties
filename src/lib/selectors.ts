import type { AppState, Property, Unit, Payment, PaymentStatus } from './types'
import { currentMonthKey, daysUntil } from './util'

export function propertyMonthlyRent(p: Property): number {
  return p.units.reduce((sum, u) => sum + (u.rent ?? 0), 0)
}

export function propertyExpenses(p: Property): number {
  return p.units.reduce((sum, u) => sum + u.expenses.reduce((s, e) => s + e.amount, 0), 0)
}

export function unitPaymentStatus(state: AppState, unitId: string, month = currentMonthKey()): PaymentStatus {
  const pay = state.payments.find((p) => p.unitId === unitId && p.month === month)
  return pay?.status ?? 'pending'
}

export function propertyOpenRepairs(state: AppState, propertyId: string): number {
  return state.repairs.filter((r) => r.propertyId === propertyId && r.status !== 'completed').length
}

// Rent status rollup for a property in a given month.
export function propertyRentStatus(state: AppState, p: Property, month = currentMonthKey()): PaymentStatus {
  const statuses = p.units.map((u) => unitPaymentStatus(state, u.id, month))
  if (statuses.length === 0) return 'pending'
  if (statuses.some((s) => s === 'unpaid')) return 'unpaid'
  if (statuses.some((s) => s === 'partial')) return 'partial'
  if (statuses.every((s) => s === 'paid')) return 'paid'
  return 'pending'
}

// Health: 100 minus penalties for open repairs, unpaid rent, missing data, expiring leases.
export function propertyHealth(state: AppState, p: Property): number {
  let score = 100
  const openRepairs = propertyOpenRepairs(state, p.id)
  score -= Math.min(30, openRepairs * 12)
  const month = currentMonthKey()
  for (const u of p.units) {
    const st = unitPaymentStatus(state, u.id, month)
    if (st === 'unpaid') score -= 10
    if (st === 'partial') score -= 5
    if (u.rent == null) score -= 4
    const d = daysUntil(u.leaseEnd)
    if (d !== null && d <= 60 && d >= 0) score -= 4
    if (u.tenants.some((t) => !t.phone)) score -= 2
  }
  if (!p.imageUrl) score -= 3
  return Math.max(0, Math.min(100, Math.round(score)))
}

export function healthLabel(score: number): { label: string; tone: 'green' | 'orange' | 'red' } {
  if (score >= 85) return { label: 'Excellent', tone: 'green' }
  if (score >= 65) return { label: 'Stable', tone: 'green' }
  if (score >= 45) return { label: 'Needs attention', tone: 'orange' }
  return { label: 'At risk', tone: 'red' }
}

export interface PortfolioSummary {
  expectedRent: number
  collected: number
  remaining: number
  openRepairs: number
  leaseEndingSoon: number
  unitsNeedingAttention: number
  totalUnits: number
}

export function portfolioSummary(state: AppState, month = currentMonthKey()): PortfolioSummary {
  let expectedRent = 0
  let collected = 0
  let leaseEndingSoon = 0
  let unitsNeedingAttention = 0
  let totalUnits = 0

  for (const p of state.properties) {
    for (const u of p.units) {
      totalUnits++
      const rent = u.rent ?? 0
      expectedRent += rent
      const pay = state.payments.find((x) => x.unitId === u.id && x.month === month)
      collected += pay?.amountPaid ?? 0
      const status = pay?.status ?? 'pending'
      if (status === 'unpaid' || status === 'partial') unitsNeedingAttention++
      const d = daysUntil(u.leaseEnd)
      if (d !== null && d >= 0 && d <= 60) {
        leaseEndingSoon++
      }
    }
  }
  const openRepairs = state.repairs.filter((r) => r.status !== 'completed').length
  unitsNeedingAttention += state.properties.reduce(
    (acc, p) => acc + (propertyOpenRepairs(state, p.id) > 0 ? 1 : 0),
    0,
  )

  return {
    expectedRent,
    collected,
    remaining: Math.max(0, expectedRent - collected),
    openRepairs,
    leaseEndingSoon,
    unitsNeedingAttention,
    totalUnits,
  }
}

export interface Alert {
  id: string
  level: 'red' | 'orange' | 'blue'
  title: string
  detail: string
  propertyId?: string
}

export function buildAlerts(state: AppState, month = currentMonthKey()): Alert[] {
  const alerts: Alert[] = []
  const now = new Date()
  for (const p of state.properties) {
    for (const u of p.units) {
      const label = `${p.address} · ${u.unitName}`
      const status = unitPaymentStatus(state, u.id, month)
      if (status === 'unpaid') {
        alerts.push({ id: `rent-${u.id}`, level: 'red', title: 'Rent not paid', detail: label, propertyId: p.id })
      } else if (status === 'partial') {
        alerts.push({ id: `rent-${u.id}`, level: 'orange', title: 'Partial rent', detail: label, propertyId: p.id })
      }
      const d = daysUntil(u.leaseEnd, now)
      if (d !== null && d >= 0 && d <= 60) {
        alerts.push({ id: `lease-${u.id}`, level: d <= 30 ? 'orange' : 'blue', title: `Lease ends in ${d}d`, detail: label, propertyId: p.id })
      }
      if (u.tenants.some((t) => !t.phone)) {
        alerts.push({ id: `phone-${u.id}`, level: 'blue', title: 'Missing phone', detail: label, propertyId: p.id })
      }
      if (!u.leaseEnd || !u.leaseStart) {
        alerts.push({ id: `lease-missing-${u.id}`, level: 'blue', title: 'Missing lease dates', detail: label, propertyId: p.id })
      }
    }
    if (!p.imageUrl) {
      alerts.push({ id: `img-${p.id}`, level: 'blue', title: 'Missing property image', detail: p.address, propertyId: p.id })
    }
  }
  for (const r of state.repairs) {
    if (r.status !== 'completed') {
      const opened = new Date(r.date)
      const days = Math.round((now.getTime() - opened.getTime()) / 86400000)
      if (days > 7) {
        const p = state.properties.find((x) => x.id === r.propertyId)
        alerts.push({ id: `repair-${r.id}`, level: 'orange', title: `Repair open ${days}d`, detail: `${r.title}${p ? ' · ' + p.address : ''}`, propertyId: r.propertyId })
      }
    }
  }
  const order = { red: 0, orange: 1, blue: 2 }
  return alerts.sort((a, b) => order[a.level] - order[b.level])
}

export interface MonthlySummaryResult {
  month: string
  expectedRent: number
  collected: number
  remaining: number
  expenses: number
  repairCosts: number
  net: number
  unpaidUnits: { label: string; amount: number }[]
  completedRepairs: number
  openRepairs: number
}

export function buildMonthlySummary(state: AppState, month: string): MonthlySummaryResult {
  let expectedRent = 0
  let collected = 0
  let expenses = 0
  const unpaidUnits: { label: string; amount: number }[] = []

  for (const p of state.properties) {
    for (const u of p.units) {
      const rent = u.rent ?? 0
      expectedRent += rent
      expenses += u.expenses.reduce((s, e) => s + e.amount, 0)
      const pay = state.payments.find((x) => x.unitId === u.id && x.month === month)
      const paid = pay?.amountPaid ?? 0
      collected += paid
      const remaining = Math.max(0, rent - paid)
      if (remaining > 0) {
        unpaidUnits.push({ label: `${p.address} · ${u.unitName}`, amount: remaining })
      }
    }
  }

  const monthRepairs = state.repairs.filter((r) => (r.date || '').startsWith(month))
  const repairCosts = state.repairs
    .filter((r) => r.status === 'completed' && (r.date || '').startsWith(month))
    .reduce((s, r) => s + (r.cost ?? 0), 0)
  const completedRepairs = monthRepairs.filter((r) => r.status === 'completed').length
  const openRepairs = state.repairs.filter((r) => r.status !== 'completed').length

  return {
    month,
    expectedRent,
    collected,
    remaining: Math.max(0, expectedRent - collected),
    expenses,
    repairCosts,
    net: collected - expenses - repairCosts,
    unpaidUnits,
    completedRepairs,
    openRepairs,
  }
}

export function smartSummary(state: AppState): string {
  const s = portfolioSummary(state)
  if (s.totalUnits === 0) return 'No units yet. Add your first property to get started.'
  const attention = s.unitsNeedingAttention
  if (attention === 0 && s.openRepairs === 0) {
    if (s.leaseEndingSoon > 0) {
      return `Your portfolio is on track. ${s.leaseEndingSoon} lease${s.leaseEndingSoon > 1 ? 's' : ''} ending soon.`
    }
    return 'Your portfolio is fully on track. Everything looks calm.'
  }
  const parts: string[] = []
  if (attention > 0) parts.push(`${attention} unit${attention > 1 ? 's' : ''} need attention`)
  if (s.openRepairs > 0) parts.push(`${s.openRepairs} open repair${s.openRepairs > 1 ? 's' : ''}`)
  return `Your portfolio is mostly stable. ${parts.join(' · ')}.`
}

export function findUnitContext(state: AppState, unitId: string): { property: Property; unit: Unit } | null {
  for (const p of state.properties) {
    const u = p.units.find((x) => x.id === unitId)
    if (u) return { property: p, unit: u }
  }
  return null
}

export type { Payment }
