import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"

export default function IntegrationCanvasLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <Skeleton className="h-6 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-20" />
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-28" />
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Sidebar */}
        <div className="w-80 bg-white border-r p-4">
          <div className="space-y-6">
            {/* Components */}
            <div>
              <Skeleton className="h-5 w-24 mb-3" />
              <div className="space-y-2">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-8 w-8" />
                      <div>
                        <Skeleton className="h-4 w-20 mb-1" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Properties */}
            <div>
              <Skeleton className="h-5 w-20 mb-3" />
              <div className="space-y-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i}>
                    <Skeleton className="h-4 w-16 mb-2" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 bg-gray-100 relative">
          <div className="absolute inset-4">
            <Card className="h-full">
              <CardContent className="p-8 h-full">
                <div className="grid grid-cols-12 grid-rows-8 gap-4 h-full">
                  {/* Simulated Flow Nodes */}
                  <div className="col-span-2 row-span-1">
                    <Skeleton className="h-full w-full rounded-lg" />
                  </div>
                  <div className="col-span-2 row-span-1 col-start-5">
                    <Skeleton className="h-full w-full rounded-lg" />
                  </div>
                  <div className="col-span-2 row-span-1 col-start-9">
                    <Skeleton className="h-full w-full rounded-lg" />
                  </div>
                  <div className="col-span-2 row-span-1 row-start-4">
                    <Skeleton className="h-full w-full rounded-lg" />
                  </div>
                  <div className="col-span-2 row-span-1 col-start-5 row-start-4">
                    <Skeleton className="h-full w-full rounded-lg" />
                  </div>
                  <div className="col-span-2 row-span-1 col-start-9 row-start-4">
                    <Skeleton className="h-full w-full rounded-lg" />
                  </div>
                  <div className="col-span-2 row-span-1 col-start-3 row-start-7">
                    <Skeleton className="h-full w-full rounded-lg" />
                  </div>
                  <div className="col-span-2 row-span-1 col-start-7 row-start-7">
                    <Skeleton className="h-full w-full rounded-lg" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Right Panel */}
        <div className="w-80 bg-white border-l p-4">
          <div className="space-y-6">
            <div>
              <Skeleton className="h-5 w-32 mb-3" />
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-4 w-4" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                    <Skeleton className="h-6 w-12" />
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Skeleton className="h-5 w-24 mb-3" />
              <div className="space-y-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="p-2 border rounded">
                    <Skeleton className="h-4 w-full mb-1" />
                    <Skeleton className="h-3 w-3/4" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
