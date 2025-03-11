"use client";

import type React from "react";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AtSign, Loader2, LockIcon, Mail } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { signupSchema, signupSchemaValues } from "@/lib/validation";
import { signUp } from "../action";

export function SignupAuthForm() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string>();
  const form = useForm<signupSchemaValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: "",
      password: "",
      username: "",
    },
  });
  async function handleSubmit(values: signupSchemaValues) {
    setError(undefined);
    startTransition(async () => {
      const { error } = await signUp(values);
      if (error) setError(error);
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        {error && <p className="text-center text-sm text-red-400">{error}</p>}
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem className="space-y-0">
              <label
                htmlFor="email"
                className="text-sm font-medium text-black dark:text-white"
              >
                Username
              </label>
              <div className="relative">
                <AtSign className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-500" />

                <FormControl>
                  <Input
                    type="text"
                    placeholder="example_123"
                    required
                    disabled={isPending}
                    className="bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring h-12 pl-10 focus-visible:ring-1"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </div>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem className="space-y-0">
              <label
                htmlFor="email"
                className="text-sm font-medium text-black dark:text-white"
              >
                Email
              </label>
              <div className="relative">
                <Mail className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-500" />

                <FormControl>
                  <Input
                    type="email"
                    placeholder="name@example.com"
                    required
                    disabled={isPending}
                    className="bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring h-12 pl-10 focus-visible:ring-1"
                    autoComplete="email"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </div>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem className="space-y-0">
              <label className="text-sm font-medium text-black dark:text-white">
                Password
              </label>
              <div className="relative">
                <LockIcon className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-500" />
                <FormControl>
                  <Input
                    type="password"
                    placeholder="Enter your password"
                    required
                    disabled={isPending}
                    className="bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring h-12 pl-10 focus-visible:ring-1"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </div>
            </FormItem>
          )}
        />

        <Button
          type="submit"
          disabled={isPending}
          className="h-12 w-full bg-black text-base font-medium text-white transition-colors hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
        >
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isPending ? "Signing up..." : "Sign up"}
        </Button>
      </form>
    </Form>
  );
}
