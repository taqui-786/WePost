import { Skeleton } from "../ui/skeleton";

export default function CommentsLoadingSkeleton() {
    return (
      <div className=" rounded-lg p-4 bg-card">
        <div className="flex justify-center mb-4">
          <Skeleton className="h-6 w-48 rounded-md" />
        </div>
  
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="py-3">
            <div className="flex items-start gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-3 w-20" />
                </div>
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
            {i < 5 && <div className="h-px w-full bg-gray-100 mt-4"></div>}
          </div>
        ))}
      </div>
    )
  }