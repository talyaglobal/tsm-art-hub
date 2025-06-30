import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-10 w-24" />
      </div>

      <div className="flex space-x-1 border-b">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-20" />
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="space-y-4 p-6 border rounded-lg">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-4 w-32" />
        </div>

        <div className="space-y-4 p-6 border rounded-lg">
          <Skeleton className="h-6 w-28" />
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-4 w-36" />
        </div>

        <div className="space-y-4 p-6 border rounded-lg">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-4 w-28" />
        </div>
      </div>
    </div>
  )
}
