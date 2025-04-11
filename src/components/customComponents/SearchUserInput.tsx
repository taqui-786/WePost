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
    <form onSubmit={handleSubmit} method="GET" action="/search">
    <div className="min-w-[270px] bg-gray-100 rounded-2xl  p-[1px]">
      <div className="relative rounded-2xl overflow-hidden">
        <Input
          name="q"
          className="peer ps-10 pe-10 py-2 rounded-2xl border-none bg-gray-100 focus-visible:ring-0 focus-visible:ring-offset-0"
          placeholder="Search..."
        />
        <div className="text-muted-foreground/80 pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 peer-disabled:opacity-50">
          <Search size={16} strokeWidth={2} />
        </div>
      </div>
    </div>
  </form>
  
  );
}
