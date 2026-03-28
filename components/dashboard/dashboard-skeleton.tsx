'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

function KPISkeleton() {
  return (
    <Card className="bg-white/40 border-white/50 rounded-[2rem]">
      <CardContent className="p-8">
        <div className="flex items-center gap-3 mb-6">
           <Skeleton className="h-10 w-10 rounded-2xl bg-black/[0.03]" />
           <Skeleton className="h-2 w-20 bg-black/[0.03]" />
        </div>
        <Skeleton className="h-12 w-32 mb-4 bg-black/[0.03]" />
        <Skeleton className="h-2 w-16 bg-black/[0.03]" />
      </CardContent>
    </Card>
  )
}

function ChartSkeleton({ height = 350 }: { height?: number }) {
  return (
    <Card className="bg-white/40 border-white/50 rounded-[2.5rem]">
      <CardContent className="p-8">
        <div className="flex items-center gap-4 mb-8">
           <Skeleton className="h-10 w-10 rounded-2xl bg-black/[0.03]" />
           <div className="space-y-2">
              <Skeleton className="h-2 w-24 bg-black/[0.03]" />
              <Skeleton className="h-4 w-40 bg-black/[0.03]" />
           </div>
        </div>
        <Skeleton className="w-full bg-black/[0.02] rounded-[2rem]" style={{ height }} />
      </CardContent>
    </Card>
  )
}

export function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-white">
      {/* Sub Header Skeleton */}
      <div className="fixed top-16 left-0 right-0 z-30 h-16 bg-white/40 backdrop-blur-xl border-b border-black/[0.03]">
        <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between gap-4">
           <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-2xl bg-black/[0.05]" />
              <div className="space-y-1">
                 <Skeleton className="h-2 w-20 bg-black/[0.05]" />
                 <Skeleton className="h-4 w-24 bg-black/[0.05]" />
              </div>
           </div>
           <Skeleton className="h-10 w-32 rounded-xl bg-black/[0.05]" />
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-12 mt-32 space-y-12 animate-pulse">
        {/* Header Hero Skeleton */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-black/[0.03]">
           <div className="space-y-3">
              <div className="flex items-center gap-3">
                 <Skeleton className="h-10 w-10 rounded-2xl bg-black/[0.03]" />
                 <Skeleton className="h-10 w-64 bg-black/[0.03]" />
              </div>
              <Skeleton className="h-3 w-48 bg-black/[0.02]" />
           </div>
           <div className="space-y-3 md:text-right">
              <Skeleton className="h-2 w-32 bg-black/[0.02] ml-auto" />
              <Skeleton className="h-8 w-48 bg-black/[0.03] ml-auto" />
           </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <KPISkeleton key={i} />
          ))}
        </div>

        {/* Charts Grid Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          <ChartSkeleton height={200} />
          <ChartSkeleton height={200} />
        </div>

        {/* Charts Grid Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
           <ChartSkeleton height={250} />
           <ChartSkeleton height={250} />
        </div>

        {/* Categories Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
           <ChartSkeleton height={300} />
           <ChartSkeleton height={300} />
        </div>

        {/* History Area */}
        <div className="space-y-6">
           <div className="flex items-center justify-between">
              <Skeleton className="h-6 w-48 bg-black/[0.03]" />
              <Skeleton className="h-10 w-32 rounded-xl bg-black/[0.03]" />
           </div>
           <Card className="bg-white/40 border-white/50 rounded-[2.5rem]">
             <CardContent className="p-8 space-y-6">
               {Array.from({ length: 4 }).map((_, i) => (
                 <div key={i} className="flex items-center justify-between">
                   <div className="flex items-center gap-4">
                     <Skeleton className="h-12 w-12 rounded-2xl bg-black/[0.03]" />
                     <div className="space-y-2">
                       <Skeleton className="h-4 w-32 bg-black/[0.03]" />
                       <Skeleton className="h-2 w-20 bg-black/[0.03]" />
                     </div>
                   </div>
                   <Skeleton className="h-6 w-24 bg-black/[0.03]" />
                 </div>
               ))}
             </CardContent>
           </Card>
        </div>
      </main>
    </div>
  )
}
