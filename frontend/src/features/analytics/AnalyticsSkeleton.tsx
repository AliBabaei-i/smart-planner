import React from 'react'
import Skeleton, { SkeletonCard, SkeletonChart } from '../../components/ui/Skeleton'

const AnalyticsSkeleton = () => (
  <div className="space-y-6" aria-busy="true" aria-live="polite">
    {/* هدر */}
    <div className="flex justify-between items-center flex-wrap gap-3">
      <div className="space-y-2">
        <Skeleton variant="text" width={220} height={32} />
        <Skeleton variant="text" width={300} height={16} />
      </div>
      <div className="flex gap-2">
        <Skeleton variant="rounded" width={120} height={40} />
        <Skeleton variant="rounded" width={120} height={40} />
      </div>
    </div>

    {/* Tabs */}
    <Skeleton variant="rounded" width="100%" height={60} />

    {/* Range Selector */}
    <Skeleton variant="rounded" width="100%" height={50} />

    {/* Stat Cards */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />
    </div>

    {/* Main Chart */}
    <SkeletonChart height={320} />

    {/* Two Side Charts */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <SkeletonChart height={280} />
      <SkeletonChart height={280} />
    </div>

    {/* Summary Cards */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Skeleton variant="rounded" width="100%" height={200} />
      <Skeleton variant="rounded" width="100%" height={200} />
    </div>
  </div>
)

export default AnalyticsSkeleton