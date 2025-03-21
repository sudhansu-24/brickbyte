"use client";

import { Button } from '@/components/ui/button';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div className="container flex flex-col items-center justify-center min-h-screen py-12 text-center">
          <h1 className="text-4xl font-bold mb-4">Something went wrong!</h1>
          <p className="text-lg mb-8">Please try again later.</p>
          <Button onClick={reset}>Try again</Button>
        </div>
      </body>
    </html>
  );
}
