import React from "react";

function Loading() {
  return (
    <main className="flex h-screen w-screen items-center justify-center">
      <div className="text-center">
        <div className="border-primary mx-auto h-16 w-16 animate-spin rounded-full border-4 border-dashed"></div>
        <h2 className="mt-4 text-black dark:text-white">Loading...</h2>
        <p className="text-muted-foreground dark:text-zinc-400">
          Your adventure is about to begin
        </p>
      </div>
    </main>
  );
}

export default Loading;
