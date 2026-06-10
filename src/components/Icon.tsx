type IconProps = { size?: number; className?: string }

const s = (size = 22) => ({ width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.9, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const })

export const IconHome = ({ size, className }: IconProps) => (
  <svg {...s(size)} className={className}><path d="M3 10.5 12 3l9 7.5" /><path d="M5 9.5V20a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9.5" /><path d="M9.5 21v-6h5v6" /></svg>
)
export const IconBuilding = ({ size, className }: IconProps) => (
  <svg {...s(size)} className={className}><rect x="4" y="3" width="16" height="18" rx="2" /><path d="M9 7h2M13 7h2M9 11h2M13 11h2M9 15h2M13 15h2" /><path d="M10 21v-3h4v3" /></svg>
)
export const IconDollar = ({ size, className }: IconProps) => (
  <svg {...s(size)} className={className}><path d="M12 2v20" /><path d="M17 6.5c0-1.9-2-3-5-3s-5 1.1-5 3 2 2.6 5 3.5 5 1.6 5 3.5-2 3-5 3-5-1.1-5-3" /></svg>
)
export const IconWrench = ({ size, className }: IconProps) => (
  <svg {...s(size)} className={className}><path d="M14.5 5.5a3.5 3.5 0 0 0-4.6 4.3L4 15.7 8.3 20l5.9-5.9a3.5 3.5 0 0 0 4.3-4.6l-2.3 2.3-2-2 2.3-2.3Z" /></svg>
)
export const IconMore = ({ size, className }: IconProps) => (
  <svg {...s(size)} className={className}><circle cx="5" cy="12" r="1.6" /><circle cx="12" cy="12" r="1.6" /><circle cx="19" cy="12" r="1.6" /></svg>
)
export const IconChevron = ({ size, className }: IconProps) => (
  <svg {...s(size)} className={className}><path d="m9 6 6 6-6 6" /></svg>
)
export const IconPhone = ({ size, className }: IconProps) => (
  <svg {...s(size)} className={className}><path d="M5 4h3l1.5 4-2 1.5a11 11 0 0 0 5 5l1.5-2 4 1.5v3a1.5 1.5 0 0 1-1.6 1.5A15 15 0 0 1 3.5 5.6 1.5 1.5 0 0 1 5 4Z" /></svg>
)
export const IconChat = ({ size, className }: IconProps) => (
  <svg {...s(size)} className={className}><path d="M21 11.5a8.5 8.5 0 0 1-12.3 7.6L3 21l1.9-5.7A8.5 8.5 0 1 1 21 11.5Z" /></svg>
)
export const IconEdit = ({ size, className }: IconProps) => (
  <svg {...s(size)} className={className}><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" /></svg>
)
export const IconPlus = ({ size, className }: IconProps) => (
  <svg {...s(size)} className={className}><path d="M12 5v14M5 12h14" /></svg>
)
export const IconSearch = ({ size, className }: IconProps) => (
  <svg {...s(size)} className={className}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.2-3.2" /></svg>
)
export const IconExternal = ({ size, className }: IconProps) => (
  <svg {...s(size)} className={className}><path d="M14 4h6v6" /><path d="M20 4 10 14" /><path d="M19 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5" /></svg>
)
export const IconCheck = ({ size, className }: IconProps) => (
  <svg {...s(size)} className={className}><path d="m5 12 5 5L20 6" /></svg>
)
export const IconClose = ({ size, className }: IconProps) => (
  <svg {...s(size)} className={className}><path d="M6 6 18 18M18 6 6 18" /></svg>
)
export const IconDoc = ({ size, className }: IconProps) => (
  <svg {...s(size)} className={className}><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8Z" /><path d="M14 3v5h5" /></svg>
)
export const IconBell = ({ size, className }: IconProps) => (
  <svg {...s(size)} className={className}><path d="M18 8a6 6 0 0 0-12 0c0 7-3 8-3 8h18s-3-1-3-8" /><path d="M13.7 21a2 2 0 0 1-3.4 0" /></svg>
)
export const IconMap = ({ size, className }: IconProps) => (
  <svg {...s(size)} className={className}><path d="M12 21s7-6 7-11a7 7 0 1 0-14 0c0 5 7 11 7 11Z" /><circle cx="12" cy="10" r="2.5" /></svg>
)
export const IconTrash = ({ size, className }: IconProps) => (
  <svg {...s(size)} className={className}><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" /></svg>
)
export const IconCamera = ({ size, className }: IconProps) => (
  <svg {...s(size)} className={className}><path d="M4 8h3l1.5-2h7L17 8h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1Z" /><circle cx="12" cy="13" r="3.2" /></svg>
)
export const IconCalendar = ({ size, className }: IconProps) => (
  <svg {...s(size)} className={className}><rect x="3.5" y="5" width="17" height="16" rx="2" /><path d="M3.5 9.5h17M8 3v4M16 3v4" /></svg>
)
