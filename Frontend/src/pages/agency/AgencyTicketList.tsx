import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/context/AuthContext";
import { ticketApi } from "@/utils/api";
import { Ticket, TicketStatus, TicketPriority } from "@/types";
import { Loader, Search, ArrowUp, ArrowDown } from "lucide-react";

// Filter and sorter types
type FilterState = {
  status: string;
  priority: string;
  search: string;
};

type SortState = {
  field: "createdAt" | "updatedAt" | "priority" | "status";
  direction: "asc" | "desc";
};

const AgencyTicketList = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Filtering and sorting state
  const [filters, setFilters] = useState<FilterState>({
    status: "all",
    priority: "all",
    search: "",
  });
  
  const [sort, setSort] = useState<SortState>({
    field: "updatedAt",
    direction: "desc",
  });

  // Fetch tickets using React Query
  const { data, isLoading, isError } = useQuery({
    queryKey: ['tickets'],
    queryFn: ticketApi.getUserTickets,
    meta: {
      onError: (error: Error) => {
        toast({
          title: "Error",
          description: "Failed to fetch tickets. Please try again.",
          variant: "destructive",
        });
        console.error("Error fetching tickets:", error);
      }
    }
  });

  // Apply filters and sort
  const filteredTickets = data?.data ? data.data.filter(ticket => {
    // Filter by status
    if (filters.status !== "all" && ticket.status !== filters.status) {
      return false;
    }
    
    // Filter by priority
    if (filters.priority !== "all" && ticket.priority !== filters.priority) {
      return false;
    }
    
    // Filter by search term
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      return (
        ticket.title.toLowerCase().includes(searchTerm) ||
        ticket.description.toLowerCase().includes(searchTerm) ||
        ticket.location?.toLowerCase().includes(searchTerm) ||
        ticket.citizen?.name.toLowerCase().includes(searchTerm)
      );
    }
    
    return true;
  }).sort((a, b) => {
    let comparison = 0;
    
    if (sort.field === "priority") {
      const priorityOrder = { low: 0, medium: 1, high: 2, urgent: 3 };
      comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
    } else if (sort.field === "status") {
      const statusOrder = { 
        new: 0, 
        assigned: 1, 
        in_progress_pending_agent: 2, 
        in_progress_pending_citizen: 3, 
        resolved: 4, 
        closed: 5,
        reopened: 6
      };
      comparison = statusOrder[a.status as keyof typeof statusOrder] - 
                 statusOrder[b.status as keyof typeof statusOrder];
    } else {
      comparison = new Date(a[sort.field]).getTime() - new Date(b[sort.field]).getTime();
    }
    
    return sort.direction === "asc" ? comparison : -comparison;
  }) : [];

  // Handle filter changes
  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };
  
  // Handle sort changes
  const handleSortChange = (field: SortState["field"]) => {
    setSort(prev => ({
      field,
      direction: prev.field === field && prev.direction === "desc" ? "asc" : "desc",
    }));
  };

  const getStatusClass = (status: TicketStatus) => {
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
  
  const getPriorityClass = (priority: TicketPriority) => {
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
  
  const getStatusText = (status: TicketStatus): string => {
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
        return "Unknown";
    }
  };
  
  const getPriorityText = (priority: TicketPriority): string => {
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
        return "Unknown";
    }
  };

  const getSortIndicator = (field: SortState["field"]) => {
    if (sort.field !== field) return null;
    return sort.direction === "asc" ? <ArrowUp className="inline-block w-4 h-4" /> : <ArrowDown className="inline-block w-4 h-4" />;
  };

  if (isError) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold">Error Loading Tickets</h2>
        <p className="mt-2 text-muted-foreground">
          There was a problem fetching the tickets. Please try again later.
        </p>
        <Button className="mt-4" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Manage Tickets</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Tickets</CardTitle>
          <CardDescription>
            View and manage tickets assigned to your agency
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="sm:flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  className="pl-10"
                  placeholder="Search tickets..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-2 gap-2">
                <Select
                  value={filters.status}
                  onValueChange={(value) => handleFilterChange("status", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="assigned">Assigned</SelectItem>
                    <SelectItem value="in_progress_pending_agent">In Progress (Agent)</SelectItem>
                    <SelectItem value="in_progress_pending_citizen">In Progress (Citizen)</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                    <SelectItem value="reopened">Reopened</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={filters.priority}
                  onValueChange={(value) => handleFilterChange("priority", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priorities</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {isLoading ? (
              <div className="text-center py-8 flex items-center justify-center">
                <Loader className="animate-spin mr-2" />
                <span>Loading tickets...</span>
              </div>
            ) : filteredTickets?.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {data?.data?.length === 0
                  ? "No tickets assigned to your agency."
                  : "No tickets match your filters."}
              </div>
            ) : (
              <div className="rounded-md border">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                          onClick={() => handleSortChange("updatedAt")}
                        >
                          <div className="flex items-center">
                            Ticket ID {getSortIndicator("updatedAt")}
                          </div>
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Submitter
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Category
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                          onClick={() => handleSortChange("status")}
                        >
                          <div className="flex items-center">
                            Status {getSortIndicator("status")}
                          </div>
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                          onClick={() => handleSortChange("priority")}
                        >
                          <div className="flex items-center">
                            Priority {getSortIndicator("priority")}
                          </div>
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                          onClick={() => handleSortChange("createdAt")}
                        >
                          <div className="flex items-center">
                            Created {getSortIndicator("createdAt")}
                          </div>
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredTickets.map((ticket: Ticket) => (
                        <tr key={ticket.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Link
                              to={`/agency/tickets/${ticket.id}`}
                              className="text-blue-600 hover:text-blue-900 font-medium hover:underline"
                            >
                              #{ticket.id.substring(0, 8)}
                            </Link>
                            <div className="text-sm text-gray-900 truncate max-w-[200px]">
                              {ticket.title}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {ticket.citizen?.name || "Unknown"}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {ticket.category?.name || "Uncategorized"}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={getStatusClass(ticket.status)}>
                              {getStatusText(ticket.status)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={getPriorityClass(ticket.priority)}>
                              {getPriorityText(ticket.priority)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {new Date(ticket.createdAt).toLocaleDateString()}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-blue-600 hover:text-blue-900 hover:bg-blue-50"
                              asChild
                            >
                              <Link to={`/agency/tickets/${ticket.id}`}>
                                View Details
                              </Link>
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AgencyTicketList;
