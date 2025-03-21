"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import GovernanceDashboard from "@/components/governance-dashboard";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

export default function GovernancePage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
      toast({
        title: "Authentication Required",
        description: "Please log in to access the governance features.",
        variant: "destructive"
      });
    }
  }, [authLoading, isAuthenticated, router, toast]);

  if (authLoading) {
    return (
      <div className="container py-12">
        <div className="flex flex-col space-y-3">
          <Skeleton className="h-8 w-[250px]"/>
          <Skeleton className="h-4 w-[300px]"/>
        </div>
        <div className="mt-8 grid gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-[200px] w-full rounded-xl"/>
          ))}
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Redirect is handled in useEffect
  }

  return (
    <div className="container py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Governance</h1>
          <p className="text-muted-foreground mt-1">Vote on property decisions and participate in governance</p>
        </div>
      </div>
      
      <GovernanceDashboard />
    </div>
  );
}
