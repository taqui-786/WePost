import { Skeleton } from "@/components/ui/skeleton"

const UserCardSkeleton = () => {
  return (
    <div className="flex items-center justify-between w-full">
      <div className="flex flex-wrap items-center gap-3">
        {/* Avatar Skeleton */}
        <Skeleton className="h-10 w-10 rounded-full" />

        {/* User Info Skeleton */}
        <div className="space-y-1">
          <Skeleton className="h-4 w-32 rounded" />
          <Skeleton className="h-3 w-20 rounded" />
        </div>
      </div>

      {/* Add Button Skeleton */}
      <Skeleton className="h-8 w-16 rounded-md" />
    </div>
  )
}

export default UserCardSkeleton
