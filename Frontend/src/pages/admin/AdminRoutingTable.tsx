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
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { categoryApi, agencyApi, routingRuleApi } from "@/utils/api";
import { RoutingRule, Agency, Category } from "@/types";

// Form schema for creating/editing routing rules
const formSchema = z.object({
  categoryId: z.string({
    required_error: "Please select a category.",
  }),
  agencyId: z.string({
    required_error: "Please select an agency.",
  }),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
});

const AdminRoutingTable = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Fetch routing rules - fixed to use meta.onError instead of onSuccess/onError
  const { data: routingRulesData } = useQuery({
    queryKey: ['routingRules'],
    queryFn: routingRuleApi.getRoutingRules,
    meta: {
      onError: (error: Error) => {
        console.error("Error fetching routing rules:", error);
        toast({
          title: "Error",
          description: "Failed to fetch routing rules. Please try again.",
          variant: "destructive",
        });
      }
    }
  });

  // Set loading state using useEffect instead of onSuccess
  useEffect(() => {
    if (routingRulesData) {
      setIsLoading(false);
    }
  }, [routingRulesData]);
  
  // Fetch categories
  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: categoryApi.getCategories,
  });

  // Fetch agencies
  const { data: agenciesData } = useQuery({
    queryKey: ['agencies'],
    queryFn: agencyApi.getAgencies,
  });

  // Create routing rule mutation
  const createRuleMutation = useMutation({
    mutationFn: (data: { 
      categoryId: string; 
      assignedAgencyId: string; 
      description: string; 
    }) => routingRuleApi.createRoutingRule(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routingRules'] });
      toast({
        title: "Rule Created",
        description: "New routing rule has been created successfully.",
      });
      setIsDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create routing rule.",
        variant: "destructive",
      });
      console.error("Error creating routing rule:", error);
    }
  });

  // Update routing rule mutation
  const updateRuleMutation = useMutation({
    mutationFn: ({ 
      id, 
      data 
    }: { 
      id: string; 
      data: { 
        categoryId?: string; 
        assignedAgencyId?: string; 
        description?: string; 
        status?: string; 
      } 
    }) => routingRuleApi.updateRoutingRule(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routingRules'] });
      toast({
        title: "Rule Updated",
        description: "Routing rule has been updated successfully.",
      });
      setIsDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update routing rule.",
        variant: "destructive",
      });
      console.error("Error updating routing rule:", error);
    }
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      categoryId: "",
      agencyId: "",
      description: "",
      isActive: true,
    },
  });

  const routingRules = routingRulesData?.data || [];
  const categories = categoriesData?.data || [];
  const agencies = agenciesData?.data || [];

  const handleCreateRule = () => {
    setIsEditing(false);
    setEditingRuleId(null);
    form.reset({
      categoryId: "",
      agencyId: "",
      description: "",
      isActive: true,
    });
    setIsDialogOpen(true);
  };

  const handleEditRule = (rule: RoutingRule) => {
    setIsEditing(true);
    setEditingRuleId(rule.id);
    form.reset({
      categoryId: rule.categoryId,
      agencyId: rule.agencyId,
      description: rule.description || "",
      isActive: rule.isActive,
    });
    setIsDialogOpen(true);
  };

  const handleToggleActive = (rule: RoutingRule) => {
    updateRuleMutation.mutate({
      id: rule.id,
      data: {
        status: rule.isActive ? 'INACTIVE' : 'ACTIVE',
      }
    });
  };

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    if (isEditing && editingRuleId) {
      // Update existing rule
      updateRuleMutation.mutate({
        id: editingRuleId,
        data: {
          categoryId: data.categoryId,
          assignedAgencyId: data.agencyId,
          description: data.description,
          status: data.isActive ? 'ACTIVE' : 'INACTIVE',
        }
      });
    } else {
      // Create new rule
      createRuleMutation.mutate({
        categoryId: data.categoryId,
        assignedAgencyId: data.agencyId,
        description: data.description || "",
      });
    }
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : "Unknown Category";
  };

  const getAgencyName = (agencyId: string) => {
    const agency = agencies.find(a => a.id === agencyId);
    return agency ? agency.name : "Unknown Agency";
  };

  // Get non-parent categories (leaf nodes)
  const getLeafCategories = () => {
    // This implementation shows all categories, but you could filter to show only leaf categories
    return categories;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <p>Loading routing configuration...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Routing Table</h1>
        <div className="mt-2 sm:mt-0">
          <Button onClick={handleCreateRule}>Create New Rule</Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Routing Configuration</CardTitle>
          <CardDescription>
            Configure how tickets are automatically routed to agencies based on categories
          </CardDescription>
        </CardHeader>
        <CardContent>
          {routingRules.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No routing rules configured yet. Create your first rule to get started.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead>
                  <tr className="border-b">
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned Agency</th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {routingRules.map((rule) => (
                    <tr key={rule.id}>
                      <td className="py-3 px-4 text-sm">
                        {getCategoryName(rule.categoryId)}
                      </td>
                      <td className="py-3 px-4 text-sm">
                        {getAgencyName(rule.agencyId)}
                      </td>
                      <td className="py-3 px-4 text-sm">
                        {rule.description || "No description"}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          <Switch
                            checked={rule.isActive}
                            onCheckedChange={() => handleToggleActive(rule)}
                          />
                          <span className="ml-2 text-sm">
                            {rule.isActive ? "Active" : "Inactive"}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Button variant="ghost" size="sm" onClick={() => handleEditRule(rule)}>
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

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>{isEditing ? "Edit Routing Rule" : "Create Routing Rule"}</DialogTitle>
            <DialogDescription>
              {isEditing
                ? "Modify the details of this routing rule"
                : "Configure how tickets are automatically routed to agencies"}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {getLeafCategories().map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      The complaint category that this rule applies to
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="agencyId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Agency</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select an agency" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {agencies
                          .filter(a => a.isActive)
                          .map((agency) => (
                            <SelectItem key={agency.id} value={agency.id}>
                              {agency.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      The agency that will handle tickets in this category
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Brief description of this routing rule" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Active Status</FormLabel>
                      <FormDescription>
                        Enable or disable this routing rule
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
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createRuleMutation.isPending || updateRuleMutation.isPending}
                >
                  {isEditing 
                    ? (updateRuleMutation.isPending ? "Updating..." : "Update Rule")
                    : (createRuleMutation.isPending ? "Creating..." : "Create Rule")}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminRoutingTable;
