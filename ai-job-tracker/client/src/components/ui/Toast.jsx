import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, XCircle, Info, X } from 'lucide-react'
import { useToast } from '../../hooks/useToast'

const ICON_MAP = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
}

const COLOR_MAP = {
  success: {
    bg: 'bg-green-500/15',
    border: 'border-green-400/30',
    icon: 'text-green-400',
    text: 'text-green-200',
  },
  error: {
    bg: 'bg-red-500/15',
    border: 'border-red-400/30',
    icon: 'text-red-400',
    text: 'text-red-200',
  },
  info: {
    bg: 'bg-blue-500/15',
    border: 'border-blue-400/30',
    icon: 'text-blue-400',
    text: 'text-blue-200',
  },
}

export default function ToastContainer() {
  const { toasts, removeToast } = useToast()

  return (
    <div className="fixed top-4 right-4 z-50 space-y-3 max-w-sm w-full pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => {
          const Icon = ICON_MAP[toast.type] || Info
          const colors = COLOR_MAP[toast.type] || COLOR_MAP.info

          return (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, x: 80, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 80, scale: 0.95 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className={`pointer-events-auto flex items-start gap-3 p-4 rounded-lg border
                backdrop-blur-md shadow-lg shadow-black/20
                ${colors.bg} ${colors.border}`}
            >
              <Icon size={20} className={`${colors.icon} mt-0.5 flex-shrink-0`} />
              <p className={`text-sm font-medium flex-1 ${colors.text}`}>
                {toast.message}
              </p>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-slate-500 hover:text-slate-300 transition-colors flex-shrink-0"
              >
                <X size={16} />
              </button>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
