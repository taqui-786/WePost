import React from "react";
import { Button } from "./ui/button";
import Link from "next/link";
import { Bell, Bookmark, Home, Mail } from "lucide-react";

interface MenuBarProps {
  className?: string;
}
function MenuBar({ className }: MenuBarProps) {
  return (
    <div className={className}>
      <Button
        className="flex items-center justify-start gap-3"
        variant="ghost"
        title="Home"
        asChild
      >
        <Link href="/">
          <Home /> <span className="hidden lg:inline">Home</span>
        </Link>
      </Button>
      <Button
        className="flex items-center justify-start gap-3"
        variant="ghost"
        title="Notification"
        asChild
      >
        <Link href="/notification">
          <Bell /> <span className="hidden lg:inline">Notifications</span>
        </Link>
      </Button>
      <Button
        className="flex items-center justify-start gap-3"
        variant="ghost"
        title="Messages"
        asChild
      >
        <Link href="/messages">
          <Mail /> <span className="hidden lg:inline">Messages</span>
        </Link>
      </Button>
      <Button
        className="flex items-center justify-start gap-3"
        variant="ghost"
        title="Bookmarks"
        asChild
      >
        <Link href="/bookmarks">
          <Bookmark /> <span className="hidden lg:inline">Bookmarks</span>
        </Link>
      </Button>
    </div>
  );
}

export default MenuBar;
