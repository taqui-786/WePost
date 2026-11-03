import React from "react";
import AddUsersToMessageDialog from "./AddUsersToMessageDialog";
import MessageUsersFeed from "../customComponents/feeds/MessageUsersFeed";
import { cn } from "@/lib/utils";

function Users({ userId, className }: { userId: string | undefined, className?: string }) {
  return (
    <div className={cn("flex-col", className)}>
      <div className="flex w-full shrink-0 items-center justify-between border-b p-4">
        <h1 className="text-xl leading-none font-semibold tracking-tight">
          Messages
        </h1>
        <AddUsersToMessageDialog userId={userId} />
      </div>
      <MessageUsersFeed userId={userId} />
    </div>
  );
}

export default Users;
