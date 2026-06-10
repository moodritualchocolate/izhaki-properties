import { useMemo, useState } from 'react'
import { useStore } from '../context/store'
import { RepairCard } from './PropertyDetail'
import { RepairForm } from '../components/forms'
import { IconPlus } from '../components/Icon'
import { Empty } from '../components/bits'
import type { RepairStatus } from '../lib/types'

type Filter = 'all' | RepairStatus

const FILTERS: { v: Filter; l: string }[] = [
  { v: 'all', l: 'All' },
  { v: 'open', l: 'Open' },
  { v: 'in_progress', l: 'In Progress' },
  { v: 'completed', l: 'Completed' },
]

export default function Repairs() {
  const store = useStore()
  const [filter, setFilter] = useState<Filter>('all')
  const [adding, setAdding] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)

  const repairs = useMemo(
    () => store.repairs.filter((r) => filter === 'all' || r.status === filter),
    [store.repairs, filter],
  )
  const open = store.repairs.filter((r) => r.status !== 'completed').length

  return (
    <div className="screen">
      <div className="page-title">
        <h1>Repairs</h1>
        <span className="count">{open} open</span>
      </div>

      <div className="filter-row">
        {FILTERS.map((f) => (
          <button key={f.v} className={`chip ${filter === f.v ? 'active' : ''}`} onClick={() => setFilter(f.v)}>{f.l}</button>
        ))}
      </div>

      <div className="stack">
        {repairs.length === 0 && <Empty icon="🛠️" title="No repairs" sub="Tap + to log a repair." />}
        {repairs.map((r) => <RepairCard key={r.id} repair={r} onEdit={() => setEditId(r.id)} />)}
      </div>

      <button className="fab" onClick={() => setAdding(true)} aria-label="Add repair"><IconPlus size={26} /></button>
      {adding && <RepairForm open onClose={() => setAdding(false)} />}
      {editId && <RepairForm open onClose={() => setEditId(null)} repair={store.repairs.find((r) => r.id === editId)} />}
    </div>
  )
}
