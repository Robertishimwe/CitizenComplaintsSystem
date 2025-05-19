
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Agency } from "@/types";
import { agencyApi } from "@/utils/api";

// Schema for agency form
const formSchema = z.object({
  name: z.string().min(2, {
    message: "Agency name must be at least 2 characters.",
  }),
  description: z.string().optional(),
  contactEmail: z.string().email({
    message: "Please enter a valid email address.",
  }),
  contactPhone: z.string().optional(),
  isActive: z.boolean().default(true),
});

const AdminAgencyManagement = () => {
  const { toast } = useToast();
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editingAgencyId, setEditingAgencyId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Form setup
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      contactEmail: "",
      contactPhone: "",
      isActive: true,
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await agencyApi.getAgencies();
        setAgencies(response.data);
      } catch (error) {
        console.error("Failed to fetch agencies:", error);
        toast({
          title: "Error",
          description: "Failed to load agencies. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  const handleCreateAgency = () => {
    setIsEditing(false);
    setEditingAgencyId(null);
    form.reset({
      name: "",
      description: "",
      contactEmail: "",
      contactPhone: "",
      isActive: true,
    });
    setIsDialogOpen(true);
  };

  const handleEditAgency = (agency: Agency) => {
    setIsEditing(true);
    setEditingAgencyId(agency.id);
    form.reset({
      name: agency.name,
      description: agency.description || "",
      contactEmail: agency.contactEmail,
      contactPhone: agency.contactPhone || "",
      isActive: agency.isActive,
    });
    setIsDialogOpen(true);
  };

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    if (isEditing && editingAgencyId) {
      // Update existing agency
      try {
        const updatedAgency = await agencyApi.updateAgency(editingAgencyId, {
          name: data.name,
          description: data.description || "",
          contactEmail: data.contactEmail,
          contactPhone: data.contactPhone,
        });
        
        // Update the agencies state
        setAgencies(currentAgencies =>
          currentAgencies.map((agency) =>
            agency.id === editingAgencyId ? updatedAgency : agency
          )
        );
        
        toast({
          title: "Agency Updated",
          description: "Agency information has been updated successfully.",
        });
        
        setIsDialogOpen(false);
      } catch (error) {
        console.error("Failed to update agency:", error);
        toast({
          title: "Update Failed",
          description: "There was an error updating the agency. Please try again.",
          variant: "destructive",
        });
      }
    } else {
      // Create new agency
      try {
        const newAgency = await agencyApi.createAgency({
          name: data.name,
          description: data.description || "",
          contactEmail: data.contactEmail,
          contactPhone: data.contactPhone,
        });
        
        // Add the new agency to the state
        setAgencies(currentAgencies => [...currentAgencies, newAgency]);
        
        toast({
          title: "Agency Created",
          description: "New agency has been created successfully.",
        });
        
        setIsDialogOpen(false);
      } catch (error) {
        console.error("Failed to create agency:", error);
        toast({
          title: "Creation Failed",
          description: "There was an error creating the agency. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const handleToggleActive = async (agency: Agency) => {
    try {
      const updatedAgency = await agencyApi.updateAgency(agency.id, {
        status: agency.isActive ? "INACTIVE" : "ACTIVE"
      });
      
      if (updatedAgency) {
        // Update the agencies state
        setAgencies(currentAgencies =>
          currentAgencies.map((a) => (a.id === agency.id ? updatedAgency : a))
        );
        
        toast({
          title: updatedAgency.isActive ? "Agency Activated" : "Agency Deactivated",
          description: `${agency.name} has been ${
            updatedAgency.isActive ? "activated" : "deactivated"
          } successfully.`,
        });
      }
    } catch (error) {
      console.error("Failed to update agency status:", error);
      toast({
        title: "Action Failed",
        description: "There was an error updating the agency status. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <p>Loading agencies...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Agency Management</h1>
        <div className="mt-2 sm:mt-0">
          <Button onClick={handleCreateAgency}>Create New Agency</Button>
        </div>
      </div>

      <Card className="shadow-sm border-gray-200">
        <CardHeader>
          <CardTitle>Government Agencies</CardTitle>
          <CardDescription>
            Manage agencies that handle citizen complaints
          </CardDescription>
        </CardHeader>
        <CardContent>
          {agencies.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No agencies found. Create your first agency to get started.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead>
                  <tr className="border-b">
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="py-3 px-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {agencies.map((agency) => (
                    <tr 
                      key={agency.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="font-medium">{agency.name}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-sm text-gray-900 line-clamp-2">{agency.description || 'No description'}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-sm">{agency.contactEmail}</div>
                        <div className="text-xs text-gray-500">{agency.contactPhone || 'No phone'}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          <Switch
                            checked={agency.isActive}
                            onCheckedChange={() => handleToggleActive(agency)}
                          />
                          <span className="ml-2 text-sm">
                            {agency.isActive ? "Active" : "Inactive"}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditAgency(agency)}
                        >
                          Edit
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Agency Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>{isEditing ? "Edit Agency" : "Create Agency"}</DialogTitle>
            <DialogDescription>
              {isEditing
                ? "Update the details of this government agency"
                : "Add a new government agency to the system"}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Agency Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter agency name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Brief description of the agency's responsibilities"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormDescription>
                      Describe the agency's purpose and the types of complaints they handle
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="contactEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Email</FormLabel>
                      <FormControl>
                        <Input placeholder="agency@example.gov" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="contactPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Phone (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="+1 (555) 123-4567" {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Active Status</FormLabel>
                      <FormDescription>
                        Inactive agencies won't receive new complaints
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {isEditing ? "Update Agency" : "Create Agency"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminAgencyManagement;
