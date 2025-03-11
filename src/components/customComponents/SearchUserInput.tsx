'use client'
import { Input } from "@/components/ui/input";
import { ArrowRight, Search } from "lucide-react";
import { useRouter } from "next/navigation";

export default function SearchUserInput() {
  const router = useRouter()
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const q = (form.q as HTMLInputElement).value.trim();
    if (!q) return;
    router.push(`/search?q=${encodeURIComponent(q)}`)
  };
  return (
    <form onSubmit={handleSubmit} method="GET" action="/search">
      <div className="min-w-[270px]">
        <div className="relative">
          <Input
            name="q"
            className="peer ps-9 pe-9"
            placeholder="Search..."
          />
          <div className="text-muted-foreground/80 pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 peer-disabled:opacity-50">
            <Search size={16} strokeWidth={2} />
          </div>
          <button
            className="text-muted-foreground/80 hover:text-foreground focus-visible:outline-ring/70 absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-lg outline-offset-2 transition-colors focus:z-10 focus-visible:outline  disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Submit search"
            type="submit"
          >
            <ArrowRight size={16} strokeWidth={2} aria-hidden="true" />
          </button>
        </div>
      </div>
    </form>
  );
}
