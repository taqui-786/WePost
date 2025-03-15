import MyFeed from "@/components/customComponents/MyFeed";
import TrendzSidebar from "@/components/customComponents/TrendzSidebar";
import PostEditor from "@/components/post/editor/PostEditor";

export default function Home() {
  return (
    <main className="flex w-full min-w-0 gap-5">
      <div className="w-full min-w-0 space-y-5">
        <PostEditor />
        <MyFeed />
      </div>
      <TrendzSidebar />
    </main>
  );
}
