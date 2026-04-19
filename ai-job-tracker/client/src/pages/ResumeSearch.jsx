import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Upload, FileText, Zap, Search, MapPin, Briefcase, ExternalLink,
  Building2, Clock, DollarSign, X, Filter, Globe, ChevronDown,
  Sparkles, Plus, CheckCircle2, AlertCircle, RefreshCw
} from 'lucide-react'
import axios from 'axios'
import { useToast } from '../hooks/useToast'

const EMPLOYMENT_TYPES = [
  { value: '', label: 'All Types' },
  { value: 'FULLTIME', label: 'Full-time' },
  { value: 'PARTTIME', label: 'Part-time' },
  { value: 'CONTRACTOR', label: 'Contract' },
  { value: 'INTERN', label: 'Internship' },
]

const DATE_FILTERS = [
  { value: 'all', label: 'Any time' },
  { value: 'today', label: 'Today' },
  { value: '3days', label: 'Last 3 days' },
  { value: 'week', label: 'This week' },
  { value: 'month', label: 'This month' },
]

function formatDate(dateStr) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now - date
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays}d ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default function ResumeSearch() {
  const toast = useToast()
  const fileInputRef = useRef(null)

  // States
  const [step, setStep] = useState('upload') // 'upload' | 'skills' | 'results'
  const [uploading, setUploading] = useState(false)
  const [searching, setSearching] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [fileName, setFileName] = useState('')
  const [savingJobId, setSavingJobId] = useState(null)

  // Resume analysis data
  const [resumeData, setResumeData] = useState(null)
  const [selectedSkills, setSelectedSkills] = useState([])
  const [searchQueries, setSearchQueries] = useState([])

  // Search filters
  const [location, setLocation] = useState('')
  const [remoteOnly, setRemoteOnly] = useState(false)
  const [datePosted, setDatePosted] = useState('month')
  const [employmentType, setEmploymentType] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  // Results
  const [jobs, setJobs] = useState([])
  const [totalFound, setTotalFound] = useState(0)

  // ─── Upload Handler ──────────────────────────────────────────────
  const handleUpload = useCallback(async (file) => {
    if (!file) return

    if (file.type !== 'application/pdf') {
      toast.error('Only PDF files are accepted')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File too large. Maximum size is 5MB')
      return
    }

    setFileName(file.name)
    setUploading(true)

    try {
      const formData = new FormData()
      formData.append('resume', file)

      const res = await axios.post('/api/resume/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      const data = res.data.data
      setResumeData(data)
      setSelectedSkills(data.skills || [])
      setSearchQueries(data.top_search_queries || data.preferred_roles || [])
      setStep('skills')
      toast.success('Resume analyzed successfully!')
    } catch (error) {
      const msg = error.response?.data?.error?.message || 'Failed to analyze resume'
      toast.error(msg)
    } finally {
      setUploading(false)
    }
  }, [toast])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    handleUpload(file)
  }, [handleUpload])

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    handleUpload(file)
  }

  // ─── Search Handler ──────────────────────────────────────────────
  const handleSearch = async () => {
    if (searchQueries.length === 0) {
      toast.error('No search queries available')
      return
    }

    setSearching(true)
    setStep('results')

    try {
      const res = await axios.post('/api/resume/search', {
        queries: searchQueries,
        location,
        remoteOnly,
        datePosted,
        employmentType,
      })

      setJobs(res.data.data.jobs || [])
      setTotalFound(res.data.data.totalFound || 0)

      if (res.data.data.jobs.length === 0) {
        toast.info('No jobs found. Try adjusting your filters.')
      } else {
        toast.success(`Found ${res.data.data.jobs.length} matching jobs!`)
      }
    } catch (error) {
      const msg = error.response?.data?.error?.message || 'Job search failed'
      toast.error(msg)
    } finally {
      setSearching(false)
    }
  }

  // ─── Save Job to Tracker ─────────────────────────────────────────
  const saveToTracker = async (job) => {
    try {
      setSavingJobId(job.id)
      await axios.post('/api/jobs', {
        title: job.title,
        company: job.company,
        description: job.description || `Job found via resume search on ${job.source}. Apply at: ${job.applyLink}`,
        jobUrl: job.applyLink || '',
      })
      toast.success(`"${job.title}" saved to tracker!`)
    } catch (error) {
      toast.error('Failed to save job')
    } finally {
      setSavingJobId(null)
    }
  }

  // ─── Skill Toggle ────────────────────────────────────────────────
  const toggleSkill = (skill) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 p-6 md:p-8">
      <div className="max-w-5xl mx-auto">

        {/* ─── STEP 1: Upload ────────────────────────────────────────── */}
        <AnimatePresence mode="wait">
          {step === 'upload' && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="text-center mb-10">
                <motion.div
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  className="inline-flex items-center gap-2 px-4 py-1.5 bg-purple-500/10 border border-purple-400/20 
                    rounded-full text-purple-300 text-sm font-medium mb-4"
                >
                  <Sparkles size={14} />
                  AI-Powered Job Search
                </motion.div>
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
                  Find Your Perfect Job
                </h1>
                <p className="text-slate-400 text-lg max-w-xl mx-auto">
                  Upload your resume and our AI will find matching jobs across LinkedIn, Indeed, Glassdoor, and more
                </p>
              </div>

              {/* Upload Zone */}
              <motion.div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                whileHover={{ scale: 1.01 }}
                className={`card-premium p-12 md:p-16 text-center cursor-pointer transition-all
                  ${dragOver
                    ? 'border-blue-400 bg-blue-500/5 shadow-lg shadow-blue-500/10'
                    : 'hover:border-slate-600'
                  }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {uploading ? (
                  <div className="space-y-4">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                      className="inline-block"
                    >
                      <Zap size={48} className="text-blue-400" />
                    </motion.div>
                    <p className="text-white font-semibold text-lg">Analyzing your resume...</p>
                    <p className="text-slate-400 text-sm">Extracting skills, experience, and preferences</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className={`inline-flex p-4 rounded-2xl transition-colors
                      ${dragOver ? 'bg-blue-500/20' : 'bg-slate-800'}`}>
                      <Upload size={40} className={dragOver ? 'text-blue-400' : 'text-slate-500'} />
                    </div>
                    <div>
                      <p className="text-white font-semibold text-lg mb-1">
                        Drop your resume here
                      </p>
                      <p className="text-slate-400 text-sm">
                        or <span className="text-blue-400 hover:text-blue-300">click to browse</span> • PDF only, max 5MB
                      </p>
                    </div>
                  </div>
                )}
              </motion.div>

              {/* How it works */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                {[
                  { icon: FileText, title: 'Upload Resume', desc: 'Drop your PDF resume' },
                  { icon: Sparkles, title: 'AI Analysis', desc: 'Gemini extracts your skills' },
                  { icon: Search, title: 'Find Jobs', desc: 'Search across all platforms' },
                ].map((item, idx) => (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + idx * 0.1 }}
                    className="flex items-center gap-3 p-4 rounded-lg bg-slate-900/50 border border-slate-800"
                  >
                    <div className="p-2 rounded-lg bg-blue-500/10">
                      <item.icon size={20} className="text-blue-400" />
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">{item.title}</p>
                      <p className="text-slate-500 text-xs">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* ─── STEP 2: Skills Review ──────────────────────────────── */}
          {step === 'skills' && resumeData && (
            <motion.div
              key="skills"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {/* Resume Summary */}
              <div className="card-premium p-6 mb-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <CheckCircle2 size={18} className="text-green-400" />
                      <span className="text-green-300 text-sm font-medium">Resume Analyzed</span>
                    </div>
                    <h2 className="text-2xl font-bold text-white">{resumeData.name}</h2>
                    <p className="text-slate-400 mt-1">{resumeData.summary}</p>
                  </div>
                  <button
                    onClick={() => { setStep('upload'); setResumeData(null) }}
                    className="text-slate-500 hover:text-slate-300 p-2"
                  >
                    <X size={18} />
                  </button>
                </div>
                <div className="flex flex-wrap gap-3 text-sm text-slate-400">
                  <span className="flex items-center gap-1">
                    <Briefcase size={14} />
                    {resumeData.experience_years} years experience
                  </span>
                  <span className="flex items-center gap-1">
                    <FileText size={14} />
                    {fileName}
                  </span>
                </div>
              </div>

              {/* Preferred Roles */}
              <div className="card-premium p-6 mb-6">
                <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                  <Sparkles size={16} className="text-purple-400" />
                  AI-Suggested Roles
                </h3>
                <div className="flex flex-wrap gap-2">
                  {resumeData.preferred_roles.map((role, idx) => (
                    <span key={idx} className="px-3 py-1.5 rounded-full text-sm font-medium 
                      bg-purple-500/15 text-purple-300 border border-purple-400/20">
                      {role}
                    </span>
                  ))}
                </div>
              </div>

              {/* Skills */}
              <div className="card-premium p-6 mb-6">
                <h3 className="text-white font-semibold mb-1 flex items-center gap-2">
                  <Zap size={16} className="text-blue-400" />
                  Extracted Skills
                </h3>
                <p className="text-slate-500 text-sm mb-4">
                  Click skills to include/exclude them from the search
                </p>
                <div className="flex flex-wrap gap-2">
                  {resumeData.skills.map((skill) => {
                    const isSelected = selectedSkills.includes(skill)
                    return (
                      <button
                        key={skill}
                        onClick={() => toggleSkill(skill)}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all
                          ${isSelected
                            ? 'bg-blue-500/20 text-blue-300 border border-blue-400/30'
                            : 'bg-slate-800 text-slate-500 border border-slate-700 line-through'
                          }`}
                      >
                        {skill}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Search Filters */}
              <div className="card-premium p-6 mb-6">
                <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                  <Filter size={16} className="text-amber-400" />
                  Search Preferences
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Location */}
                  <div>
                    <label className="flex items-center gap-2 text-sm text-slate-400 mb-2">
                      <MapPin size={14} />
                      Location
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Bangalore, India"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      disabled={remoteOnly}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5
                        text-white placeholder-slate-500 focus:outline-none focus:border-blue-500
                        transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    />
                  </div>

                  {/* Remote Toggle */}
                  <div>
                    <label className="flex items-center gap-2 text-sm text-slate-400 mb-2">
                      <Globe size={14} />
                      Remote
                    </label>
                    <button
                      onClick={() => setRemoteOnly(!remoteOnly)}
                      className={`w-full px-4 py-2.5 rounded-lg text-sm font-medium transition-all border
                        ${remoteOnly
                          ? 'bg-green-500/15 text-green-300 border-green-400/30'
                          : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
                        }`}
                    >
                      {remoteOnly ? '✓ Remote Only' : 'Include All Locations'}
                    </button>
                  </div>

                  {/* Employment Type */}
                  <div>
                    <label className="flex items-center gap-2 text-sm text-slate-400 mb-2">
                      <Briefcase size={14} />
                      Employment Type
                    </label>
                    <select
                      value={employmentType}
                      onChange={(e) => setEmploymentType(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5
                        text-white focus:outline-none focus:border-blue-500 transition-colors"
                    >
                      {EMPLOYMENT_TYPES.map((t) => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Date Posted */}
                  <div>
                    <label className="flex items-center gap-2 text-sm text-slate-400 mb-2">
                      <Clock size={14} />
                      Date Posted
                    </label>
                    <select
                      value={datePosted}
                      onChange={(e) => setDatePosted(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5
                        text-white focus:outline-none focus:border-blue-500 transition-colors"
                    >
                      {DATE_FILTERS.map((d) => (
                        <option key={d.value} value={d.value}>{d.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Search Button */}
              <button
                onClick={handleSearch}
                disabled={searching}
                className="w-full flex items-center justify-center gap-2 px-6 py-4
                  bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-lg rounded-xl
                  hover:shadow-lg hover:shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed
                  transition-all"
              >
                {searching ? (
                  <>
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                      <Search size={22} />
                    </motion.div>
                    Searching across job platforms...
                  </>
                ) : (
                  <>
                    <Search size={22} />
                    Search Jobs
                  </>
                )}
              </button>
            </motion.div>
          )}

          {/* ─── STEP 3: Results ────────────────────────────────────── */}
          {step === 'results' && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {/* Results Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-white mb-1">Job Results</h1>
                  <p className="text-slate-400">
                    {searching ? 'Searching...' : `${totalFound} jobs found across multiple platforms`}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setStep('skills')}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-slate-300 rounded-lg
                      hover:bg-slate-700 transition-colors text-sm font-medium"
                  >
                    <Filter size={16} />
                    Edit Filters
                  </button>
                  <button
                    onClick={handleSearch}
                    disabled={searching}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg
                      hover:bg-blue-700 transition-colors text-sm font-medium
                      disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <RefreshCw size={16} className={searching ? 'animate-spin' : ''} />
                    Refresh
                  </button>
                </div>
              </div>

              {/* Loading */}
              {searching && (
                <div className="text-center py-16">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    className="inline-block mb-4"
                  >
                    <Zap size={40} className="text-blue-400" />
                  </motion.div>
                  <p className="text-white font-medium">Searching LinkedIn, Indeed, Glassdoor...</p>
                  <p className="text-slate-500 text-sm mt-1">This may take a few seconds</p>
                </div>
              )}

              {/* No Results */}
              {!searching && jobs.length === 0 && (
                <div className="card-premium p-12 text-center">
                  <Search size={48} className="mx-auto text-slate-600 mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">No jobs found</h3>
                  <p className="text-slate-400 mb-6">
                    Try adjusting your filters or search queries
                  </p>
                  <button
                    onClick={() => setStep('skills')}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
                  >
                    Edit Search Filters
                  </button>
                </div>
              )}

              {/* Job Cards */}
              {!searching && jobs.length > 0 && (
                <div className="space-y-4">
                  {jobs.map((job, idx) => (
                    <motion.div
                      key={job.id || idx}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="card-premium p-6 group"
                    >
                      <div className="flex items-start gap-4">
                        {/* Company Logo */}
                        <div className="w-12 h-12 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center flex-shrink-0 overflow-hidden">
                          {job.companyLogo ? (
                            <img src={job.companyLogo} alt={job.company} className="w-full h-full object-cover rounded-lg" />
                          ) : (
                            <Building2 size={24} className="text-slate-600" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          {/* Title & Company */}
                          <h3 className="text-lg font-semibold text-white mb-1 truncate">
                            {job.title}
                          </h3>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-400 mb-3">
                            <span className="flex items-center gap-1">
                              <Building2 size={13} />
                              {job.company}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin size={13} />
                              {job.isRemote ? '🌍 Remote' : job.location}
                            </span>
                            {job.salary && (
                              <span className="flex items-center gap-1 text-green-400">
                                <DollarSign size={13} />
                                {job.salary}
                              </span>
                            )}
                            {job.postedAt && (
                              <span className="flex items-center gap-1">
                                <Clock size={13} />
                                {formatDate(job.postedAt)}
                              </span>
                            )}
                          </div>

                          {/* Tags */}
                          <div className="flex flex-wrap gap-2 mb-3">
                            {job.employmentType && job.employmentType !== 'Unknown' && (
                              <span className="px-2 py-0.5 rounded text-xs font-medium bg-blue-500/15 text-blue-300 border border-blue-400/20">
                                {job.employmentType}
                              </span>
                            )}
                            {job.isRemote && (
                              <span className="px-2 py-0.5 rounded text-xs font-medium bg-green-500/15 text-green-300 border border-green-400/20">
                                Remote
                              </span>
                            )}
                            <span className="px-2 py-0.5 rounded text-xs font-medium bg-slate-700 text-slate-400">
                              via {job.source}
                            </span>
                          </div>

                          {/* Description preview */}
                          {job.description && (
                            <p className="text-sm text-slate-500 line-clamp-2 mb-3">
                              {job.description}
                            </p>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col gap-2 flex-shrink-0">
                          {job.applyLink && (
                            <a
                              href={job.applyLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg
                                hover:bg-blue-700 transition-all text-sm font-medium"
                            >
                              <ExternalLink size={14} />
                              Apply
                            </a>
                          )}
                          <button
                            onClick={() => saveToTracker(job)}
                            disabled={savingJobId === job.id}
                            className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-slate-300 rounded-lg
                              hover:bg-slate-700 transition-all text-sm font-medium
                              disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Plus size={14} />
                            {savingJobId === job.id ? 'Saving...' : 'Track'}
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Start Over */}
              {!searching && (
                <div className="text-center mt-8">
                  <button
                    onClick={() => { setStep('upload'); setResumeData(null); setJobs([]) }}
                    className="text-slate-500 hover:text-slate-300 text-sm transition-colors"
                  >
                    Upload a different resume
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
