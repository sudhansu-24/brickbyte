"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wallet, User, Mail, LogOut } from "lucide-react";

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading, logout, walletConnected, connectWallet, disconnectWallet } = useAuth();
  const router = useRouter();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="container flex items-center justify-center min-h-[600px]">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null; // Redirect is handled in useEffect
  }

  return (
    <div className="container py-12">
      <div className="max-w-xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">Your Profile</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
            <CardDescription>
              Manage your personal information and connected wallet
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="bg-primary/10 p-3 rounded-full">
                <User className="h-6 w-6 text-primary" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Full Name</p>
                <p className="font-medium">{user.name}</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="bg-primary/10 p-3 rounded-full">
                <Mail className="h-6 w-6 text-primary" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Email Address</p>
                <p className="font-medium">{user.email}</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="bg-primary/10 p-3 rounded-full">
                <Wallet className="h-6 w-6 text-primary" />
              </div>
              <div className="space-y-2 flex-1">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Wallet Status</p>
                  {user.walletAddress || walletConnected ? (
                    <div className="flex items-center mt-1">
                      <Badge variant="outline" className="text-green-500 border-green-500 font-mono text-xs mr-2">
                        Connected
                      </Badge>
                      <span className="text-sm font-mono truncate">
                        {user.walletAddress || "Wallet connected but not saved"}
                      </span>
                    </div>
                  ) : (
                    <p className="text-sm">No wallet connected</p>
                  )}
                </div>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={walletConnected ? disconnectWallet : connectWallet}
                >
                  <Wallet className="mr-2 h-4 w-4" />
                  {walletConnected ? "Disconnect Wallet" : "Connect Wallet"}
                </Button>
              </div>
            </div>
          </CardContent>
          
          <CardFooter>
            <Button 
              variant="outline" 
              className="w-full text-destructive hover:bg-destructive/10" 
              onClick={logout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
