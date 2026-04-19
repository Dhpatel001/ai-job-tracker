import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Plus, Zap, ArrowLeft, FileText, Building2, Link2 } from 'lucide-react'
import axios from 'axios'
import { useToast } from '../hooks/useToast'

export default function AddJob() {
  const navigate = useNavigate()
  const toast = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    description: '',
    jobUrl: '',
  })

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Client-side validation
    if (formData.description.length < 50) {
      toast.error('Job description must be at least 50 characters. Paste more of the job posting.')
      return
    }

    try {
      setLoading(true)
      const res = await axios.post('/api/jobs', formData)
      const jobId = res.data.data._id

      toast.success('Job created! AI is analyzing the description...')
      navigate(`/job/${jobId}`, { state: { justCreated: true } })
    } catch (error) {
      console.error('Failed to create job:', error)
      const message = error.response?.data?.error?.message || 'Failed to create job. Please try again.'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 p-6 md:p-8">
      <div className="max-w-2xl mx-auto">
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

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2">Add Job</h1>
          <p className="text-slate-400">Paste a job description to get AI-powered insights</p>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          <div className="card-premium p-6">
            <label className="flex items-center gap-2 text-sm font-medium text-white mb-3">
              <FileText size={16} className="text-blue-400" />
              Job Title
            </label>
            <input
              type="text"
              placeholder="e.g., Senior Backend Engineer"
              required
              minLength={2}
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 
                text-white placeholder-slate-500 focus:outline-none focus:border-blue-500
                transition-colors"
            />
          </div>

          <div className="card-premium p-6">
            <label className="flex items-center gap-2 text-sm font-medium text-white mb-3">
              <Building2 size={16} className="text-purple-400" />
              Company
            </label>
            <input
              type="text"
              placeholder="e.g., Stripe"
              required
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 
                text-white placeholder-slate-500 focus:outline-none focus:border-blue-500
                transition-colors"
            />
          </div>

          <div className="card-premium p-6">
            <label className="flex items-center gap-2 text-sm font-medium text-white mb-3">
              <Zap size={16} className="text-amber-400" />
              Job Description
            </label>
            <textarea
              placeholder="Paste the full job description here — AI will extract skills, experience, and red flags..."
              required
              minLength={50}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full h-64 bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 
                text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 
                resize-none font-mono text-sm transition-colors"
            />
            <div className="flex justify-between items-center mt-2">
              <p className={`text-xs ${formData.description.length < 50 ? 'text-amber-400' : 'text-slate-500'}`}>
                {formData.description.length < 50
                  ? `${50 - formData.description.length} more characters needed`
                  : `${formData.description.length} characters`}
              </p>
            </div>
          </div>

          <div className="card-premium p-6">
            <label className="flex items-center gap-2 text-sm font-medium text-white mb-3">
              <Link2 size={16} className="text-green-400" />
              Job URL
              <span className="text-slate-500 font-normal">(Optional)</span>
            </label>
            <input
              type="url"
              placeholder="https://example.com/job"
              value={formData.jobUrl}
              onChange={(e) => setFormData({ ...formData, jobUrl: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 
                text-white placeholder-slate-500 focus:outline-none focus:border-blue-500
                transition-colors"
            />
          </div>

          <div className="flex gap-3">
            <Link
              to="/"
              className="px-6 py-3 bg-slate-800 text-slate-300 font-medium rounded-lg
                hover:bg-slate-700 transition-all"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 
                bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg
                hover:shadow-lg hover:shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed
                transition-all"
            >
              {loading ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  >
                    <Zap size={18} />
                  </motion.div>
                  Analyzing with AI...
                </>
              ) : (
                <>
                  <Plus size={18} />
                  Create & Analyze
                </>
              )}
            </button>
          </div>
        </motion.form>
      </div>
    </div>
  )
}
