# Gal Properties

> The iPhone of our properties — a private, calm, premium control center for Gal & Nadav's real estate portfolio.

A mobile-first property management **PWA** built for personal/family use. Not a SaaS, not a CRM — a beautiful, native-feeling iPhone app for managing real rental properties: rent collection, repairs, vendors, documents, leases and monthly closing.

## Tech

- **React + TypeScript + Vite**
- **vite-plugin-pwa** (installable, offline-capable service worker)
- **localStorage** persistence (all data lives on-device; export a JSON backup anytime)
- No backend, no accounts — fully private

## Run it

```bash
npm install
npm run dev       # local dev server
npm run build     # production build → dist/
npm run preview   # preview the production build
```

Open on your iPhone, then **Share → Add to Home Screen** to install it like a native app.

## What's inside

- **Home** — time-aware greeting ("Good evening Gal"), smart portfolio summary, dashboard metrics (expected rent, collected, remaining, open repairs, leases ending), a "needs attention" feed and a per-property status list.
- **Properties** — premium image cards with rent, units, status & health; search by address / tenant / phone; filters (paid / partial / unpaid / open repairs / lease ending).
- **Property detail** — tabbed: Overview (health score, county/city links, notes), Units (tenants, lease dates, call / WhatsApp / edit), Payments, Repairs, Vendors, Documents, Timeline.
- **Payments** — per-unit, per-month **Paid / Partial / Not Paid** with an iOS bottom-sheet for partial payments (auto-computed remaining balance, date, method, notes). Soft green / amber / red status colors.
- **Repairs** — repair cards with status, vendor, cost, before/after photos, invoice placeholder.
- **Vendors** — trusted vendors with rating, jobs completed, average cost, properties worked on.
- **Documents** — lease, insurance, tax, invoice, permit, HOA, eviction, photo placeholders.
- **Timeline** — automatic activity feed per property.
- **Monthly Closing** ("Close Month") — expected vs collected, expenses, repair costs, net estimate, unpaid tenants, with an exportable summary.

## Data integrity

The app is seeded **only** with the real portfolio data provided. No fake properties, tenants, or addresses are ever invented. Unknown values surface as **"Missing" / "Add info"** rather than being filled in. Everything is editable, and properties / units / tenants can be added or removed.

Use **More → Reset to seed data** to restore the original portfolio, or **Export data** for a JSON backup.

## Data models

`Property · Unit · Tenant · Payment · Repair · Vendor · Document · TimelineEvent · MonthlySummary`

See [`src/lib/types.ts`](src/lib/types.ts).
