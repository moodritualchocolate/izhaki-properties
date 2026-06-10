import type { PaymentStatus } from '../lib/types'

const STATUS_LABEL: Record<PaymentStatus, string> = {
  paid: 'Paid',
  partial: 'Partial',
  unpaid: 'Not Paid',
  pending: 'Pending',
}

export function StatusPill({ status, label }: { status: PaymentStatus; label?: string }) {
  return (
    <span className={`pill ${status}`}>
      <span className="dot" />
      {label ?? STATUS_LABEL[status]}
    </span>
  )
}

export function TonePill({ tone, children }: { tone: 'green' | 'orange' | 'red' | 'blue' | 'muted'; children: React.ReactNode }) {
  return <span className={`pill ${tone}`}>{children}</span>
}

export function Stars({ rating = 0 }: { rating?: number }) {
  const full = Math.round(rating)
  return (
    <span className="star" aria-label={`${rating} stars`}>
      {'★'.repeat(full)}
      <span style={{ color: 'var(--hairline-strong)' }}>{'★'.repeat(Math.max(0, 5 - full))}</span>
    </span>
  )
}

export function Avatar({ name }: { name: string }) {
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('')
  return <span className="av">{initials || '?'}</span>
}

export function Missing({ children = 'Missing' }: { children?: React.ReactNode }) {
  return <span className="missing">{children}</span>
}

export function Empty({ icon, title, sub }: { icon: React.ReactNode; title: string; sub?: string }) {
  return (
    <div className="empty">
      <div className="e-ic">{icon}</div>
      <div className="e-t">{title}</div>
      {sub && <div className="e-s">{sub}</div>}
    </div>
  )
}
