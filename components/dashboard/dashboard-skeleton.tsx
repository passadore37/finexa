'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

function KPISkeleton() {
  return (
    <Card className="border border-border bg-card">
      <CardContent className="p-5">
        <Skeleton className="h-2.5 w-24 mb-3 bg-secondary" />
        <Skeleton className="h-10 w-36 mb-2 bg-secondary" />
        <Skeleton className="h-2.5 w-16 bg-secondary" />
      </CardContent>
    </Card>
  );
}

function ChartSkeleton({ height = 280 }: { height?: number }) {
  return (
    <Card className="border border-border bg-card">
      <CardHeader className="pb-2">
        <Skeleton className="h-2.5 w-32 bg-secondary" />
      </CardHeader>
      <CardContent>
        <Skeleton className="w-full bg-secondary" style={{ height }} />
      </CardContent>
    </Card>
  );
}

function BarSkeleton() {
  return (
    <Card className="border border-border bg-card">
      <CardHeader className="pb-2">
        <Skeleton className="h-2.5 w-40 bg-secondary" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-6 w-full mb-2 bg-secondary" />
        <Skeleton className="h-14 w-full mb-2 bg-secondary rounded-lg" />
        <Skeleton className="h-6 w-full bg-secondary" />
      </CardContent>
    </Card>
  );
}

function ListSkeleton({ items = 3 }: { items?: number }) {
  return (
    <Card className="border border-border bg-card">
      <CardHeader className="pb-2">
        <Skeleton className="h-2.5 w-24 bg-secondary" />
      </CardHeader>
      <CardContent className="space-y-3">
        {Array.from({ length: items }).map((_, i) => (
          <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-secondary/30">
            <Skeleton className="h-8 w-8 rounded bg-secondary" />
            <div className="flex-1">
              <Skeleton className="h-4 w-3/4 mb-2 bg-secondary" />
              <Skeleton className="h-3 w-1/2 bg-secondary" />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <Skeleton className="h-8 w-32 mb-2 bg-secondary" />
              <Skeleton className="h-3 w-36 bg-secondary" />
            </div>
            <Skeleton className="h-9 w-28 bg-secondary" />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <KPISkeleton key={i} />
          ))}
        </div>

        {/* Separador */}
        <div className="section-separator my-8" />

        {/* Projeção + Evolução */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <BarSkeleton />
          <ChartSkeleton />
        </div>

        {/* Separador */}
        <div className="section-separator my-8" />

        {/* Categorias + Parceladas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <ChartSkeleton height={200} />
          <ListSkeleton items={3} />
        </div>

        {/* Separador */}
        <div className="section-separator my-8" />

        {/* Alerts and Suggestions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ListSkeleton items={3} />
          <ListSkeleton items={3} />
        </div>
      </main>
    </div>
  );
}
