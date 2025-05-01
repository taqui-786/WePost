import React from "react";
import AddUsersToMessageDialog from "./AddUsersToMessageDialog";
import MessageUsersFeed from "../customComponents/feeds/MessageUsersFeed";
import { cn } from "@/lib/utils";

function Users({ userId,className }: { userId: string | undefined, className?:string }) {
  return (
    <div className={cn("  flex-col items-start border-r",className)}>
      <div className="flex w-full items-center justify-between p-4">
        <h1 className="text-2xl leading-none font-medium tracking-tight">
          Messages
        </h1>
        <AddUsersToMessageDialog userId={userId} />
      </div>
        <MessageUsersFeed  userId={userId}/>
    </div>
  );
}

export default Users;
