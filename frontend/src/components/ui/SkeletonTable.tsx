import React, { memo } from 'react'
import Skeleton from './Skeleton'

interface SkeletonTableProps {
  rows?: number
  columns?: number
  className?: string
}

const SkeletonTable = memo(({ rows = 5, columns = 4, className = '' }: SkeletonTableProps) => (
  <div className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 ${className}`}>
    {/* Header */}
    <div className="flex gap-3 mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
      {Array.from({ length: columns }).map((_, i) => (
        <Skeleton key={`h-${i}`} variant="text" width={i === 0 ? '40%' : '20%'} height={16} />
      ))}
    </div>
    {/* Rows */}
    {Array.from({ length: rows }).map((_, i) => (
      <div key={`r-${i}`} className="flex gap-3 py-3">
        {Array.from({ length: columns }).map((_, j) => (
          <Skeleton key={`c-${i}-${j}`} variant="text" width={j === 0 ? '40%' : '20%'} />
        ))}
      </div>
    ))}
  </div>
))
SkeletonTable.displayName = 'SkeletonTable'
export default SkeletonTable