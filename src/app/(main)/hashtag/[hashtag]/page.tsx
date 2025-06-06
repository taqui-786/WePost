import { validateRequest } from '@/auth';
import HashtagsFeed from '@/components/customComponents/feeds/TagsFeed';
import TrendzSidebar from '@/components/customComponents/TrendzSidebar';
import React from 'react'



interface PageProps {
  params: Promise<{ hashtag: string }>;
}


export  async function generateMetadata({params}:PageProps){
  const {hashtag} = await params
  return {
    title: `#${hashtag}`,
  };
}

async function page({params}:PageProps) {
  const { user: loggedInUser } = await validateRequest();
  if (!loggedInUser) {
    return (
      <p className="text-destructive">
        You&apos;re not authorized to view this page.
      </p>
    );
  }
  const {hashtag} = await params

  return (
    <main className="flex w-full min-w-0 gap-5">
      <div className="w-full min-w-0 space-y-5">
        <div className="bg-card rounded-2xl p-5 shadow-sm">
          <h2 className="text-center text-2xl font-bold">
           #{hashtag} posts
          </h2>
        </div>
        <HashtagsFeed hashtag={hashtag} />
      </div>
      <TrendzSidebar />
    </main>
  );
}

export default page