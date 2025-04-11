import SearchUserInput from "@/components/customComponents/SearchUserInput";
import NavbarUserMenu from "@/components/customComponents/NavbarUserMenu";
import Icon from "@/components/Icon";
import Link from "next/link";
import React from "react";

function Navbar() {
  return (
    <header className="bg-background sticky top-0 z-10 border-b">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-5 px-2 sm:px-5 py-3">
        <div className="flex items-center justify-center gap-2">
          <Icon className="text-primary " fill="#6E56CF" />
          <Link href="/" className="text-primary text-2xl font-bold hidden sm:inline">
          WePost
          </Link>
        </div>
        <SearchUserInput />
        <NavbarUserMenu />
      </div>
    </header>
  );
}

export default Navbar;
