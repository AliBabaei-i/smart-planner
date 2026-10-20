import React from 'react'
import Skeleton, { SkeletonCard, SkeletonChart } from '../../components/ui/Skeleton'
import SkeletonTable from '../../components/ui/SkeletonTable'

const FinanceReportsSkeleton = () => (
  <div className="space-y-5" aria-busy="true" aria-live="polite">
    {/* هدر + Export */}
    <div className="flex items-center justify-between gap-3 flex-wrap">
      <div className="space-y-2">
        <Skeleton variant="text" width={200} height={28} />
        <Skeleton variant="text" width={280} height={14} />
      </div>
      <Skeleton variant="rounded" width={140} height={40} />
    </div>

    {/* Filters Card */}
    <Skeleton variant="rounded" width="100%" height={120} />

    {/* Summary (4 cards) */}
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />
    </div>

    {/* 2 Charts */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <SkeletonChart height={250} />
      <SkeletonChart height={250} />
    </div>

    {/* Table */}
    <SkeletonTable rows={6} columns={5} />
  </div>
)

export default FinanceReportsSkeleton