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
    <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-5 px-2 sm:px-5 py-3">
        <div className="flex gap-5">

        <div className="flex items-center justify-center gap-2">
          <Icon className="text-primary " size={30}  />
          <Link href="/" className="text-primary text-2xl font-bold hidden sm:inline font-breeserif">
          WePost
          </Link>
        </div>
        <SearchUserInput />
        </div>
        <div className="flex items-center gap-3">

        <Link href="https://github.com/taqui-786/WePost" target="_blank" className={cn(buttonVariants({variant:"ghost"}),"font-semibold animate-pulse")} ><Github size={4} /> Github</Link>
        <NavbarUserMenu />
        </div>
      </div>
    </header>
  );
}

export default Navbar;
