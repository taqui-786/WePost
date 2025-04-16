import { validateRequest } from '@/auth';
import NotificationFeed from '@/components/customComponents/NotificationFeed';
import TrendzSidebar from '@/components/customComponents/TrendzSidebar';
import React from 'react'

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
            Notifications
          </h2>
        </div>
        <NotificationFeed />
      </div>
      <TrendzSidebar />
    </main>
  )
}

export default page