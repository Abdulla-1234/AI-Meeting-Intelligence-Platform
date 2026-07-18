import { Link, useLocation } from 'react-router-dom'

export default function Navbar() {
  const loc = useLocation()

  const navLink = (to, label) => (
    <Link to={to} className={`text-sm px-3 py-1.5 rounded-md transition-colors ${
      loc.pathname === to
        ? 'bg-purple-600 text-white'
        : 'text-gray-400 hover:text-white'
    }`}>
      {label}
    </Link>
  )

  return (
    <nav style={{background:'#111110',borderBottom:'1px solid #252523'}}
         className="sticky top-0 z-20 px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-7 h-7 rounded-lg bg-purple-600 grid place-items-center text-white font-bold text-sm">
          M
        </div>
        <span className="font-semibold text-white">MeetingAI</span>
        <span className="text-xs px-2 py-0.5 rounded" style={{background:'#1a1a18',color:'#6b6b66',border:'1px solid #252523'}}>
          v1.0 · AI powered
        </span>
      </div>
      <div className="flex items-center gap-2">
        {navLink('/', 'Meetings')}
        {navLink('/action-items', 'Action Items')}
      </div>
    </nav>
  )
}