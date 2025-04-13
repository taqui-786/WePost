import { Skeleton } from "../ui/skeleton"

  
  export function TrendingTopicsLoadingSkeleton() {
    return (
      <div className="border rounded-lg p-4 bg-white">
        <Skeleton className="h-6 w-36 mb-4" />
  
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex flex-col gap-1">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-3 w-12" />
            </div>
          ))}
        </div>
      </div>
    )
  }
  
  export function WhoToFollowLoadingSkeleton() {
    return (
      <div className="border rounded-lg p-4 bg-white">
        <Skeleton className="h-6 w-32 mb-4" />
  
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-1">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
              <Skeleton className="h-8 w-20 rounded-md" />
            </div>
          ))}
        </div>
      </div>
    )
  }
  