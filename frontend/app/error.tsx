"use client";

import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

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
    <div className="container flex flex-col items-center justify-center min-h-screen py-12 text-center">
      <h1 className="text-4xl font-bold mb-4">Something went wrong!</h1>
      <p className="text-lg mb-8">We apologize for the inconvenience.</p>
      <div className="flex gap-4">
        <Button onClick={reset}>Try again</Button>
        <Link href="/">
          <Button variant="outline">Return to Home</Button>
        </Link>
      </div>
    </div>
  );
}
