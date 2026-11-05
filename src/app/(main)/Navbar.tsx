import SearchUserInput from "@/components/customComponents/SearchUserInput";
import NavbarUserMenu from "@/components/customComponents/NavbarUserMenu";
import Icon from "@/components/Icon";
import Link from "next/link";
import React from "react";
import { Github } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

function Navbar() {
  return (
    <header className="bg-background sticky top-0 z-10 border-b">
      <div className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between gap-1 px-2 sm:gap-3 sm:px-5">
        <div className="flex min-w-0 items-center gap-1.5 sm:gap-3">
          <Link
            href="/"
            aria-label="WePost home"
            className="flex shrink-0 items-center justify-center gap-2"
          >
            <Icon className="text-primary" size={30} />
            <span className="text-primary hidden text-2xl font-bold font-breeserif sm:inline">
              WePost
            </span>
          </Link>
          <SearchUserInput />
        </div>

        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          <Link
            href="https://github.com/taqui-786/WePost"
            target="_blank"
            aria-label="View source on GitHub"
            className={cn(
              buttonVariants({ variant: "ghost", size: "icon" }),
              "text-foreground/80 hover:text-foreground sm:size-auto sm:px-4"
            )}
          >
            <Github className="size-5 sm:size-4" />
            <span className="hidden font-semibold sm:inline">Github</span>
          </Link>
          <NavbarUserMenu />
        </div>
      </div>
    </header>
  );
}

export default Navbar;
