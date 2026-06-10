import { useState } from 'react'
import { useStore } from '../context/store'
import { Sheet } from './Sheet'
import { IconCheck } from './Icon'
import { money, monthLabel } from '../lib/util'

interface Props {
  unitId: string
  month: string
  rent: number | null
}

export function PaymentControl({ unitId, month, rent }: Props) {
  const store = useStore()
  const payment = store.getPayment(unitId, month)
  const status = payment?.status ?? 'pending'
  const [sheetOpen, setSheetOpen] = useState(false)

  return (
    <>
      <div className="pay-actions">
        <button
          className={`pay-btn paid ${status === 'paid' ? 'active' : ''}`}
          onClick={() => store.setPaymentStatus(unitId, month, 'paid')}
        >
          {status === 'paid' && <IconCheck size={15} />} Paid
        </button>
        <button
          className={`pay-btn partial ${status === 'partial' ? 'active' : ''}`}
          onClick={() => setSheetOpen(true)}
        >
          Partial
        </button>
        <button
          className={`pay-btn unpaid ${status === 'unpaid' ? 'active' : ''}`}
          onClick={() => store.setPaymentStatus(unitId, month, 'unpaid')}
        >
          Not Paid
        </button>
      </div>
      {payment && payment.status !== 'pending' && (
        <div style={{ marginTop: 10, fontSize: 13, color: 'var(--text-2)', fontWeight: 600 }}>
          {payment.status === 'partial'
            ? `${money(payment.amountPaid)} paid · ${money(payment.remainingBalance)} remaining`
            : payment.status === 'paid'
              ? `Collected ${money(payment.amountPaid)}${payment.paymentDate ? ' · ' + payment.paymentDate : ''}`
              : `Outstanding ${money(payment.rentDue)}`}
        </div>
      )}

      <PartialSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        unitId={unitId}
        month={month}
        rent={rent}
        existing={payment}
      />
    </>
  )
}

function PartialSheet({
  open,
  onClose,
  unitId,
  month,
  rent,
  existing,
}: {
  open: boolean
  onClose: () => void
  unitId: string
  month: string
  rent: number | null
  existing: ReturnType<ReturnType<typeof useStore>['getPayment']>
}) {
  const store = useStore()
  const [rentDue, setRentDue] = useState(String(existing?.rentDue ?? rent ?? ''))
  const [amountPaid, setAmountPaid] = useState(String(existing?.amountPaid ?? ''))
  const [date, setDate] = useState(existing?.paymentDate ?? new Date().toISOString().slice(0, 10))
  const [method, setMethod] = useState(existing?.method ?? '')
  const [notes, setNotes] = useState(existing?.notes ?? '')

  const due = parseFloat(rentDue) || 0
  const paid = parseFloat(amountPaid) || 0
  const remaining = Math.max(0, due - paid)

  const save = () => {
    store.savePartialPayment(unitId, month, {
      rentDue: due,
      amountPaid: paid,
      paymentDate: date,
      method,
      notes,
    })
    onClose()
  }

  return (
    <Sheet open={open} onClose={onClose} title="Partial payment" subtitle={monthLabel(month)}>
      <div className="field">
        <label>Rent Due</label>
        <input type="number" inputMode="decimal" value={rentDue} onChange={(e) => setRentDue(e.target.value)} placeholder="0" />
      </div>
      <div className="field">
        <label>Amount Paid</label>
        <input type="number" inputMode="decimal" value={amountPaid} onChange={(e) => setAmountPaid(e.target.value)} placeholder="0" />
      </div>
      <div className="computed" style={{ marginBottom: 14 }}>
        <span className="label">Remaining Balance</span>
        <span className="amt" style={{ color: remaining > 0 ? 'var(--orange-ink)' : 'var(--green-ink)' }}>
          {money(remaining)}
        </span>
      </div>
      <div className="field-row">
        <div className="field">
          <label>Payment Date</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div className="field">
          <label>Method</label>
          <select value={method} onChange={(e) => setMethod(e.target.value)}>
            <option value="">Select</option>
            <option>Zelle</option>
            <option>Cash</option>
            <option>Check</option>
            <option>Bank Transfer</option>
            <option>Venmo</option>
            <option>Other</option>
          </select>
        </div>
      </div>
      <div className="field">
        <label>Notes</label>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional note" />
      </div>
      <div className="sheet-actions">
        <button className="btn full" onClick={onClose}>
          Cancel
        </button>
        <button className="btn primary full" onClick={save}>
          Save payment
        </button>
      </div>
    </Sheet>
  )
}
