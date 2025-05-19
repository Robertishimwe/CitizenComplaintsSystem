import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { ticketApi } from "@/utils/api";
import { Ticket } from "@/types";

const formSchema = z.object({
  message: z.string().min(5, {
    message: "Message must be at least 5 characters.",
  }),
});

const CitizenTicketDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [ticketDetails, setTicketDetails] = useState<Ticket | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      message: "",
    },
  });

  useEffect(() => {
    const fetchTicketDetails = async () => {
      if (!id) return;
      
      setIsLoading(true);
      try {
        const data = await ticketApi.getTicketWithCommunications(id);
        setTicketDetails(data);
        
        // Check if the current user is the submitter of this ticket
        if (user && data.citizen && data.citizen.id !== user.id) {
          toast({
            title: "Access Denied",
            description: "You don't have permission to view this ticket.",
            variant: "destructive",
          });
          navigate("/citizen/tickets");
          return;
        }
      } catch (error) {
        console.error("Failed to fetch ticket details:", error);
        toast({
          title: "Error",
          description: "Failed to load ticket details. Please try again.",
          variant: "destructive",
        });
        navigate("/citizen/tickets");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTicketDetails();
  }, [id, user, navigate, toast]);

  const getStatusText = (status: string) => {
    const formattedStatus = status.toLowerCase();
    switch (formattedStatus) {
      case "new":
        return "New";
      case "assigned":
        return "Assigned";
      case "in_progress":
        return "In Progress";
      case "resolved":
        return "Resolved";
      case "closed":
        return "Closed";
      case "reopened":
        return "Reopened";
      default:
        return status;
    }
  };

  const getStatusClass = (status: string) => {
    const formattedStatus = status.toLowerCase();
    switch (formattedStatus) {
      case "new":
        return "bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium";
      case "assigned":
        return "bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs font-medium";
      case "in_progress":
        return "bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium";
      case "resolved":
        return "bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium";
      case "closed":
        return "bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs font-medium";
      case "reopened":
        return "bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium";
      default:
        return "bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs font-medium";
    }
  };
  
  const getPriorityText = (priority: string) => {
    const formattedPriority = priority.toLowerCase();
    switch (formattedPriority) {
      case "low":
        return "Low";
      case "medium":
        return "Medium";
      case "high":
        return "High";
      case "urgent":
        return "Urgent";
      default:
        return priority;
    }
  };
  
  const getPriorityClass = (priority: string) => {
    const formattedPriority = priority.toLowerCase();
    switch (formattedPriority) {
      case "low":
        return "bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium";
      case "medium":
        return "bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium";
      case "high":
        return "bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs font-medium";
      case "urgent":
        return "bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium";
      default:
        return "bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs font-medium";
    }
  };

  const getTimeElapsed = (dateString: string) => {
    const now = new Date();
    const past = new Date(dateString);
    const diffMs = now.getTime() - past.getTime();
    
    const diffMins = Math.round(diffMs / 60000);
    const diffHrs = Math.round(diffMs / 3600000);
    const diffDays = Math.round(diffMs / 86400000);
    
    if (diffMins < 60) {
      return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    } else if (diffHrs < 24) {
      return `${diffHrs} hour${diffHrs !== 1 ? 's' : ''} ago`;
    } else {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    }
  };

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    if (!user || !ticketDetails || !id) return;
    
    setIsSending(true);
    
    try {
      // Send message to API
      const newMessage = await ticketApi.sendMessage(id, data.message);
      
      // Update the ticket details with the new message
      setTicketDetails(prev => {
        if (!prev) return null;
        
        return {
          ...prev,
          communications: [...(prev.communications || []), newMessage]
        };
      });
      
      // Reset form
      form.reset();
      
      toast({
        title: "Message Sent",
        description: "Your message has been sent successfully.",
      });
    } catch (error) {
      console.error("Failed to send message:", error);
      toast({
        title: "Error",
        description: "Failed to send your message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!ticketDetails) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold">Ticket Not Found</h2>
        <p className="mt-2 text-muted-foreground">
          The requested ticket could not be found.
        </p>
        <Button className="mt-4" onClick={() => navigate("/citizen/tickets")}>
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
              onClick={() => navigate("/citizen/tickets")}
            >
              ← Back to tickets
            </Button>
            <span className={getStatusClass(ticketDetails.status)}>
              {getStatusText(ticketDetails.status)}
            </span>
            <span className={getPriorityClass(ticketDetails.priority)}>
              {getPriorityText(ticketDetails.priority)}
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">{ticketDetails.title}</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Ticket Details</CardTitle>
              <CardDescription>
                Submitted on{" "}
                {new Date(ticketDetails.createdAt).toLocaleDateString()} at{" "}
                {new Date(ticketDetails.createdAt).toLocaleTimeString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                <p>{ticketDetails.detailedDescription}</p>
              </div>
              
              <dl className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm">
                <div className="sm:col-span-1">
                  <dt className="font-medium text-gray-500">Category</dt>
                  <dd className="mt-1 text-gray-900">{ticketDetails.category?.name || "Unknown"}</dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="font-medium text-gray-500">Assigned To</dt>
                  <dd className="mt-1 text-gray-900">
                    {ticketDetails.assignedAgency
                      ? ticketDetails.assignedAgency.name
                      : "Pending Assignment"}
                  </dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="font-medium text-gray-500">Location</dt>
                  <dd className="mt-1 text-gray-900">{ticketDetails.location || "Not specified"}</dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="font-medium text-gray-500">Last Updated</dt>
                  <dd className="mt-1 text-gray-900">{new Date(ticketDetails.updatedAt).toLocaleDateString()}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Communication</CardTitle>
              <CardDescription>
                Messages between you and the agency handling your complaint
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {!ticketDetails.communications || ticketDetails.communications.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No messages yet. Add a message below to start the conversation.
                  </div>
                ) : (
                  ticketDetails.communications.filter(msg => !msg.isInternal).map((message) => {
                    const isFromCurrentUser = message.sender.id === user?.id;
                    
                    return (
                      <div
                        key={message.id}
                        className={`flex ${
                          isFromCurrentUser ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-[80%] rounded-lg p-4 ${
                            isFromCurrentUser
                              ? "bg-blue-100 text-blue-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          <div className="flex items-center mb-1">
                            <span className="font-medium">
                              {message.sender.name}
                            </span>
                            <span className="mx-2 text-xs text-gray-500">•</span>
                            <span className="text-xs text-gray-500">
                              {getTimeElapsed(message.timestamp)}
                            </span>
                          </div>
                          <p className="whitespace-pre-line">{message.message}</p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
            
            <CardFooter className="border-t pt-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="w-full">
                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Send Message</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Type your message here..."
                            className="resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Add more details or ask questions about your complaint.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex justify-end mt-4">
                    <Button type="submit" disabled={isSending}>
                      {isSending ? (
                        <>
                          <Loader className="mr-2 h-4 w-4 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        "Send Message"
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardFooter>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Ticket Status</CardTitle>
              <CardDescription>
                Current status of your complaint
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm font-medium text-gray-500">Status</div>
                  <div className="mt-1 flex items-center">
                    <span className={`${getStatusClass(ticketDetails.status)} mr-2`}>
                      {getStatusText(ticketDetails.status)}
                    </span>
                    <span className="text-sm text-gray-500">
                      Last updated {getTimeElapsed(ticketDetails.updatedAt.toString())}
                    </span>
                  </div>

                  {/* Status timeline */}
                  <div className="mt-6 space-y-6">
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <div className="bg-green-500 h-4 w-4 rounded-full"></div>
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium">Submitted</div>
                        <div className="mt-1 text-xs text-gray-500">
                          {new Date(ticketDetails.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    
                    {ticketDetails.assignedAgency && (
                      <div className="flex items-start">
                        <div className="flex-shrink-0">
                          <div className={`h-4 w-4 rounded-full ${ticketDetails.status === "new" ? "bg-gray-300" : "bg-green-500"}`}></div>
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium">Assigned</div>
                          <div className="mt-1 text-xs text-gray-500">
                            {ticketDetails.assignedAgency.name}
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <div className={`h-4 w-4 rounded-full ${
                          ticketDetails.status === "in_progress_pending_agent" || 
                          ticketDetails.status === "in_progress_pending_citizen" ? "bg-green-500" : "bg-gray-300"
                        }`}></div>
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium">In Progress</div>
                        <div className="mt-1 text-xs text-gray-500">
                          {ticketDetails.status === "in_progress_pending_agent" 
                            ? "Currently being addressed" 
                            : ticketDetails.status === "new" || ticketDetails.status === "assigned" 
                              ? "Pending" 
                              : "Completed"}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <div className={`h-4 w-4 rounded-full ${
                          ticketDetails.status === "resolved" || 
                          ticketDetails.status === "closed" ? "bg-green-500" : "bg-gray-300"
                        }`}></div>
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium">Resolved</div>
                        <div className="mt-1 text-xs text-gray-500">
                          {ticketDetails.status === "resolved" || ticketDetails.status === "closed" 
                            ? new Date(ticketDetails.updatedAt).toLocaleDateString() 
                            : "Pending"}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm font-medium text-gray-500">Priority</div>
                  <div className="mt-1">
                    <span className={getPriorityClass(ticketDetails.priority)}>
                      {getPriorityText(ticketDetails.priority)}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CitizenTicketDetail;
