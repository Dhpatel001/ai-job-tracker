import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X, Plus, BarChart3, Sparkles, Search } from 'lucide-react'

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: BarChart3 },
  { to: '/add', label: 'Add Job', icon: Plus },
  { to: '/resume-search', label: 'Job Search', icon: Search },
]

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/'
    return location.pathname.startsWith(path)
  }

  return (
    <div className="flex h-screen bg-slate-950">
      {/* ─── Sidebar ──────────────────────────────────────────────────────── */}
      <aside
        className={`fixed left-0 top-0 h-screen w-64 bg-slate-900 border-r border-slate-700 z-40
          transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:relative lg:block`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-slate-700">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 
                flex items-center justify-center shadow-lg shadow-blue-500/20
                group-hover:shadow-blue-500/40 transition-shadow">
                <BarChart3 size={18} className="text-white" />
              </div>
              <div>
                <span className="text-lg font-bold text-white">JobTracker</span>
                <div className="flex items-center gap-1">
                  <Sparkles size={10} className="text-purple-400" />
                  <span className="text-[10px] text-slate-500 font-medium tracking-wide uppercase">AI Powered</span>
                </div>
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-200
                  ${isActive(to)
                    ? 'bg-blue-600/15 text-blue-400 border border-blue-500/20'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white border border-transparent'
                  }`}
              >
                <Icon size={20} />
                <span>{label}</span>
                {isActive(to) && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-400" />
                )}
              </Link>
            ))}
          </nav>

          {/* Footer */}
          <div className="p-6 border-t border-slate-700">
            <p className="text-xs text-slate-500">v1.0.0 • AI Powered</p>
            <p className="text-[10px] text-slate-600 mt-1">Gemini 2.5 Flash</p>
          </div>
        </div>

        {/* Close button for mobile */}
        <button
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden absolute top-4 right-4 p-2 hover:bg-slate-800 rounded-lg text-slate-400"
        >
          <X size={20} />
        </button>
      </aside>

      {/* ─── Main Content ─────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Navbar */}
        <nav className="sticky top-0 border-b border-slate-700 bg-slate-900/50 backdrop-blur-md z-30">
          <div className="px-6 py-4 flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 hover:bg-slate-800 rounded-lg text-slate-300"
            >
              <Menu size={20} />
            </button>
            <h1 className="text-xl font-semibold text-white hidden sm:block">
              Job Application Tracker
            </h1>
            <div className="w-8" /> {/* Spacer for mobile centering */}
          </div>
        </nav>

        {/* Content Area */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/50 z-30 lg:hidden transition-opacity"
        />
      )}
    </div>
  )
}
