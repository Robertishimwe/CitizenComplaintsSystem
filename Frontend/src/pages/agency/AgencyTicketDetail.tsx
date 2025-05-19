import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import * as React from "react"; // Add React import
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/context/AuthContext";
import { 
  ticketApi, 
  agencyApi, 
  userApi,
  mapStatusToApi,
  mapPriorityToApi,
} from "@/utils/api";
import { 
  Ticket, 
  TicketStatus, 
  TicketPriority,
  ApiTicketStatus,
  ApiTicketPriority,
  User,
  Agency,
} from "@/types";
import { Loader, AlertCircle } from "lucide-react";

const messageFormSchema = z.object({
  message: z.string().min(5, {
    message: "Message must be at least 5 characters.",
  }),
  isInternal: z.boolean().default(false),
});

const ticketUpdateFormSchema = z.object({
  status: z.string(),
  priority: z.string(),
});

const assignAgentFormSchema = z.object({
  assignedAgentId: z.string().optional(),
});

const transferTicketFormSchema = z.object({
  newAgencyId: z.string(),
  transferComment: z.string().min(5, {
    message: "Transfer comment must be at least 5 characters.",
  }),
});

const AgencyTicketDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  
  // Form handlers
  const messageForm = useForm<z.infer<typeof messageFormSchema>>({
    resolver: zodResolver(messageFormSchema),
    defaultValues: {
      message: "",
      isInternal: false,
    },
  });
  
  const updateForm = useForm<z.infer<typeof ticketUpdateFormSchema>>({
    resolver: zodResolver(ticketUpdateFormSchema),
    defaultValues: {
      status: 'new',
      priority: 'medium',
    }
  });
  
  const assignAgentForm = useForm<z.infer<typeof assignAgentFormSchema>>({
    resolver: zodResolver(assignAgentFormSchema),
    defaultValues: {
      assignedAgentId: undefined,
    }
  });
  
  const transferForm = useForm<z.infer<typeof transferTicketFormSchema>>({
    resolver: zodResolver(transferTicketFormSchema),
    defaultValues: {
      newAgencyId: "",
      transferComment: "",
    }
  });

  // Data fetching
  const { data: ticketData, isLoading: isLoadingTicket, isError: isTicketError, error: ticketError } = 
    useQuery({
      queryKey: ['ticket', id],
      queryFn: () => ticketApi.getTicketWithCommunications(id || ''),
      enabled: !!id,
    });

  // Update form when ticket data is loaded
  React.useEffect(() => {
    if (ticketData) {
      // Initialize form values with ticket data
      updateForm.setValue('status', ticketData.status);
      updateForm.setValue('priority', ticketData.priority);
      if (ticketData.assignedAgentId) {
        assignAgentForm.setValue('assignedAgentId', ticketData.assignedAgentId);
      }
    }
  }, [ticketData, updateForm, assignAgentForm]);

  const { data: agenciesData, isLoading: isLoadingAgencies } = useQuery({
    queryKey: ['agencies'],
    queryFn: agencyApi.getAgencies,
  });

  const { data: usersData, isLoading: isLoadingUsers } = useQuery({
    queryKey: ['users'],
    queryFn: userApi.getUsers,
  });

  // Filtered list of users from current agency
  const agencyStaff = usersData?.data.filter(staffUser => 
    staffUser.role === 'agency' && 
    staffUser.agencyId === user?.agencyId
  ) || [];

  // Filtered list of agencies (excluding current one)
  const otherAgencies = agenciesData?.data.filter(agency => 
    agency.id !== ticketData?.assignedAgencyId && 
    agency.isActive
  ) || [];

  // Mutations
const sendMessageMutation = useMutation({
  mutationFn: (data: { ticketId: string, message: string, isInternal: boolean }) => {
    return ticketApi.sendMessage(data.ticketId, data.message, data.isInternal); // Pass isInternal
  },
  onSuccess: () => {
    toast({
      title: "Message sent",
      description: "Your message has been sent successfully.",
    });
    messageForm.reset();
    queryClient.invalidateQueries({ queryKey: ['ticket', id] });
  },
  onError: (error) => {
    toast({
      title: "Error",
      description: "Failed to send message. Please try again.",
      variant: "destructive",
    });
    console.error("Error sending message:", error);
  }
});

  const updateTicketMutation = useMutation({
    mutationFn: (data: { ticketId: string, status: ApiTicketStatus, priority: ApiTicketPriority }) => {
      return ticketApi.updateTicketStatus(data.ticketId, {
        status: data.status,
        priority: data.priority
      });
    },
    onSuccess: () => {
      toast({
        title: "Ticket updated",
        description: "Ticket status and priority have been updated.",
      });
      queryClient.invalidateQueries({ queryKey: ['ticket', id] });
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update ticket. Please try again.",
        variant: "destructive",
      });
      console.error("Error updating ticket:", error);
    }
  });

  const assignAgentMutation = useMutation({
    mutationFn: (data: { ticketId: string, assignedAgentId: string }) => {
      return ticketApi.assignAgent(data.ticketId, {
        assignedAgentId: data.assignedAgentId
      });
    },
    onSuccess: () => {
      toast({
        title: "Agent assigned",
        description: "Ticket has been assigned to the selected agent.",
      });
      queryClient.invalidateQueries({ queryKey: ['ticket', id] });
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to assign agent. Please try again.",
        variant: "destructive",
      });
      console.error("Error assigning agent:", error);
    }
  });

  const transferTicketMutation = useMutation({
    mutationFn: (data: { ticketId: string, newAgencyId: string, transferComment: string }) => {
      return ticketApi.transferTicket(data.ticketId, {
        newAgencyId: data.newAgencyId,
        transferComment: data.transferComment
      });
    },
    onSuccess: () => {
      toast({
        title: "Ticket transferred",
        description: "Ticket has been transferred to another agency.",
      });
      setIsTransferModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['ticket', id] });
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      
      // Navigate back to tickets list if user transferred to another agency
      navigate("/agency/tickets");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to transfer ticket. Please try again.",
        variant: "destructive",
      });
      console.error("Error transferring ticket:", error);
    }
  });

  // Form submit handlers
const onSendMessage = async (data: z.infer<typeof messageFormSchema>) => {
  if (!id) return;

  sendMessageMutation.mutate({
    ticketId: id,
    message: data.message,
    isInternal: data.isInternal, // Pass the value from the form
  });
};

  const onUpdateTicket = async (data: z.infer<typeof ticketUpdateFormSchema>) => {
    if (!id) return;
    
    updateTicketMutation.mutate({
      ticketId: id,
      status: mapStatusToApi(data.status as TicketStatus),
      priority: mapPriorityToApi(data.priority as TicketPriority),
    });
  };

  const onAssignAgent = async (data: z.infer<typeof assignAgentFormSchema>) => {
    if (!id || !data.assignedAgentId) return;
    
    assignAgentMutation.mutate({
      ticketId: id,
      assignedAgentId: data.assignedAgentId,
    });
  };

  const onTransferTicket = async (data: z.infer<typeof transferTicketFormSchema>) => {
    if (!id) return;
    
    transferTicketMutation.mutate({
      ticketId: id,
      newAgencyId: data.newAgencyId,
      transferComment: data.transferComment,
    });
  };

  // Helper functions
  const getStatusClass = (status: string) => {
    switch (status) {
      case "new":
        return "bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs";
      case "assigned":
        return "bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs";
      case "in_progress_pending_agent":
        return "bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs";
      case "in_progress_pending_citizen":
        return "bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full text-xs";
      case "resolved":
        return "bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs";
      case "closed":
        return "bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs";
      case "reopened":
        return "bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs";
      default:
        return "bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs";
    }
  };
  
  const getPriorityClass = (priority: string) => {
    switch (priority) {
      case "low":
        return "bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs";
      case "medium":
        return "bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs";
      case "high":
        return "bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs";
      case "urgent":
        return "bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs";
      default:
        return "bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs";
    }
  };
  
  const getStatusText = (status: string): string => {
    switch (status) {
      case "new":
        return "New";
      case "assigned":
        return "Assigned";
      case "in_progress_pending_agent":
        return "In Progress (Agent)";
      case "in_progress_pending_citizen":
        return "In Progress (Citizen)";
      case "resolved":
        return "Resolved";
      case "closed":
        return "Closed";
      case "reopened":
        return "Reopened";
      default:
        return status.toString().split('_').map(word => 
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    }
  };
  
  const getPriorityText = (priority: string): string => {
    switch (priority) {
      case "low":
        return "Low";
      case "medium":
        return "Medium";
      case "high":
        return "High";
      case "urgent":
        return "Urgent";
      default:
        return priority.toString().charAt(0).toUpperCase() + priority.toString().slice(1);
    }
  };
  
  const formatDateTime = (date: Date | string) => {
    return new Date(date).toLocaleString();
  };
  
  const getTimeElapsed = (date: Date | string) => {
    const now = new Date();
    const then = new Date(date);
    const diffInSeconds = Math.floor((now.getTime() - then.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return `${diffInSeconds} seconds ago`;
    }
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes === 1 ? '' : 's'} ago`;
    }
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;
    }
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) {
      return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`;
    }
    
    return formatDateTime(date);
  };

  // Loading states
  if (isLoadingTicket) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader className="animate-spin mr-2" />
        <span>Loading ticket details...</span>
      </div>
    );
  }

  // Error states
  if (isTicketError) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
        <h2 className="text-2xl font-bold mt-4">Error Loading Ticket</h2>
        <p className="mt-2 text-muted-foreground">
          {(ticketError as Error)?.message || "The requested ticket could not be loaded."}
        </p>
        <Button className="mt-4" onClick={() => navigate("/agency/tickets")}>
          Back to Tickets
        </Button>
      </div>
    );
  }

  if (!ticketData) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold">Ticket Not Found</h2>
        <p className="mt-2 text-muted-foreground">
          The requested ticket could not be found.
        </p>
        <Button className="mt-4" onClick={() => navigate("/agency/tickets")}>
          Back to Tickets
        </Button>
      </div>
    );
  }

  // Check access permission for current agency
  if (user?.role === 'agency' && user?.agencyId !== ticketData.assignedAgencyId) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
        <h2 className="text-2xl font-bold mt-4">Access Denied</h2>
        <p className="mt-2 text-muted-foreground">
          This ticket is not assigned to your agency.
        </p>
        <Button className="mt-4" onClick={() => navigate("/agency/tickets")}>
          Back to Tickets
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center text-muted-foreground h-8"
              onClick={() => navigate("/agency/tickets")}
            >
              ← Back to tickets
            </Button>
            <span className={getStatusClass(ticketData.status)}>
              {getStatusText(ticketData.status)}
            </span>
            <span className={getPriorityClass(ticketData.priority)}>
              {getPriorityText(ticketData.priority)}
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            Ticket #{ticketData.id.substring(0, 8)}: {ticketData.title}
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="shadow-sm border-gray-200">
            <CardHeader className="bg-gray-50 border-b">
              <CardTitle>Ticket Details</CardTitle>
              <CardDescription>
                Submitted on{" "}
                {formatDateTime(ticketData.createdAt)} by{" "}
                {ticketData.citizen?.name || "Unknown"}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="prose max-w-none">
                <p>{ticketData.detailedDescription || ticketData.description}</p>
              </div>
              
              <dl className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm">
                <div className="sm:col-span-1">
                  <dt className="font-medium text-gray-500">Category</dt>
                  <dd className="mt-1 text-gray-900">{ticketData.category?.name || "Uncategorized"}</dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="font-medium text-gray-500">Assigned Agent</dt>
                  <dd className="mt-1 text-gray-900">
                    {ticketData.assignedAgentId
                      ? usersData?.data.find(u => u.id === ticketData.assignedAgentId)?.name || "Unknown"
                      : "Unassigned"}
                  </dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="font-medium text-gray-500">Location</dt>
                  <dd className="mt-1 text-gray-900">{ticketData.location || "Not specified"}</dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="font-medium text-gray-500">Last Updated</dt>
                  <dd className="mt-1 text-gray-900">{formatDateTime(ticketData.updatedAt)}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          <Card className="mt-6 shadow-sm border-gray-200">
            <CardHeader className="bg-gray-50 border-b">
              <CardTitle>Communication</CardTitle>
              <CardDescription>
                Messages between the agency and the citizen
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="all" className="w-full">
                <TabsList className="mb-4 w-full grid grid-cols-3">
                  <TabsTrigger value="all">All Messages</TabsTrigger>
                  <TabsTrigger value="public">Public Only</TabsTrigger>
                  <TabsTrigger value="internal">Internal Notes</TabsTrigger>
                </TabsList>
                
                <TabsContent value="all">
                  <div className="space-y-6">
                    {!ticketData.communications || ticketData.communications.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        No messages yet. Add a message below to start the conversation.
                      </div>
                    ) : (
                      ticketData.communications.map((message) => {
                        const isFromAgency = message.sender.role === 'agency' || message.sender.role === 'AGENCY_STAFF';
                        
                        return (
                          <div key={message.id} className="border-b pb-4 last:border-0">
                            <div className={`flex ${
                              message.isInternal ? "bg-yellow-50 p-3 rounded-lg" : ""
                            }`}>
                              <div className="flex-1">
                                <div className="flex items-center mb-2">
                                  <span className="font-medium">
                                    {message.sender.name}
                                  </span>
                                  {isFromAgency && (
                                    <span className="ml-2 bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded">
                                      Agency Staff
                                    </span>
                                  )}
                                  {message.isInternal && (
                                    <span className="ml-2 bg-yellow-100 text-yellow-800 text-xs px-2 py-0.5 rounded">
                                      Internal Note
                                    </span>
                                  )}
                                  <span className="mx-2 text-xs text-gray-500">•</span>
                                  <span className="text-xs text-gray-500">
                                    {getTimeElapsed(message.timestamp)}
                                  </span>
                                </div>
                                <div className="prose-sm max-w-none">
                                  <p className="whitespace-pre-line">{message.message}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="public">
                  <div className="space-y-6">
                    {!ticketData.communications || 
                     ticketData.communications.filter(m => !m.isInternal).length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        No public messages yet.
                      </div>
                    ) : (
                      ticketData.communications
                        .filter(m => !m.isInternal)
                        .map((message) => {
                          const isFromAgency = message.sender.role === 'agency' || message.sender.role === 'AGENCY_STAFF';
                          
                          return (
                            <div key={message.id} className="border-b pb-4 last:border-0">
                              <div className="flex">
                                <div className="flex-1">
                                  <div className="flex items-center mb-2">
                                    <span className="font-medium">
                                      {message.sender.name}
                                    </span>
                                    {isFromAgency && (
                                      <span className="ml-2 bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded">
                                        Agency Staff
                                      </span>
                                    )}
                                    <span className="mx-2 text-xs text-gray-500">•</span>
                                    <span className="text-xs text-gray-500">
                                      {getTimeElapsed(message.timestamp)}
                                    </span>
                                  </div>
                                  <div className="prose-sm max-w-none">
                                    <p className="whitespace-pre-line">{message.message}</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="internal">
                  <div className="space-y-6">
                    {!ticketData.communications || 
                     ticketData.communications.filter(m => m.isInternal).length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        No internal notes yet.
                      </div>
                    ) : (
                      ticketData.communications
                        .filter(m => m.isInternal)
                        .map((message) => (
                          <div key={message.id} className="border-b pb-4 last:border-0">
                            <div className="flex bg-yellow-50 p-3 rounded-lg">
                              <div className="flex-1">
                                <div className="flex items-center mb-2">
                                  <span className="font-medium">
                                    {message.sender.name}
                                  </span>
                                  <span className="ml-2 bg-yellow-100 text-yellow-800 text-xs px-2 py-0.5 rounded">
                                    Internal Note
                                  </span>
                                  <span className="mx-2 text-xs text-gray-500">•</span>
                                  <span className="text-xs text-gray-500">
                                    {getTimeElapsed(message.timestamp)}
                                  </span>
                                </div>
                                <div className="prose-sm max-w-none">
                                  <p className="whitespace-pre-line">{message.message}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
            
            <CardFooter className="border-t pt-6 flex-col items-stretch gap-6">
              <Form {...messageForm}>
                <form onSubmit={messageForm.handleSubmit(onSendMessage)} className="w-full">
                  <div className="space-y-4">
                    <FormField
                      control={messageForm.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Reply to Ticket</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Type your message here..."
                              className="min-h-[100px] resize-none"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={messageForm.control}
                      name="isInternal"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>
                              Internal note only (not visible to citizen)
                            </FormLabel>
                            <FormDescription>
                              Check this to add a note visible only to agency staff
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                    
                    <div className="flex justify-end">
                      <Button 
                        type="submit" 
                        disabled={sendMessageMutation.isPending}
                      >
                        {sendMessageMutation.isPending ? (
                          <>
                            <Loader className="mr-2 h-4 w-4 animate-spin" />
                            Sending...
                          </>
                        ) : "Send"}
                      </Button>
                    </div>
                  </div>
                </form>
              </Form>
            </CardFooter>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card className="shadow-sm border-gray-200">
            <CardHeader className="bg-gray-50 border-b">
              <CardTitle>Ticket Management</CardTitle>
              <CardDescription>
                Update ticket status and priority
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <Form {...updateForm}>
                <form onSubmit={updateForm.handleSubmit(onUpdateTicket)} className="space-y-6">
                  <FormField
                    control={updateForm.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="new">New</SelectItem>
                            <SelectItem value="assigned">Assigned</SelectItem>
                            <SelectItem value="in_progress_pending_agent">In Progress (Agent)</SelectItem>
                            <SelectItem value="in_progress_pending_citizen">In Progress (Citizen)</SelectItem>
                            <SelectItem value="resolved">Resolved</SelectItem>
                            <SelectItem value="closed">Closed</SelectItem>
                            <SelectItem value="reopened">Reopened</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={updateForm.control}
                    name="priority"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Priority</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select priority" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="urgent">Urgent</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={updateTicketMutation.isPending}
                  >
                    {updateTicketMutation.isPending ? (
                      <>
                        <Loader className="mr-2 h-4 w-4 animate-spin" />
                        Updating...
                      </>
                    ) : "Update Ticket Status"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
          
          <Card className="mt-6 shadow-sm border-gray-200">
            <CardHeader className="bg-gray-50 border-b">
              <CardTitle>Assign Agent</CardTitle>
              <CardDescription>
                Assign this ticket to a specific agent
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <Form {...assignAgentForm}>
                <form onSubmit={assignAgentForm.handleSubmit(onAssignAgent)} className="space-y-6">
                  <FormField
                    control={assignAgentForm.control}
                    name="assignedAgentId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Assign To Agent</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || ""}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select an agent" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="unassigned">Unassigned</SelectItem>
                            {isLoadingUsers ? (
                              <SelectItem value="loading" disabled>
                                Loading agents...
                              </SelectItem>
                            ) : agencyStaff.length === 0 ? (
                              <SelectItem value="no-agents" disabled>
                                No agents available
                              </SelectItem>
                            ) : (
                              agencyStaff.map((staff: User) => (
                                <SelectItem key={staff.id} value={staff.id}>
                                  {staff.name}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Agent responsible for handling this ticket
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={assignAgentMutation.isPending || !assignAgentForm.getValues().assignedAgentId}
                  >
                    {assignAgentMutation.isPending ? (
                      <>
                        <Loader className="mr-2 h-4 w-4 animate-spin" />
                        Assigning...
                      </>
                    ) : "Assign Agent"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
          
          <Card className="mt-6 shadow-sm border-gray-200">
            <CardHeader className="bg-gray-50 border-b">
              <CardTitle>Transfer Ticket</CardTitle>
              <CardDescription>
                Reassign this ticket to another agency
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="text-sm">
                  <p>Current agency: <strong>{ticketData.assignedAgency?.name || "Unassigned"}</strong></p>
                  <p className="mt-2 text-gray-500">
                    Transferring will reassign the ticket to another agency and reset the agent assignment.
                  </p>
                </div>
                
                {isTransferModalOpen ? (
                  <Form {...transferForm}>
                    <form onSubmit={transferForm.handleSubmit(onTransferTicket)} className="space-y-4">
                      <FormField
                        control={transferForm.control}
                        name="newAgencyId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Transfer To Agency</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select agency" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {isLoadingAgencies ? (
                                  <SelectItem value="loading-agencies" disabled>
                                    Loading agencies...
                                  </SelectItem>
                                ) : otherAgencies.length === 0 ? (
                                  <SelectItem value="no-other-agencies" disabled>
                                    No other agencies available
                                  </SelectItem>
                                ) : (
                                  otherAgencies.map((agency: Agency) => (
                                    <SelectItem key={agency.id} value={agency.id}>
                                      {agency.name}
                                    </SelectItem>
                                  ))
                                )}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={transferForm.control}
                        name="transferComment"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Transfer Reason</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Explain why you're transferring this ticket..."
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="flex justify-end space-x-2 pt-2">
                        <Button 
                          variant="outline" 
                          type="button" 
                          onClick={() => setIsTransferModalOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button 
                          type="submit"
                          disabled={transferTicketMutation.isPending}
                          variant="default"
                        >
                          {transferTicketMutation.isPending ? (
                            <>
                              <Loader className="mr-2 h-4 w-4 animate-spin" />
                              Transferring...
                            </>
                          ) : "Confirm Transfer"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                ) : (
                  <Button 
                    disabled={otherAgencies?.length === 0} 
                    className="w-full" 
                    onClick={() => setIsTransferModalOpen(true)}
                  >
                    Transfer to Another Agency
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card className="mt-6 shadow-sm border-gray-200">
            <CardHeader className="bg-gray-50 border-b">
              <CardTitle>Citizen Information</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="text-sm">
                <div className="font-medium">{ticketData.citizen?.name || "Unknown"}</div>
                <div className="text-muted-foreground mt-1">
                  {ticketData.citizen?.email || "No email available"}
                </div>
                {ticketData.citizen?.phone && (
                  <div className="text-muted-foreground mt-1">
                    {ticketData.citizen.phone}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AgencyTicketDetail;
