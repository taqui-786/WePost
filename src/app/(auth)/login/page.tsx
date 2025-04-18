import { Metadata } from "next";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Image from "next/image";
import React from "react";
import { SocialLogin } from "../signup/components/SocialLogin";
import { LoginAuthForm } from "./components/LoginAuthForm";


export const metadata: Metadata = {
  title: "Sign in",
};

function page() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-white p-4 dark:bg-black">
      <div className="w-full max-w-[450px]">
        <div className="relative mb-4 h-48 w-full">
          <Image
            src="https://ferf1mheo22r9ira.public.blob.vercel-storage.com/to-the-moon-u5UJD9sRK8WkmaTY8HdEsNKjAQ9bjN.svg"
            alt="To the moon illustration"
            fill
            className="object-cover"
          />
        </div>
        <Card className="w-full border-0 shadow-lg">
          <CardHeader className="space-y-2">
            <CardTitle className="text-2xl font-semibold tracking-tight text-black dark:text-white">
              Welcome Back
            </CardTitle>
            <CardDescription className="text-neutral-600 dark:text-neutral-400">
              Enter your credentials and login to your account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <LoginAuthForm />
            <SocialLogin />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default page;
