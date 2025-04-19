
import { validateRequest } from "@/auth";
import Users from "@/components/messages/Users";
import { notFound } from "next/navigation";
import React from "react";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const loggedinUser = await validateRequest() 
if(!loggedinUser) return notFound()
  return (
    <main className="w-full flex   rounded-lg border bg-card text-card-foreground shadow-sm ">
     <Users userId={loggedinUser.user?.id }/>
        {children}
    
    </main>
  );
}
