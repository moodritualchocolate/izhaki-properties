import type { AppState, Property, Unit, Tenant, Expense } from '../lib/types'
import { buildLinks } from '../lib/links'

// ---------------------------------------------------------------------------
// REAL portfolio seed data. Do not invent properties, tenants, or addresses.
// Unknown values are stored as null/undefined and surfaced as "Missing" in UI.
// ---------------------------------------------------------------------------

let unitCounter = 0
let tenantCounter = 0

function tenant(unitId: string, name: string, phone?: string): Tenant {
  return { id: `t${++tenantCounter}`, unitId, name, phone }
}

function exp(label: string, amount: number): Expense {
  return { id: `e${label}-${amount}-${Math.random().toString(36).slice(2, 6)}`, label, amount }
}

interface UnitSeed {
  unitName: string
  rent: number | null
  tenants: { name: string; phone?: string }[]
  leaseStart?: string
  leaseEnd?: string
  expenses?: Expense[]
}

function makeProperty(
  id: string,
  address: string,
  city: string,
  state: string,
  zip: string,
  county: string,
  unitSeeds: UnitSeed[],
): Property {
  const units: Unit[] = unitSeeds.map((u) => {
    const unitId = `u${++unitCounter}`
    return {
      id: unitId,
      propertyId: id,
      unitName: u.unitName,
      rent: u.rent,
      tenants: u.tenants.map((t) => tenant(unitId, t.name, t.phone)),
      leaseStart: u.leaseStart,
      leaseEnd: u.leaseEnd,
      deposit: null,
      expenses: u.expenses ?? [],
    }
  })
  return {
    id,
    address,
    city,
    state,
    zip,
    county,
    links: buildLinks(address, city, state, zip, county),
    units,
  }
}

export const seedProperties: Property[] = [
  makeProperty('p1', '5221 SW 43rd Ter', 'Dania Beach', 'FL', '33314', 'Broward', [
    {
      unitName: 'Unit #2',
      rent: 2950,
      tenants: [{ name: 'Alexis Tejeda', phone: '305-951-0269' }],
      leaseStart: '10/07/2025',
      leaseEnd: '10/06/2026',
    },
    {
      unitName: 'Unit #1',
      rent: 2600,
      tenants: [
        { name: 'Eleazar Mendoza', phone: '954-822-5431' },
        { name: 'Celia Angeles', phone: '954-822-5431' },
      ],
      leaseStart: '09/05/2025',
      leaseEnd: '09/04/2026',
    },
  ]),

  makeProperty('p2', '4333 SW 51st St', 'Dania Beach', 'FL', '33314', 'Broward', [
    {
      unitName: 'Main Unit',
      rent: null,
      tenants: [{ name: 'Timothey Shimko', phone: '954-496-1752' }],
      leaseStart: '04/15/2026',
      leaseEnd: '04/14/2027',
    },
  ]),

  makeProperty('p3', '4089 SW 52nd St', 'Dania Beach', 'FL', '33314', 'Broward', [
    {
      unitName: 'Unit #5',
      rent: 2850,
      tenants: [
        { name: 'Audrey Price', phone: '954-629-7832' },
        { name: 'Jayvin Palmer', phone: '954-629-7832' },
        { name: 'Khiry Stewart', phone: '954-629-7832' },
      ],
      leaseStart: '07/01/2025',
      leaseEnd: '06/31/2026',
      expenses: [exp('Landscaping', 20), exp('Mortgage', 965)],
    },
    {
      unitName: 'Additional Unit',
      rent: 2700,
      tenants: [
        { name: 'Marella V Williams', phone: '954-257-5185' },
        { name: 'Stanton O Smith', phone: '954-257-5185' },
      ],
      leaseStart: '10/01/2025',
      leaseEnd: '10/31/2026',
      expenses: [exp('Landscaping', 20), exp('Mortgage', 965)],
    },
  ]),

  makeProperty('p4', '5180 SW 43rd Ter', 'Dania Beach', 'FL', '33314', 'Broward', [
    {
      unitName: 'Unit B',
      rent: 3030,
      tenants: [{ name: 'Alfredo Jose Lopez Molina', phone: '954-830-9996' }],
      leaseStart: '07/28/2025',
      leaseEnd: '07/27/2026',
    },
    {
      unitName: 'Unit A',
      rent: 2980,
      tenants: [{ name: 'April Kathleen Marjama' }, { name: 'Richard Allen Marjama' }],
      leaseStart: '08/15/2025',
      leaseEnd: '08/14/2026',
    },
  ]),

  makeProperty('p5', '5219 SW 43rd Ter', 'Dania Beach', 'FL', '33314', 'Broward', [
    {
      unitName: 'Unit #2',
      rent: 2750,
      tenants: [
        { name: 'Runzhu Liu', phone: '909-536-8448' },
        { name: 'Adelin Liu', phone: '909-536-8448' },
      ],
      leaseStart: '09/01/2025',
      leaseEnd: '08/31/2026',
    },
    {
      unitName: 'Unit #1A',
      rent: 2525,
      tenants: [
        { name: 'Judeline Valcourt', phone: '954-638-4232' },
        { name: 'Koffi Da…', phone: '954-638-4232' },
      ],
      leaseStart: '09/03/2025',
      leaseEnd: '09/02/2026',
    },
  ]),

  makeProperty('p6', '580 NE 171st St', 'North Miami Beach', 'FL', '33162', 'Miami-Dade', [
    {
      unitName: 'Main Unit',
      rent: 3400,
      tenants: [
        { name: 'Marie Louis', phone: '305-724-3078' },
        { name: 'Elysrael', phone: '305-724-3078' },
      ],
      leaseStart: '10/01/2025',
      leaseEnd: '09/30/2026',
    },
  ]),

  makeProperty('p7', '4073 SW 52nd St', 'Dania Beach', 'FL', '33314', 'Broward', [
    {
      unitName: 'Unit #5',
      rent: 2950,
      tenants: [
        { name: 'Albert Fischer Doscher', phone: '786-521-4303' },
        { name: 'Cheyenne Doscher', phone: '786-521-4303' },
      ],
      leaseStart: '07/01/2025',
      leaseEnd: '06/31/2026',
    },
    {
      unitName: 'Additional Unit',
      rent: 2700,
      tenants: [{ name: 'Shequonnia S. Cooper', phone: '305-502-1662' }],
      leaseStart: '04/01/2026',
      leaseEnd: '03/31/2027',
    },
  ]),

  makeProperty('p8', '440 South Park Rd #2-409', 'Hollywood', 'FL', '33021', 'Broward', [
    {
      unitName: 'Unit #2-409',
      rent: 2400,
      tenants: [{ name: 'Juan Marin', phone: '786-246-1693' }],
      leaseStart: '06/01/2026',
      leaseEnd: '05/31/2027',
    },
  ]),

  makeProperty('p9', '6313 Hayes St', 'Hollywood', 'FL', '', 'Broward', [
    {
      unitName: 'Main Unit',
      rent: 2950,
      tenants: [{ name: 'George Izarry', phone: '561-569-7867' }],
      leaseStart: '11/01/2025',
      leaseEnd: '10/31/2026',
    },
  ]),
]

export function buildSeedState(): AppState {
  return {
    properties: seedProperties,
    payments: [],
    repairs: [],
    vendors: [],
    documents: [],
    timeline: [],
    closedMonths: [],
  }
}
