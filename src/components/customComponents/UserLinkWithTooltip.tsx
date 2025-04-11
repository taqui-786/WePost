"use client";
import kyInstance from "@/lib/ky";
import { UserData } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";
import { HTTPError } from "ky";
import Link from "next/link";
import React, { PropsWithChildren } from "react";
import UserTooltip from "./UserTooltip";
interface UserLinkWithTooltipProps extends PropsWithChildren {
  username: string;
}
export default function UserLinkWithTooltip({
  username,
  children,
}: UserLinkWithTooltipProps) {
  const { data } = useQuery({
    queryKey: ["user-data", username],
    queryFn: () =>
      kyInstance.get(`/api/users/username/${username}`).json<UserData>(),
    retry(failuerCount, error) {
      if (error instanceof HTTPError && error.response.status === 404) {
        return false;
      }
      return failuerCount < 3;
    },
    staleTime: Infinity,
  });

  if (!data) {
    return (
      <Link
        href={`/users/${username}`}
        className="text-primary hover:underline"
      >
        {children}
      </Link>
    );
  }
  return (
    <UserTooltip user={data}>
      <Link
        href={`/users/${username}`}
        className="text-primary hover:underline"
        suppressHydrationWarning
      >
        {children}
      </Link>
    </UserTooltip>
  );
}
