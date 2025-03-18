import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { cn } from "@/lib/utils";

interface UserAvatarProps {
  userAvatarUrl: string | null;
  userName: string | null;
  className?: string;
  size?: number;
}
function UserAvatar({ userName, userAvatarUrl, className, size }: UserAvatarProps) {
  const getInitials = (name: string) => {
    const underscoreIndex = name.indexOf("_");
    const hyphenIndex = name.indexOf("-");

    const theIndex =
      underscoreIndex !== -1 && hyphenIndex !== -1
        ? Math.min(underscoreIndex, hyphenIndex)
        : Math.max(underscoreIndex, hyphenIndex);

    const result =  theIndex !== -1
      ? name.charAt(0) + name.charAt(theIndex + 1)
      : name.charAt(0) + name.charAt(name.length - 1);
      return result.toUpperCase()
  };

  return (
    <Avatar className={cn("h-10 w-10", className)} >
      {userAvatarUrl && userAvatarUrl ? (
        <AvatarImage src={userAvatarUrl}
        width={size ?? 48}
        height={size ?? 48}
        className="aspect-square flex-none"
        alt={userName || "social_app"} />
      ) : (
        <AvatarFallback   className="aspect-square flex-none">{getInitials(userName || "social_app")}</AvatarFallback>
      )}
    </Avatar>
  );
}

export default UserAvatar;
