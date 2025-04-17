import SearchResultsFeed from '@/components/customComponents/feeds/SearchResultsFeed'
import TrendzSidebar from '@/components/customComponents/TrendzSidebar'
import { Metadata } from 'next'
import React from 'react'


interface PageProps {
    searchParams:{q:string}
}
export function generateMetadata({searchParams:{q}}:PageProps):Metadata{
    return {
        title: `search results for "${q}"`
    }

}
function page({searchParams:{q}}:PageProps) {
  return (
    <main className="flex w-full min-w-0 gap-5">
    <div className="w-full min-w-0 space-y-5">
      <div className="bg-card rounded-2xl p-5 shadow-sm">
        <h2 className="text-center text-2xl font-bold line-clamp-2 break-all">
          Search results for &quot;{q}&quot;
        </h2>
      </div>
      <SearchResultsFeed query={q}/>
    </div>
    <TrendzSidebar />
  </main>
  )
}

export default page