import { Metadata } from "next";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import React from "react";
import { SocialLogin } from "../signup/components/SocialLogin";
import { LoginAuthForm } from "./components/LoginAuthForm";
import Icon from "@/components/Icon";
import Link from "next/link";
import { BackgroundLines } from "@/components/customComponents/animations/BackgroundLInes";


export const metadata: Metadata = {
  title: "Login",
};

function page() {
  return (
    <BackgroundLines svgOptions={{duration:4}} className="flex min-h-dvh items-center justify-center bg-white p-4 dark:bg-black">
      <div  className="w-full max-w-[450px] z-50">
  
        <Card className="w-full border-0 shadow-lg">
          <CardHeader className="space-y-2 flex flex-col items-center">
          <Icon className="text-primary " size={80} />
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
            <div className="w-full text-center">

            <span className="text-xs  text-center">Dont have an account! <Link href={'/signup'} className="text-primary hover:underline">Sign-up</Link></span>
            </div>
          </CardContent>
        </Card>
      </div >
    </BackgroundLines>
  );
}

export default page;
