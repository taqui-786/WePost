import Post from "@/components/post/editor/Post";
import PostEditor from "@/components/post/editor/PostEditor";
import prisma from "@/lib/prisma";

export default async function Home() {
  const posts = await prisma.post.findMany({
    include: {
      user: {
        select:{
          username:true,
          displayName:true,
          avaratUrl:true
        }
      }
    },
    orderBy: {createdAt:"desc"},
  })
  return (
   <main className="w-full min-w-0">
    <div className="w-full min-w-0 space-y-3">
      <PostEditor/>
      {
        posts.map((post) => <Post key={post.id} post={post} />)
      } 
    </div>
   </main>
  );
}
