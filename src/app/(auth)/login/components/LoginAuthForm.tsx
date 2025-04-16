"use client";

import type React from "react";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AtSign, Loader2, LockIcon } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { signinSchema, signinSchemaValues } from "@/lib/validation";
import { login } from "../action";

export function LoginAuthForm() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string>();
  const form = useForm<signinSchemaValues>({
    resolver: zodResolver(signinSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });
  async function handleSubmit(values: signinSchemaValues) {
    setError(undefined);
    startTransition(async () => {
      const { error } = await login(values);
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
              <div className="relative flex items-center justify-center">
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
              </div>
              <FormMessage className="text-red-500" />
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
              </div>
              <FormMessage className="text-red-500" />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          disabled={isPending}
          className="h-12 w-full text-base font-medium transition-colors hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
        >
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isPending ? "logging in..." : "Log in"}
        </Button>
      </form>
    </Form>
  );
}
