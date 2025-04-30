import { validateRequest } from '@/auth';
import BookmarkFeed from '@/components/customComponents/feeds/BookmarkFeed';
import TrendzSidebar from '@/components/customComponents/TrendzSidebar';
import { Metadata } from 'next';
import React from 'react'


export const metadata: Metadata = {
  title: "Bookmarks",
  description:"All the saved/Bookmarked posts will be shown here."
}

async function page() {
  const { user: loggedInUser } = await validateRequest();
  if (!loggedInUser) {
    return (
      <p className="text-destructive">
        You&apos;re not authorized to view this page.
      </p>
    );
  }


    return (
    <main className="flex w-full min-w-0 gap-5">
      <div className="w-full min-w-0 space-y-5">
        <div className="bg-card rounded-2xl p-5 shadow-sm">
          <h2 className="text-center text-2xl font-bold">
            Bookmarked posts
          </h2>
        </div>
        <BookmarkFeed />
      </div>
      <TrendzSidebar />
    </main>
  )
}

export default page