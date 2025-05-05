import { Metadata } from "next";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import React from "react";
import { SignupAuthForm } from "./components/SignupAuthForm";
import { SocialLogin } from "./components/SocialLogin";
import Icon from "@/components/Icon";
import Link from "next/link";
import { BackgroundLines } from "@/components/customComponents/animations/BackgroundLInes";

export const metadata: Metadata = {
  title: "Sign up",
};

function page() {
  return (
    <BackgroundLines svgOptions={{duration:4}} className="flex min-h-dvh items-center justify-center bg-white p-4 dark:bg-black">
      <div className="w-full max-w-[450px] z-50">
        <Card className="w-full border-0 shadow-lg">
          <CardHeader className="flex flex-col items-center space-y-2">
            <Icon className="text-primary" size={80} />
            <CardTitle className="text-2xl font-semibold tracking-tight text-black dark:text-white">
              Sign up to App
            </CardTitle>
            <CardDescription className="text-neutral-600 dark:text-neutral-400">
              Enter your credentials and create your account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <SignupAuthForm />
            <SocialLogin />
            <div className="w-full text-center">
              <span className="text-center text-xs">
                Dont have an account!{" "}
                <Link href={"/login"} className="text-primary hover:underline">
                  Login
                </Link>
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </BackgroundLines>
  );
}

export default page;
