import type { PropertyLinks } from './types'

// Generate real public-portal lookup links from a property's address.
// These are search/portal entry points — never fabricated parcel data.
export function buildLinks(address: string, city: string, state: string, zip: string, county?: string): PropertyLinks {
  const full = [address, city, state, zip].filter(Boolean).join(', ')
  const q = encodeURIComponent(full)
  const isMiamiDade = county === 'Miami-Dade'

  return {
    maps: `https://www.google.com/maps/search/?api=1&query=${q}`,
    zillow: `https://www.zillow.com/homes/${encodeURIComponent(full.replace(/,/g, ''))}_rb/`,
    appraiser: isMiamiDade
      ? 'https://www.miamidade.gov/Apps/PA/PropertySearch/#/'
      : 'https://web.bcpa.net/bcpaclient/#/Record-Search',
    taxPortal: isMiamiDade
      ? 'https://www.miamidade.county-taxes.com/public'
      : 'https://county-taxes.net/broward/property-tax',
    permits: `https://www.google.com/search?q=${encodeURIComponent(full + ' building permit records')}`,
    codeViolations: `https://www.google.com/search?q=${encodeURIComponent(full + ' code violations')}`,
  }
}

export const LINK_LABELS: Record<keyof PropertyLinks, string> = {
  maps: 'Google Maps',
  zillow: 'Zillow',
  appraiser: 'Property Appraiser',
  taxPortal: 'Property Tax Portal',
  permits: 'Permit Search',
  codeViolations: 'Code Violations',
}
