// ---- small shared helpers ----

export function uid(prefix = 'id'): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`
}

export function greeting(now = new Date()): string {
  const h = now.getHours()
  if (h < 12) return 'Good morning Gal'
  if (h < 18) return 'Good afternoon Gal'
  return 'Good evening Gal'
}

export function money(n: number | null | undefined): string {
  if (n === null || n === undefined || Number.isNaN(n)) return '—'
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
}

export function moneyExact(n: number | null | undefined): string {
  if (n === null || n === undefined || Number.isNaN(n)) return '—'
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
}

// Current month key 'YYYY-MM'
export function currentMonthKey(d = new Date()): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

export function monthLabel(key: string): string {
  const [y, m] = key.split('-').map(Number)
  if (!y || !m) return key
  return new Date(y, m - 1, 1).toLocaleString('en-US', { month: 'long', year: 'numeric' })
}

export function shortMonthLabel(key: string): string {
  const [y, m] = key.split('-').map(Number)
  if (!y || !m) return key
  return new Date(y, m - 1, 1).toLocaleString('en-US', { month: 'short', year: 'numeric' })
}

// Build a list of month keys, most recent first, count months back from `from`.
export function recentMonths(count: number, from = new Date()): string[] {
  const out: string[] = []
  const d = new Date(from.getFullYear(), from.getMonth(), 1)
  for (let i = 0; i < count; i++) {
    out.push(currentMonthKey(d))
    d.setMonth(d.getMonth() - 1)
  }
  return out
}

// Lenient parse of MM/DD/YYYY — clamps invalid days (e.g. 06/31) to last valid.
export function parseLooseDate(s?: string): Date | null {
  if (!s) return null
  const parts = s.split(/[/\-.]/).map((p) => parseInt(p, 10))
  if (parts.length < 3 || parts.some((n) => Number.isNaN(n))) return null
  let [mm, dd, yyyy] = parts
  if (yyyy < 100) yyyy += 2000
  const lastDay = new Date(yyyy, mm, 0).getDate()
  if (dd > lastDay) dd = lastDay
  return new Date(yyyy, mm - 1, dd)
}

export function daysUntil(s?: string, now = new Date()): number | null {
  const d = parseLooseDate(s)
  if (!d) return null
  const a = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  return Math.round((d.getTime() - a.getTime()) / 86400000)
}

export function formatDate(s?: string): string {
  const d = parseLooseDate(s)
  if (!d) return s || 'Missing'
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function formatISO(iso?: string): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function relativeTime(iso: string, now = new Date()): string {
  const d = new Date(iso)
  const diff = now.getTime() - d.getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return formatISO(iso)
}

export function telHref(phone?: string): string | undefined {
  if (!phone) return undefined
  return `tel:${phone.replace(/[^\d+]/g, '')}`
}

export function whatsappHref(phone?: string): string | undefined {
  if (!phone) return undefined
  const digits = phone.replace(/[^\d]/g, '')
  const intl = digits.length === 10 ? `1${digits}` : digits
  return `https://wa.me/${intl}`
}

export function smsHref(phone?: string): string | undefined {
  if (!phone) return undefined
  return `sms:${phone.replace(/[^\d+]/g, '')}`
}
