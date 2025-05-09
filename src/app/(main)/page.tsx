import FollowingFeed from "@/components/customComponents/feeds/FollowingFeed";
import MyFeed from "@/components/customComponents/feeds/MyFeed";
import TrendzSidebar from "@/components/customComponents/TrendzSidebar";
import PostEditor from "@/components/post/editor/PostEditor";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Home() {
  return (
    <main className="flex w-full min-w-0 gap-5">
      <div className="w-full min-w-0 space-y-5">
        <PostEditor />
        <Tabs defaultValue="my-feed">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="my-feed" className="cursor-pointer">
              My Feed
            </TabsTrigger>
            <TabsTrigger value="following-feed" className="cursor-pointer">
              Followings
            </TabsTrigger>
          </TabsList>
          <TabsContent value="my-feed">
            <MyFeed />
          </TabsContent>
          <TabsContent value="following-feed">
            <FollowingFeed />
          </TabsContent>
        </Tabs>
      </div>
      
      <TrendzSidebar />
    </main>
  );
}
