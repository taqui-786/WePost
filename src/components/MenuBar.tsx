"use client";
import React, { useEffect, useState } from "react";
import { Button } from "./ui/button";
import Link from "next/link";
import { Bookmark, Home, Mail } from "lucide-react";
import { Card, CardContent } from "./ui/card";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import NotificationBtn from "./customComponents/NotificationBtn";
import { notificationInitialState } from "./post/comment/action";

interface MenuBarProps {
  className?: string;
}
function MenuBar({ className }: MenuBarProps) {
  const [notificationState, setNotificationState] = useState<{
    unreadcount: number;
  }>({
    unreadcount: 0,
  });
  const router = usePathname();
  const activeLinkStyle =
    "rounded-none border-b-4 border-b-primary sm:border-b-0 sm:border-l-4 sm:border-l-primary text-primary";
  useEffect(() => {
    const fetchNotificationState = async () => {
      try {
        const data = await notificationInitialState();

        setNotificationState({ unreadcount: data || 0 });
      } catch (err) {
        console.error("Failed to load notification state", err);
      }
    };

    fetchNotificationState();
  }, []);

  return (
    <Card className={cn(className, "  rounded-none sm:rounded-2xl")}>
      <CardContent className="flex justify-between p-0 w-full  sm:p-6 sm:block sm:space-y-3">
        <Button
          className={cn(
            "flex items-center justify-start gap-3",
            router === "/" && activeLinkStyle,
          )}
          variant="ghost"
          title="Home"
          asChild
        >
          <Link href="/">
            <Home className="size-5" />{" "}
            <span className="hidden lg:inline">Home</span>
          </Link>
        </Button>
        <NotificationBtn
          router={router}
          activeLinkStyle={activeLinkStyle}
          initialState={notificationState}
        />
        <Button
          className={cn(
            "flex items-center justify-start gap-3",
            router === "/messages" && activeLinkStyle,
          )}
          variant="ghost"
          title="Messages"
          asChild
        >
          <Link href="/messages">
            <Mail className="size-5" />{" "}
            <span className="hidden lg:inline">Messages</span>
          </Link>
        </Button>
        <Button
          className={cn(
            "flex items-center justify-start gap-3",
            router.startsWith("/bookmarks") && activeLinkStyle,
          )}
          variant="ghost"
          title="Bookmarks"
          asChild
        >
          <Link href="/bookmarks">
            <Bookmark className="size-5" />{" "}
            <span className="hidden lg:inline">Bookmarks</span>
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

export default MenuBar;
