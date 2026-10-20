import React, { memo, type ReactNode } from 'react'
import { motion } from 'framer-motion'

interface EmptyStateProps {
  icon: ReactNode
  title: string
  description?: string
  action?: ReactNode
  className?: string
  variant?: 'default' | 'compact'
}

const EmptyState = memo(({ icon, title, description, action, className = '', variant = 'default' }: EmptyStateProps) => {
  const isCompact = variant === 'compact'

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex flex-col items-center justify-center ${isCompact ? 'py-8' : 'py-16'} text-center ${className}`}
    >
      <div className={`${isCompact ? 'w-14 h-14 mb-3' : 'w-20 h-20 mb-4'} rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400 dark:text-gray-500`}>
        {icon}
      </div>
      <h3 className={`${isCompact ? 'text-base' : 'text-xl'} font-semibold text-gray-900 dark:text-white mb-2`}>
        {title}
      </h3>
      {description && (
        <p className={`${isCompact ? 'text-xs' : 'text-sm'} text-gray-500 dark:text-gray-400 mb-4 max-w-md`}>
          {description}
        </p>
      )}
      {action && <div>{action}</div>}
    </motion.div>
  )
})

EmptyState.displayName = 'EmptyState'
export default EmptyState