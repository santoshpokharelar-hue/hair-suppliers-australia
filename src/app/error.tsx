"use client";

import { AlertTriangle } from "lucide-react";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-1 items-center justify-center px-5 py-20">
      <div className="max-w-md text-center">
        <AlertTriangle className="mx-auto mb-3 size-8 text-destructive" />
        <h1 className="font-display text-xl font-bold text-plum-dark">Something went wrong</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          We hit an unexpected error. Try again, or come back in a moment.
        </p>
        <Button onClick={() => reset()} className="mt-5">
          Try again
        </Button>
      </div>
    </div>
  );
}
