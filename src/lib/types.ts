// ---- Core data models for Gal Properties ----

export type PaymentStatus = 'paid' | 'partial' | 'unpaid' | 'pending'
export type RepairStatus = 'open' | 'in_progress' | 'completed'

export interface Tenant {
  id: string
  unitId: string
  name: string
  phone?: string
  email?: string
  notes?: string
}

export interface Expense {
  id: string
  label: string
  amount: number
}

export interface Unit {
  id: string
  propertyId: string
  unitName: string
  rent: number | null // null === unknown / missing
  tenants: Tenant[]
  leaseStart?: string // raw string as provided (MM/DD/YYYY)
  leaseEnd?: string
  deposit?: number | null
  notes?: string
  expenses: Expense[]
}

export interface PropertyLinks {
  maps?: string
  zillow?: string
  appraiser?: string
  taxPortal?: string
  permits?: string
  codeViolations?: string
}

export interface Property {
  id: string
  address: string
  city: string
  state: string
  zip: string
  county?: string
  imageUrl?: string
  notes?: string
  links: PropertyLinks
  units: Unit[]
}

export interface Payment {
  id: string
  propertyId: string
  unitId: string
  month: string // 'YYYY-MM'
  rentDue: number
  amountPaid: number
  remainingBalance: number
  status: PaymentStatus
  paymentDate?: string
  method?: string
  notes?: string
}

export interface Repair {
  id: string
  propertyId: string
  unitId?: string
  title: string
  description?: string
  vendorId?: string
  cost?: number | null
  date: string // ISO date created/scheduled
  status: RepairStatus
  beforeImage?: string
  afterImage?: string
  invoice?: string
  notes?: string
}

export interface Vendor {
  id: string
  name: string
  profession?: string
  phone?: string
  email?: string
  rating?: number // 0-5
  trusted: boolean
  notes?: string
}

export type DocumentType =
  | 'Lease'
  | 'Insurance'
  | 'Tax'
  | 'Invoice'
  | 'Permit'
  | 'HOA Letter'
  | 'Eviction'
  | 'Photo'
  | 'Other'

export interface PropertyDocument {
  id: string
  propertyId: string
  unitId?: string
  type: DocumentType
  name: string
  url?: string
  date: string
}

export type TimelineType =
  | 'rent_paid'
  | 'partial_payment'
  | 'rent_unpaid'
  | 'repair_opened'
  | 'repair_completed'
  | 'vendor_added'
  | 'document_uploaded'
  | 'lease_reminder'
  | 'note_added'
  | 'month_closed'

export interface TimelineEvent {
  id: string
  propertyId: string
  unitId?: string
  type: TimelineType
  title: string
  description?: string
  date: string // ISO
}

export interface AppState {
  properties: Property[]
  payments: Payment[]
  repairs: Repair[]
  vendors: Vendor[]
  documents: PropertyDocument[]
  timeline: TimelineEvent[]
  closedMonths: string[] // list of 'YYYY-MM' that have been closed
}
