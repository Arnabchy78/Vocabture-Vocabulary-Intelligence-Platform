import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, Star, Award, Gem } from 'lucide-react'
import { Achievement } from '../../types'

interface ToastItem {
  achievement: Achievement
  id: string
}

interface AchievementToastProps {
  unlocked: Achievement[]
  onDismissAll: () => void
}

const tierConfig = {
  bronze: {
    bg: 'from-orange-900/90 to-orange-800/90',
    border: 'border-orange-500/60',
    icon: 'text-orange-400',
    badge: 'bg-orange-500/20 text-orange-300',
    glow: 'shadow-orange-500/20',
    Icon: Trophy,
  },
  silver: {
    bg: 'from-slate-700/90 to-slate-600/90',
    border: 'border-slate-400/60',
    icon: 'text-slate-300',
    badge: 'bg-slate-400/20 text-slate-200',
    glow: 'shadow-slate-400/20',
    Icon: Star,
  },
  gold: {
    bg: 'from-yellow-900/90 to-yellow-800/90',
    border: 'border-yellow-500/60',
    icon: 'text-yellow-400',
    badge: 'bg-yellow-500/20 text-yellow-300',
    glow: 'shadow-yellow-500/20',
    Icon: Award,
  },
  platinum: {
    bg: 'from-purple-900/90 to-purple-800/90',
    border: 'border-purple-400/60',
    icon: 'text-purple-300',
    badge: 'bg-purple-400/20 text-purple-200',
    glow: 'shadow-purple-400/20',
    Icon: Gem,
  },
}

const TOAST_DURATION = 4000

export default function AchievementToast({
  unlocked,
  onDismissAll,
}: AchievementToastProps) {
  const [queue, setQueue] = useState<ToastItem[]>([])
  const [current, setCurrent] = useState<ToastItem | null>(null)
  const [progress, setProgress] = useState(100)

  // Add new unlocks to queue
  useEffect(() => {
    if (unlocked.length === 0) return
    const newItems: ToastItem[] = unlocked.map((a) => ({
      achievement: a,
      id: `${a.id}-${Date.now()}-${Math.random()}`,
    }))
    setQueue((prev) => [...prev, ...newItems])
  }, [unlocked])

  // Show next toast from queue
  useEffect(() => {
    if (current) return
    if (queue.length === 0) return
    const [next, ...rest] = queue
    setQueue(rest)
    setCurrent(next)
    setProgress(100)
  }, [queue, current])

  // Auto-dismiss timer with progress bar
  useEffect(() => {
    if (!current) return

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev <= 0) return 0
        return prev - 100 / (TOAST_DURATION / 100)
      })
    }, 100)

    const timer = setTimeout(() => {
      setCurrent(null)
      if (queue.length === 0) onDismissAll()
    }, TOAST_DURATION)

    return () => {
      clearInterval(interval)
      clearTimeout(timer)
    }
  }, [current])

  const dismiss = () => {
    setCurrent(null)
    if (queue.length === 0) onDismissAll()
  }

  if (!current) return null

  const tier = current.achievement.tier ?? 'bronze'
  const config = tierConfig[tier]
  const { Icon } = config

  return (
    <AnimatePresence>
      <motion.div
        key={current.id}
        initial={{ opacity: 0, y: -80, scale: 0.85 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -60, scale: 0.9 }}
        transition={{ type: 'spring', stiffness: 400, damping: 28 }}
        className="fixed top-5 right-5 z-[9999] w-80 cursor-pointer"
        onClick={dismiss}
      >
        {/* Queue indicator */}
        {queue.length > 0 && (
          <div className="absolute -top-2 -right-2 bg-violet-600 text-white text-xs
                          font-bold rounded-full w-5 h-5 flex items-center justify-center z-10">
            +{queue.length}
          </div>
        )}

        <div
          className={`
            relative rounded-2xl border bg-gradient-to-br backdrop-blur-md
            shadow-2xl overflow-hidden
            ${config.bg} ${config.border} ${config.glow}
          `}
        >
          {/* Shimmer effect */}
          <motion.div
            className="absolute inset-0 bg-white/5"
            initial={{ x: '-100%', skewX: '-15deg' }}
            animate={{ x: '200%', skewX: '-15deg' }}
            transition={{ duration: 0.7, delay: 0.2 }}
          />

          {/* Content */}
          <div className="relative flex items-center gap-3 p-4">
            {/* Icon */}
            <div className={`
              flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center
              bg-black/20 border border-white/10 text-2xl
            `}>
              {current.achievement.icon}
            </div>

            {/* Text */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className={`
                  text-[10px] font-bold uppercase tracking-widest px-2 py-0.5
                  rounded-full ${config.badge}
                `}>
                  {tier} unlocked
                </span>
              </div>
              <p className="text-white font-bold text-sm truncate">
                {current.achievement.title}
              </p>
              <p className="text-white/60 text-xs truncate">
                {current.achievement.description}
              </p>
            </div>

            {/* Tier icon */}
            <Icon className={`flex-shrink-0 w-5 h-5 ${config.icon}`} />
          </div>

          {/* Progress bar */}
          <motion.div
            className="h-0.5 bg-white/30"
            initial={{ width: '100%' }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.1, ease: 'linear' }}
          />
        </div>

        {/* Tap to dismiss hint */}
        <p className="text-center text-white/30 text-[10px] mt-1">
          tap to dismiss
        </p>
      </motion.div>
    </AnimatePresence>
  )
}