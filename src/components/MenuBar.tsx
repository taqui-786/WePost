"use client";
import React from "react";
import { Button } from "./ui/button";
import Link from "next/link";
import { Bell, Bookmark, Home, Mail } from "lucide-react";
import { Card, CardContent } from "./ui/card";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface MenuBarProps {
  className?: string;
}
function MenuBar({ className }: MenuBarProps) {
  const router = usePathname();
  const activeLinkStyle =
  "rounded-none border-b-4 border-b-primary sm:border-b-0 sm:border-l-4 sm:border-l-primary text-primary";

  return (
    <Card className={cn(className," rounded-none sm:rounded-2xl ")}>
      <CardContent className=" px-3 flex justify-between  sm:block sm:px-6 sm:space-y-3">
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
            <Home /> <span className="hidden lg:inline">Home</span>
          </Link>
        </Button>
        <Button
          className={cn(
            "flex items-center justify-start gap-3",
            router === "/notifications" && activeLinkStyle,
          )}
          variant="ghost"
          title="Notification"
          asChild
        >
          <Link href="/notification">
            <Bell /> <span className="hidden lg:inline">Notifications</span>
          </Link>
        </Button>
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
            <Mail /> <span className="hidden lg:inline">Messages</span>
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
            <Bookmark /> <span className="hidden lg:inline">Bookmarks</span>
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

export default MenuBar;
