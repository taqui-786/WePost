'use client'
import React from "react";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Bell } from "lucide-react";
import { notificationCountInfo } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";
import kyInstance from "@/lib/ky";

function NotificationBtn({
  router,
  activeLinkStyle,
  initialState,
}: {
  router: string;
  activeLinkStyle: string;
  initialState: notificationCountInfo;
}) {
    
  const { data } = useQuery({
    queryKey: ["unread-notifications-count"],
    queryFn: () =>
      kyInstance
        .get("/api/notifications/unread-count")
        .json<notificationCountInfo>(),
    initialData: initialState,
    refetchInterval: 60 * 1000,
  });
  return (
      <Button
        className={cn(
          "flex items-center justify-start gap-3 px-[10px]",
          router === "/notifications" && activeLinkStyle,
        )}
        variant="ghost"
        title="Notification"
        asChild
      >
       <Link href="/notifications">
        <div className="relative">
          <Bell className="shrink-0 size-5" />
          {!!data.unreadcount && (
            <span className="absolute -right-1 -top-2 rounded-full bg-primary px-1 text-[10px] font-medium tabular-nums text-primary-foreground">
              {data.unreadcount}
            </span>
          )}
        </div>

        <span className="hidden lg:inline">Notifications</span>
      </Link>
      </Button>
  );
}

export default NotificationBtn;
