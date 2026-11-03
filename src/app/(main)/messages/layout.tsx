
import { validateRequest } from "@/auth";
import Users from "@/components/messages/Users";
import { notFound } from "next/navigation";
import React from "react";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await validateRequest();
  if (!session.user) return notFound();

  return (
    <main className="flex min-h-0 w-full overflow-hidden rounded-lg border bg-card text-card-foreground shadow-sm">
      <Users
        userId={session.user.id}
        className="hidden min-h-0 w-80 flex-col border-r md:flex lg:w-96"
      />
      {children}
    </main>
  );
}
