import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowLeft, Zap, AlertCircle, Briefcase, Clock, Star, XCircle,
  ExternalLink, Trash2, RefreshCw, Save, CheckCircle2,
  ChevronDown, ListChecks, Shield, Calendar
} from 'lucide-react'
import axios from 'axios'
import { useToast } from '../hooks/useToast'

const STATUS_OPTIONS = [
  { value: 'Applied', label: 'Applied', icon: Briefcase, color: 'blue' },
  { value: 'Interview', label: 'Interview', icon: Clock, color: 'purple' },
  { value: 'Offer', label: 'Offer', icon: Star, color: 'green' },
  { value: 'Rejected', label: 'Rejected', icon: XCircle, color: 'red' },
]

const STATUS_COLORS = {
  Applied: { bg: 'bg-blue-500/15', text: 'text-blue-300', border: 'border-blue-400/30' },
  Interview: { bg: 'bg-purple-500/15', text: 'text-purple-300', border: 'border-purple-400/30' },
  Offer: { bg: 'bg-green-500/15', text: 'text-green-300', border: 'border-green-400/30' },
  Rejected: { bg: 'bg-red-500/15', text: 'text-red-300', border: 'border-red-400/30' },
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
  })
}

export default function JobDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const [job, setJob] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notes, setNotes] = useState('')
  const [savingNotes, setSavingNotes] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [reanalyzing, setReanalyzing] = useState(false)
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false)

  useEffect(() => {
    fetchJob()
  }, [id])

  const fetchJob = async () => {
    try {
      const res = await axios.get(`/api/jobs/${id}`)
      setJob(res.data.data)
      setNotes(res.data.data.notes || '')
    } catch (error) {
      console.error('Failed to fetch job:', error)
      toast.error('Failed to load job details')
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (newStatus) => {
    try {
      const res = await axios.patch(`/api/jobs/${id}`, { status: newStatus })
      setJob(res.data.data)
      setStatusDropdownOpen(false)
      toast.success(`Status updated to ${newStatus}`)
    } catch (error) {
      toast.error('Failed to update status')
    }
  }

  const saveNotes = async () => {
    try {
      setSavingNotes(true)
      await axios.patch(`/api/jobs/${id}`, { notes })
      toast.success('Notes saved')
    } catch (error) {
      toast.error('Failed to save notes')
    } finally {
      setSavingNotes(false)
    }
  }

  const deleteJob = async () => {
    try {
      await axios.delete(`/api/jobs/${id}`)
      toast.success('Job deleted')
      navigate('/')
    } catch (error) {
      toast.error('Failed to delete job')
    }
  }

  const reanalyze = async () => {
    try {
      setReanalyzing(true)
      await axios.post('/api/analyze', {
        jobDescription: job.description,
        jobId: id,
      })
      await fetchJob()
      toast.success('AI re-analysis complete!')
    } catch (error) {
      const msg = error.response?.data?.error?.message || 'Re-analysis failed'
      toast.error(msg)
    } finally {
      setReanalyzing(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        >
          <Zap size={32} className="text-blue-400" />
        </motion.div>
      </div>
    )
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-400 mb-4">Job not found</p>
          <Link to="/" className="text-blue-400 hover:text-blue-300">
            Back to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  const statusColors = STATUS_COLORS[job.status] || STATUS_COLORS.Applied
  const hasAIData = (job.skills && job.skills.length > 0) || (job.redFlags && job.redFlags.length > 0)

  return (
    <div className="min-h-screen bg-slate-950 p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Back button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6"
        >
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm"
          >
            <ArrowLeft size={16} />
            Back to Dashboard
          </Link>
        </motion.div>

        {/* ─── Header Card ──────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-premium p-8 mb-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{job.title}</h1>
              <p className="text-xl text-slate-400 mb-3">{job.company}</p>
              <div className="flex items-center gap-3 text-sm text-slate-500">
                <span className="flex items-center gap-1">
                  <Calendar size={14} />
                  Added {formatDate(job.createdAt)}
                </span>
                {job.jobUrl && (
                  <a
                    href={job.jobUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    <ExternalLink size={14} />
                    View Posting
                  </a>
                )}
              </div>
            </div>

            {/* Status Dropdown */}
            <div className="relative">
              <button
                onClick={() => setStatusDropdownOpen(!statusDropdownOpen)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border
                  ${statusColors.bg} ${statusColors.text} ${statusColors.border}
                  hover:brightness-110 transition-all text-sm font-medium`}
              >
                {job.status}
                <ChevronDown size={16} className={`transition-transform ${statusDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {statusDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 w-48 bg-slate-800 border border-slate-700
                      rounded-lg shadow-xl shadow-black/30 overflow-hidden z-20"
                  >
                    {STATUS_OPTIONS.map(({ value, label, icon: Icon, color }) => {
                      const isActive = job.status === value
                      return (
                        <button
                          key={value}
                          onClick={() => updateStatus(value)}
                          className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors
                            ${isActive
                              ? 'bg-blue-600/15 text-blue-300'
                              : 'text-slate-300 hover:bg-slate-700'
                            }`}
                        >
                          <Icon size={16} />
                          {label}
                          {isActive && <CheckCircle2 size={14} className="ml-auto text-blue-400" />}
                        </button>
                      )
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-700">
            <button
              onClick={reanalyze}
              disabled={reanalyzing}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-slate-300 rounded-lg
                hover:bg-slate-700 hover:text-white transition-all text-sm font-medium
                disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <motion.div
                animate={reanalyzing ? { rotate: 360 } : {}}
                transition={reanalyzing ? { duration: 1, repeat: Infinity, ease: 'linear' } : {}}
              >
                <RefreshCw size={16} />
              </motion.div>
              {reanalyzing ? 'Re-analyzing...' : 'Re-Analyze with AI'}
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center gap-2 px-4 py-2 text-red-400 rounded-lg
                hover:bg-red-500/10 transition-all text-sm font-medium ml-auto"
            >
              <Trash2 size={16} />
              Delete
            </button>
          </div>
        </motion.div>

        {/* ─── AI not yet loaded indicator ─────────────────────────────── */}
        {!hasAIData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card-premium p-6 mb-6 border-amber-500/20"
          >
            <div className="flex items-center gap-3">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              >
                <Zap size={20} className="text-amber-400" />
              </motion.div>
              <div>
                <p className="text-amber-300 font-medium">AI is analyzing this job...</p>
                <p className="text-slate-500 text-sm">Skills, red flags, and responsibilities will appear shortly. Refresh to check.</p>
              </div>
              <button
                onClick={fetchJob}
                className="ml-auto px-3 py-1.5 bg-amber-500/10 text-amber-300 rounded-lg
                  hover:bg-amber-500/20 transition-colors text-sm font-medium"
              >
                Refresh
              </button>
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* ─── Red Flags ──────────────────────────────────────────────── */}
          {job.redFlags && job.redFlags.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="card-premium p-6 border-red-500/10"
            >
              <div className="flex items-center gap-2 text-red-300 mb-4">
                <Shield size={18} />
                <span className="font-semibold">Red Flags</span>
                <span className="ml-auto text-xs bg-red-500/20 px-2 py-0.5 rounded-full text-red-300">
                  {job.redFlags.length}
                </span>
              </div>
              <ul className="space-y-2">
                {job.redFlags.map((flag, idx) => (
                  <motion.li
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="flex items-start gap-2 text-sm"
                  >
                    <AlertCircle size={14} className="text-red-400 mt-0.5 flex-shrink-0" />
                    <span className="text-red-200">{flag}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          )}

          {/* ─── Skills ─────────────────────────────────────────────────── */}
          {job.skills && job.skills.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="card-premium p-6"
            >
              <div className="flex items-center gap-2 text-blue-300 mb-4">
                <Zap size={18} />
                <span className="font-semibold">Required Skills</span>
                <span className="ml-auto text-xs bg-blue-500/20 px-2 py-0.5 rounded-full text-blue-300">
                  {job.skills.length}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {job.skills.map((skill, idx) => (
                  <motion.span
                    key={idx}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.03 }}
                    className="px-3 py-1.5 rounded-full text-sm font-medium 
                      bg-blue-500/15 text-blue-300 border border-blue-400/20"
                  >
                    {skill}
                  </motion.span>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* ─── Experience ───────────────────────────────────────────────── */}
        {job.experience && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card-premium p-6 mb-6"
          >
            <h3 className="font-semibold text-white mb-2 flex items-center gap-2">
              <Briefcase size={18} className="text-purple-400" />
              Experience Required
            </h3>
            <p className="text-slate-300">{job.experience}</p>
          </motion.div>
        )}

        {/* ─── Responsibilities ─────────────────────────────────────────── */}
        {job.responsibilities && job.responsibilities.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="card-premium p-6 mb-6"
          >
            <div className="flex items-center gap-2 text-white mb-4">
              <ListChecks size={18} className="text-green-400" />
              <span className="font-semibold">Key Responsibilities</span>
            </div>
            <ul className="space-y-2">
              {job.responsibilities.map((resp, idx) => (
                <li key={idx} className="flex items-start gap-3 text-slate-300 text-sm">
                  <span className="text-green-400 mt-0.5 flex-shrink-0">•</span>
                  {resp}
                </li>
              ))}
            </ul>
          </motion.div>
        )}

        {/* ─── Notes ────────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card-premium p-6 mb-6"
        >
          <h3 className="font-semibold text-white mb-3">Your Notes</h3>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add personal notes about this application..."
            className="w-full h-32 bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 
              text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 
              resize-none text-sm transition-colors"
          />
          <div className="flex justify-end mt-3">
            <button
              onClick={saveNotes}
              disabled={savingNotes}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg
                hover:bg-blue-700 transition-all text-sm font-medium
                disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save size={14} />
              {savingNotes ? 'Saving...' : 'Save Notes'}
            </button>
          </div>
        </motion.div>

        {/* ─── Status History ───────────────────────────────────────────── */}
        {job.statusHistory && job.statusHistory.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="card-premium p-6 mb-6"
          >
            <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
              <Clock size={18} className="text-slate-400" />
              Status History
            </h3>
            <div className="space-y-3">
              {job.statusHistory.map((entry, idx) => {
                const colors = STATUS_COLORS[entry.status] || STATUS_COLORS.Applied
                return (
                  <div key={idx} className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${colors.bg.replace('/15', '')} ${colors.text}`} 
                      style={{ backgroundColor: 'currentColor' }} />
                    <span className={`text-sm font-medium ${colors.text}`}>{entry.status}</span>
                    <span className="text-xs text-slate-500 ml-auto">
                      {formatDate(entry.changedAt)}
                    </span>
                  </div>
                )
              })}
            </div>
          </motion.div>
        )}

        {/* ─── Delete Confirmation Modal ────────────────────────────────── */}
        <AnimatePresence>
          {showDeleteConfirm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setShowDeleteConfirm(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-slate-900 border border-slate-700 rounded-xl p-6 max-w-sm w-full shadow-2xl"
              >
                <h3 className="text-lg font-bold text-white mb-2">Delete Job?</h3>
                <p className="text-slate-400 text-sm mb-6">
                  This will permanently delete <strong className="text-white">{job.title}</strong> at {job.company}. 
                  This action cannot be undone.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1 px-4 py-2 bg-slate-800 text-slate-300 rounded-lg
                      hover:bg-slate-700 transition-colors font-medium text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={deleteJob}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg
                      hover:bg-red-700 transition-colors font-medium text-sm"
                  >
                    Delete
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
