import { validateRequest } from "@/auth";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import React from "react";


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
  const { user } = await validateRequest();
  if (user) redirect("/");

  return <>{children}</>;
}
