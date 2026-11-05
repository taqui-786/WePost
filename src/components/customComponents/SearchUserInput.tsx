"use client";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";

export default function SearchUserInput() {
  const router = useRouter();
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const q = (form.q as HTMLInputElement).value.trim();
    if (!q) return;
    router.push(`/search?q=${encodeURIComponent(q)}`);
  };
  return (
    <form
      onSubmit={handleSubmit}
      method="GET"
      action="/search"
      className="min-w-0 flex-1 sm:flex-initial" role="search">
      <div className="relative w-full sm:w-48 md:w-64 lg:w-72 xl:w-80 overflow-hidden rounded-2xl bg-gray-100 p-[1px]">
        <Input
          name="q"
          aria-label="Search posts and users"
          className="peer ps-9 pe-9 py-2 rounded-2xl border-none bg-gray-100 focus-visible:ring-0 focus-visible:ring-offset-0"
          placeholder="Search..."
        />
        <div className="text-muted-foreground/80 pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 peer-disabled:opacity-50">
          <Search size={16} strokeWidth={2} />
        </div>
      </div>
    </form>
  );
}
