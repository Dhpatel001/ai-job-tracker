import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  CheckCircle2, AlertCircle, Briefcase, XCircle, 
  TrendingUp, Clock, Star, Zap, Search, Calendar,
  ChevronRight
} from 'lucide-react'
import axios from 'axios'

const STATUS_CONFIG = {
  'Applied': { icon: Briefcase, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-400/30', gradient: 'from-blue-500/20 to-blue-500/5' },
  'Interview': { icon: Clock, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-400/30', gradient: 'from-purple-500/20 to-purple-500/5' },
  'Offer': { icon: Star, color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-400/30', gradient: 'from-green-500/20 to-green-500/5' },
  'Rejected': { icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-400/30', gradient: 'from-red-500/20 to-red-500/5' },
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.2,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      damping: 25,
      stiffness: 300,
    },
  },
}

function formatDate(dateStr) {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now - date
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default function Dashboard() {
  const [jobs, setJobs] = useState([])
  const [stats, setStats] = useState({})
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchData()
  }, [filter])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [jobsRes, statsRes] = await Promise.all([
        axios.get('/api/jobs', { params: filter && { status: filter } }),
        axios.get('/api/jobs/stats'),
      ])
      setJobs(jobsRes.data.jobs)
      setStats(statsRes.data.data)
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Client-side search filter
  const filteredJobs = useMemo(() => {
    if (!search.trim()) return jobs
    const q = search.toLowerCase()
    return jobs.filter(
      (job) =>
        job.title.toLowerCase().includes(q) ||
        job.company.toLowerCase().includes(q)
    )
  }, [jobs, search])

  const statCards = [
    { label: 'Applied', count: stats['Applied'] || 0, icon: Briefcase, color: 'blue', statusKey: 'Applied' },
    { label: 'Interviews', count: stats['Interview'] || 0, icon: Clock, color: 'purple', statusKey: 'Interview' },
    { label: 'Offers', count: stats['Offer'] || 0, icon: Star, color: 'green', statusKey: 'Offer' },
    { label: 'Rejected', count: stats['Rejected'] || 0, icon: XCircle, color: 'red', statusKey: 'Rejected' },
  ]

  const handleStatClick = (statusKey) => {
    setFilter(filter === statusKey ? null : statusKey)
  }

  return (
    <div className="min-h-screen bg-slate-950 p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* ─── Header ──────────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
            Your Campaign Dashboard
          </h1>
          <p className="text-slate-400 text-lg">
            {stats.total || 0} jobs tracked • AI-powered insights
          </p>
        </motion.div>

        {/* ─── Stats Cards (clickable) ────────────────────────────────────── */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          {statCards.map((stat) => {
            const Icon = stat.icon
            const isSelected = filter === stat.statusKey
            const colorClass = {
              blue: 'from-blue-500/20 to-blue-500/5',
              purple: 'from-purple-500/20 to-purple-500/5',
              green: 'from-green-500/20 to-green-500/5',
              red: 'from-red-500/20 to-red-500/5',
            }[stat.color]

            const iconBg = {
              blue: 'bg-blue-500/20',
              purple: 'bg-purple-500/20',
              green: 'bg-green-500/20',
              red: 'bg-red-500/20',
            }[stat.color]

            const iconColor = {
              blue: 'text-blue-400',
              purple: 'text-purple-400',
              green: 'text-green-400',
              red: 'text-red-400',
            }[stat.color]

            return (
              <motion.button
                key={stat.label}
                variants={itemVariants}
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => handleStatClick(stat.statusKey)}
                className={`card-premium p-6 bg-gradient-to-br ${colorClass} text-left transition-all
                  ${isSelected ? 'ring-2 ring-blue-500/50 border-blue-500/30' : ''}`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-lg ${iconBg}`}>
                    <Icon size={24} className={iconColor} />
                  </div>
                  <TrendingUp size={18} className="text-slate-600" />
                </div>
                <p className="text-slate-400 text-sm mb-1">{stat.label}</p>
                <p className="text-3xl font-bold text-white">{stat.count}</p>
              </motion.button>
            )
          })}
        </motion.div>

        {/* ─── Search + Filters ───────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="flex flex-col sm:flex-row gap-4 mb-8"
        >
          {/* Search bar */}
          <div className="relative flex-1">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search by title or company..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg
                text-white placeholder-slate-500 focus:outline-none focus:border-blue-500
                transition-colors"
            />
          </div>

          {/* Status filters */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter(null)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === null
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              All Jobs
            </button>
            {Object.keys(STATUS_CONFIG).map((status) => (
              <button
                key={status}
                onClick={() => setFilter(filter === status ? null : status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  filter === status
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </motion.div>

        {/* ─── Job Cards ───────────────────────────────────────────────────── */}
        {loading ? (
          <div className="text-center py-12">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="inline-block"
            >
              <Zap size={32} className="text-blue-400" />
            </motion.div>
            <p className="mt-4 text-slate-400">Loading jobs...</p>
          </div>
        ) : filteredJobs.length === 0 ? (
          <motion.div
            variants={itemVariants}
            initial="hidden"
            animate="show"
            className="card-premium p-12 text-center"
          >
            {search ? (
              <>
                <Search size={48} className="mx-auto text-slate-600 mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No results found</h3>
                <p className="text-slate-400 mb-6">No jobs match "{search}"</p>
                <button
                  onClick={() => setSearch('')}
                  className="inline-block px-6 py-2 bg-slate-700 text-white rounded-lg 
                    hover:bg-slate-600 transition-all"
                >
                  Clear Search
                </button>
              </>
            ) : (
              <>
                <Briefcase size={48} className="mx-auto text-slate-600 mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No jobs yet</h3>
                <p className="text-slate-400 mb-6">Add your first job to get started with AI-powered tracking</p>
                <Link
                  to="/add"
                  className="inline-block px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 
                    text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-blue-600/20 transition-all"
                >
                  Add Your First Job
                </Link>
              </>
            )}
          </motion.div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="space-y-3"
          >
            {filteredJobs.map((job) => {
              const config = STATUS_CONFIG[job.status] || STATUS_CONFIG['Applied']
              const StatusIcon = config.icon

              return (
                <motion.div
                  key={job._id}
                  variants={itemVariants}
                  whileHover={{ y: -2 }}
                  className="card-premium group"
                >
                  <Link to={`/job/${job._id}`} className="block p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="text-lg font-semibold text-white truncate">
                            {job.title}
                          </h3>
                          <ChevronRight size={16} className="text-slate-600 group-hover:text-blue-400 
                            transition-colors flex-shrink-0" />
                        </div>
                        <div className="flex items-center gap-3 text-slate-400">
                          <span>{job.company}</span>
                          {job.createdAt && (
                            <>
                              <span className="text-slate-600">•</span>
                              <span className="flex items-center gap-1 text-sm">
                                <Calendar size={13} />
                                {formatDate(job.createdAt)}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className={`p-2 rounded-lg ${config.bg} border ${config.border} flex-shrink-0`}>
                        <StatusIcon size={20} className={config.color} />
                      </div>
                    </div>

                    {/* Red Flags */}
                    {job.redFlags && job.redFlags.length > 0 && (
                      <div className="mb-3 flex flex-wrap gap-2">
                        {job.redFlags.slice(0, 2).map((flag, idx) => (
                          <span
                            key={idx}
                            className="red-flag"
                          >
                            <AlertCircle className="inline mr-1" size={12} />
                            {flag}
                          </span>
                        ))}
                        {job.redFlags.length > 2 && (
                          <span className="red-flag">
                            +{job.redFlags.length - 2} more
                          </span>
                        )}
                      </div>
                    )}

                    {/* Skills */}
                    {job.skills && job.skills.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {job.skills.slice(0, 4).map((skill, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 rounded-full text-xs font-medium 
                              bg-slate-800 text-slate-300 border border-slate-700"
                          >
                            {skill}
                          </span>
                        ))}
                        {job.skills.length > 4 && (
                          <span className="px-3 py-1 rounded-full text-xs font-medium 
                            bg-slate-800 text-slate-400">
                            +{job.skills.length - 4}
                          </span>
                        )}
                      </div>
                    )}
                  </Link>
                </motion.div>
              )
            })}
          </motion.div>
        )}
      </div>
    </div>
  )
}
