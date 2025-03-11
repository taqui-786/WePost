import SearchUserInput from "@/components/customComponents/SearchUserInput";
import UserButton from "@/components/customComponents/UserButton";
import Link from "next/link";
import React from "react";

function Navbar() {
  return (
    <header className="bg-card sticky top-0 z-10 shadow-sm">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-5 px-5 py-3">
        <Link href="/" className="text-2xl font-bold text-primary">SocialBook</Link>
        <SearchUserInput/>
        <UserButton/>
      </div>
    </header>
  );
}

export default Navbar;
