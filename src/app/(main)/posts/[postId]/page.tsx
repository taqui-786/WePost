import { validateRequest } from '@/auth';
import UserAvatar from '@/components/customComponents/UserAvatar';
import UserTooltip from '@/components/customComponents/UserTooltip';
import Post from '@/components/post/Post';
import prisma from '@/lib/prisma';
import { getPostDataInclude, UserData } from '@/lib/types';
import {  Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import React, { cache, Suspense } from 'react'
import Linkify from '@/components/customComponents/Linkify';
import FollowButton from '@/components/customComponents/actionButtons/FollowButton';
interface PageProps {
  params: Promise<{ postId: string }>;
}
 const getPost = cache(async(postId:string, loggedInUserId:string) => { 
  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: getPostDataInclude(loggedInUserId)
  });
  if(!post) notFound();

  return post;
 })

 export async function generateMetadata({ params }:  PageProps): Promise<Metadata> {
  const {user} = await validateRequest();
  if(!user) return {};
  const post = await getPost((await params).postId, user.id);

  return {
    title: `${post.user.displayName} - ${post.content.slice(0, 40)}....`,
    description: post.content,
  

 }
 }
async function page({ params }:  PageProps) {
  const { user: loggedInUser } = await validateRequest();
  if (!loggedInUser) {
    return (
      <p className="text-destructive">
        You&apos;re not authorized to view this page.
      </p>
    );
  }
  const post = await getPost((await params).postId, loggedInUser.id);
  return (
  <main className="flex w-full min-w-0 gap-5">
    <div className="w-full min-w-0 space-y-5">
      <Post post={post} />
    </div>
    <div className="sticky top-[5.25rem] hidden h-fit w-72 flex-none space-y-5 md:block lg:w-80">
      <Suspense fallback={<Loader2 className="mx-auto animate-spin" />}>

      <UserInfoSidebar user={post.user} />
      </Suspense>
    </div>
  </main>
  )
}

export default page


interface UserInfoSidebarProps {
  user: UserData;
}

async function UserInfoSidebar({user}: UserInfoSidebarProps) {
  const { user: loggedInUser } = await validateRequest();
  if(!loggedInUser)  return null;
  return (
    <div className="space-y-5 rounded-2xl bg-card p-5 shadow-sm">
      <div className="text-xl font-bold">About this user</div>
      <UserTooltip user={user}>
        <Link href={`/users/${user.username}`} className='flex items-center gap-3'>
        <UserAvatar userAvatarUrl={user.avatarUrl} userName={user.username} className='flex-none' />
        <div>
          <p className="line-clamp-1 break-all font-semibold hover:underline">{user.displayName}</p>
          <p className="line-clamp-1 break-all text-muted-foreground">@{user.username}</p>
        </div>
        </Link>
      </UserTooltip>
    <Linkify>
    <div className="line-clamp-6 whitespace-pre-line break-words text-muted-foreground">{user.bio}</div>
    </Linkify>
    {user.id !== loggedInUser.id && ( 

      <FollowButton  initialState={{
        followers: user._count.Followers,
        following: user._count.Following,
        isFollowedByUser: user.Followers.some(({ followerId }) => followerId === loggedInUser.id),
      }}  userId={user.id}
       />
    )}
    </div>
  )
  
}