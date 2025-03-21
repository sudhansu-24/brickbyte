"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useCreateProposal } from "@/hooks/useGovernanceCombined";
import { useProperties } from "@/hooks/useProperties";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { CalendarIcon, ArrowLeft, Plus, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export default function CreateProposalPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { properties, isLoading: propertiesLoading } = useProperties();
  const { createProposal, isLoading: createLoading } = useCreateProposal();
  const { toast } = useToast();
  const router = useRouter();
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [propertyId, setPropertyId] = useState("");
  const [options, setOptions] = useState<string[]>(["Yes", "No"]);
  const [newOption, setNewOption] = useState("");
  const [startDate, setStartDate] = useState<Date | undefined>(new Date());
  const [endDate, setEndDate] = useState<Date | undefined>(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)); // 7 days from now

  const isLoading = authLoading || propertiesLoading;

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  const addOption = () => {
    if (newOption.trim() && !options.includes(newOption.trim())) {
      setOptions([...options, newOption.trim()]);
      setNewOption("");
    }
  };

  const removeOption = (index: number) => {
    setOptions(options.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !description || !propertyId || options.length < 2 || !startDate || !endDate) {
      toast({
        title: "Missing Fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    
    if (endDate <= startDate) {
      toast({
        title: "Invalid Date Range",
        description: "End date must be after start date.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      await createProposal({
        title,
        description,
        propertyId,
        options,
        startDate: startDate as Date,
        endDate: endDate as Date,
      });
      
      toast({
        title: "Proposal Created",
        description: "Your governance proposal has been created successfully.",
      });
      
      router.push("/governance");
    } catch (error: any) {
      toast({
        title: "Failed to Create Proposal",
        description: error.message || "Could not create the proposal. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="container flex items-center justify-center min-h-[600px]">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Redirect is handled in useEffect
  }

  return (
    <div className="container py-12">
      <Button variant="ghost" className="mb-8" onClick={() => router.push('/governance')}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Governance
      </Button>

      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Create Governance Proposal</CardTitle>
          <CardDescription>
            Create a new proposal for property governance. All token holders will be able to vote on this proposal.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Proposal Title</Label>
              <Input 
                id="title" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                placeholder="Enter a clear and concise title"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description" 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                placeholder="Provide details about your proposal"
                className="min-h-[120px]"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="property">Related Property</Label>
              <Select value={propertyId} onValueChange={setPropertyId} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select a property" />
                </SelectTrigger>
                <SelectContent>
                  {properties?.map((property: any) => (
                    <SelectItem key={property._id} value={property._id}>
                      {property.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Voting Options</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {options.map((option: string, index: number) => (
                  <div key={index} className="flex items-center bg-muted px-3 py-1 rounded-md">
                    <span>{option}</span>
                    {options.length > 2 && (
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6 ml-1" 
                        onClick={() => removeOption(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Input 
                  value={newOption} 
                  onChange={(e) => setNewOption(e.target.value)} 
                  placeholder="Add another option"
                  className="flex-1"
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={addOption}
                  disabled={!newOption.trim()}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">You need at least 2 options. Default is Yes/No.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !startDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "PPP") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      initialFocus
                      disabled={(date) => date < new Date()}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="space-y-2">
                <Label>End Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !endDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "PPP") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      initialFocus
                      disabled={(date) => startDate ? date <= startDate : date <= new Date()}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            
            <Button type="submit" className="w-full" disabled={createLoading}>
              {createLoading ? "Creating..." : "Create Proposal"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
