import { NavLink, Route, Routes } from 'react-router-dom'
import { IconHome, IconBuilding, IconDollar, IconWrench, IconMore } from './components/Icon'
import Home from './screens/Home'
import Properties from './screens/Properties'
import PropertyDetail from './screens/PropertyDetail'
import Payments from './screens/Payments'
import Repairs from './screens/Repairs'
import More from './screens/More'
import Vendors from './screens/Vendors'

const NAV = [
  { to: '/', label: 'Home', Icon: IconHome, end: true },
  { to: '/properties', label: 'Properties', Icon: IconBuilding, end: false },
  { to: '/payments', label: 'Payments', Icon: IconDollar, end: false },
  { to: '/repairs', label: 'Repairs', Icon: IconWrench, end: false },
  { to: '/more', label: 'More', Icon: IconMore, end: false },
]

export default function App() {
  return (
    <div className="app">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/properties" element={<Properties />} />
        <Route path="/property/:id" element={<PropertyDetail />} />
        <Route path="/payments" element={<Payments />} />
        <Route path="/repairs" element={<Repairs />} />
        <Route path="/vendors" element={<Vendors />} />
        <Route path="/more" element={<More />} />
      </Routes>

      <nav className="bottom-nav">
        {NAV.map(({ to, label, Icon, end }) => (
          <NavLink key={to} to={to} end={end} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <span className="nav-ic">
              <Icon size={23} />
            </span>
            {label}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
