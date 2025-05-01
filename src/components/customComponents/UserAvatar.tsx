import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { cn } from "@/lib/utils";

interface UserAvatarProps {
  userAvatarUrl: string | null;
  userName: string | null;
  className?: string;
  size?: number;
}

function UserAvatar({ userName, userAvatarUrl, className, size = 40 }: UserAvatarProps) {
  const getInitials = (name: string) => {
    const underscoreIndex = name.indexOf("_");
    const hyphenIndex = name.indexOf("-");

    const theIndex =
      underscoreIndex !== -1 && hyphenIndex !== -1
        ? Math.min(underscoreIndex, hyphenIndex)
        : Math.max(underscoreIndex, hyphenIndex);

    const result =
      theIndex !== -1
        ? name.charAt(0) + name.charAt(theIndex + 1)
        : name.charAt(0) + name.charAt(name.length - 1);

    return result.toUpperCase();
  };

  return (
    <Avatar
      className={cn("overflow-hidden rounded-full", className)}
      style={{ width: size, height: size }}
    >
      {userAvatarUrl ? (
        <AvatarImage
          src={userAvatarUrl}
          alt={userName || "social_app"}
          loading="eager"
          className="w-full h-full object-cover"
        />
      ) : (
        <AvatarFallback className="flex items-center justify-center w-full h-full">
          {getInitials(userName || "social_app")}
        </AvatarFallback>
      )}
    </Avatar>
  );
}

export default UserAvatar;
