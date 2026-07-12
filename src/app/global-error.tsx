"use client";

import { useEffect } from "react";

// Only fires if the root layout itself throws — kept dependency-free (no
// Tailwind classes, no shared components) since those may be exactly what's
// broken. Everything else in the app uses app/error.tsx instead.
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body style={{ fontFamily: "sans-serif", padding: "48px 20px", textAlign: "center" }}>
        <h1 style={{ fontSize: 20, fontWeight: 700 }}>Something went wrong</h1>
        <p style={{ color: "#666", marginTop: 8 }}>Please refresh the page, or try again shortly.</p>
        <button
          onClick={() => reset()}
          style={{
            marginTop: 20,
            padding: "10px 20px",
            borderRadius: 8,
            border: "none",
            background: "#5C2E4E",
            color: "#fff",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Try again
        </button>
      </body>
    </html>
  );
}
