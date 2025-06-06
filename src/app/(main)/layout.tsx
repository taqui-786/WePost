import { validateRequest } from "@/auth";
import { redirect } from "next/navigation";
import React from "react";
import SessionProvider from "./SessionProvider";
import Navbar from "./Navbar";
import MenuBar from "@/components/MenuBar";
import { SocketProvider } from "@/hooks/SocketContext";
import { Metadata } from "next";
export const metadata: Metadata = {
  title: {
    default: "WePost",
    template: `WePost | %s`,
  },
}
export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await validateRequest();
  if (!session.user) redirect("/login");

  return (
    <SessionProvider value={session}>
       <SocketProvider>

      <div className="flex min-h-dvh h-full flex-col bg-background">
        <Navbar />
        <div className="mx-auto flex w-full max-w-7xl grow gap-5 p-5">
          <MenuBar className=" sticky top-[5.25rem] hidden h-fit flex-none  rounded-2xl   sm:block  xl:w-80" />
          {children}
        </div>
        <MenuBar className="sticky bottom-0 flex w-full justify-center gap-5 border-t bg-card py-2 sm:hidden" />
      </div>
       </SocketProvider>
    </SessionProvider>
  );
}
