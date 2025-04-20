import React from "react";
import AddUsersToMessageDialog from "./AddUsersToMessageDialog";
import MessageUsersFeed from "../customComponents/feeds/MessageUsersFeed";

function Users({ userId }: { userId: string | undefined }) {
  return (
    <div className="flex w-1/3 flex-col items-start border-r">
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
