import React, { memo } from 'react'

interface SkeletonProps {
  className?: string
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded'
  width?: string | number
  height?: string | number
  animation?: 'pulse' | 'wave' | 'none'
}

const Skeleton = memo(({
  className = '',
  variant = 'rectangular',
  width,
  height,
  animation = 'pulse'
}: SkeletonProps) => {
  const baseClasses = 'bg-gray-200 dark:bg-gray-700'
  
  const variants = {
    text: 'h-4 w-full rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-none',
    rounded: 'rounded-xl'
  }

  const animations = {
    pulse: 'animate-pulse',
    wave: 'animate-shimmer', // برای آینده
    none: ''
  }

  const style: React.CSSProperties = {
    width: width !== undefined ? width : undefined,
    height: height !== undefined ? height : undefined
  }

  return (
    <div
      className={`${baseClasses} ${variants[variant]} ${animations[animation]} ${className}`}
      style={style}
      aria-hidden="true"
    />
  )
})

Skeleton.displayName = 'Skeleton'

// ✅ SkeletonText: برای خطوط متن
export const SkeletonText = memo(({ lines = 3, className = '' }: { lines?: number; className?: string }) => (
  <div className={`space-y-2 ${className}`}>
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton
        key={i}
        variant="text"
        width={i === lines - 1 ? '60%' : '100%'}
      />
    ))}
  </div>
))
SkeletonText.displayName = 'SkeletonText'

// ✅ SkeletonCard: برای کارت‌های آماری
export const SkeletonCard = memo(({ className = '' }: { className?: string }) => (
  <div className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 ${className}`}>
    <div className="flex items-center gap-3 mb-4">
      <Skeleton variant="circular" width={40} height={40} />
      <div className="flex-1 space-y-2">
        <Skeleton variant="text" width="60%" />
        <Skeleton variant="text" width="40%" />
      </div>
    </div>
    <Skeleton variant="text" width="80%" height={32} />
  </div>
))
SkeletonCard.displayName = 'SkeletonCard'

// ✅ SkeletonChart: برای نمودارها
export const SkeletonChart = memo(({ className = '', height = 300 }: { className?: string; height?: number }) => (
  <div className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 ${className}`}>
    <Skeleton variant="text" width="40%" className="mb-4" />
    <Skeleton variant="rectangular" width="100%" height={height} />
  </div>
))
SkeletonChart.displayName = 'SkeletonChart'

export default Skeleton