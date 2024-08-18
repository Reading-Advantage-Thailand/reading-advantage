"use client";

import { Button } from "@/components/ui/button";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="text-red-400">
      <h2 className="text-xl">Something went wrong!</h2>
      <p>
        An error occurred while rendering this page. Please try again later.
      </p>
      {<p>{error.message}</p>}
      {error.digest && (
        <p>
          Error digest: <code>{error.digest}</code>
        </p>
      )}
      {
        // Show more details about the error
        process.env.NODE_ENV === "development" && (
          <details className="mt-4">
            <summary>Details</summary>
            <pre>{error.stack}</pre>
          </details>
        )
      }
      <Button onClick={reset} className="mt-4" variant="destructive">
        Reload
      </Button>
    </div>
  );
}
