import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
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
import { Loader } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { ticketApi } from "@/utils/api";
import { Ticket, TicketStatus } from "@/types";

const CitizenTickets = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [filteredTickets, setFilteredTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    const fetchTickets = async () => {
      setIsLoading(true);
      try {
        const response = await ticketApi.getUserTickets();
        setTickets(response.data);
        setFilteredTickets(response.data);
      } catch (error) {
        console.error("Failed to fetch tickets:", error);
        toast({
          title: "Error",
          description: "Failed to load your tickets. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchTickets();
    }
  }, [user, toast]);

  useEffect(() => {
    let results = tickets;

    // Apply status filter
    if (statusFilter !== "all") {
      results = results.filter((ticket) => {
        // Handle in_progress specially - this section needed fixing
        if (statusFilter === "in_progress") {
          return ticket.status === "in_progress_pending_agent" ||
                 ticket.status === "in_progress_pending_citizen";
        }
        return ticket.status === statusFilter as TicketStatus;
      });
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      results = results.filter(
        (ticket) =>
          ticket.title.toLowerCase().includes(query) ||
          ticket.description.toLowerCase().includes(query) ||
          ticket.location?.toLowerCase().includes(query)
      );
    }

    setFilteredTickets(results);
  }, [searchQuery, statusFilter, tickets]);

  const getStatusText = (status: string) => {
    switch (status) {
      case "new":
        return "New";
      case "assigned":
        return "Assigned";
      case "in_progress_pending_agent":
      case "in_progress_pending_citizen":
        return "In Progress";
      case "resolved":
        return "Resolved";
      case "closed":
        return "Closed";
      case "reopened":
        return "Reopened";
      default:
        return status ? status.charAt(0).toUpperCase() + status.slice(1) : "";
    }
  };

  const getStatusClass = (status: TicketStatus) => {
    switch (status) {
      case "new":
        return "bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium";
      case "assigned":
        return "bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs font-medium";
      case "in_progress_pending_agent":
      case "in_progress_pending_citizen":
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

  const getFormattedDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold tracking-tight">My Tickets</h1>
        <div className="mt-2 sm:mt-0">
          <Button asChild>
            <Link to="/citizen/tickets/create">Submit New Complaint</Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Complaints</CardTitle>
          <CardDescription>
            View and manage all your submitted complaints
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="sm:flex-1">
                <Input
                  placeholder="Search tickets..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="w-full sm:w-[180px]">
                <Select
                  value={statusFilter}
                  onValueChange={setStatusFilter}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="assigned">Assigned</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                    <SelectItem value="reopened">Reopened</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredTickets.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {tickets.length === 0
                  ? "You haven't submitted any complaints yet."
                  : "No complaints match your filters."}
              </div>
            ) : (
              <div className="rounded-md border">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Ticket
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Category
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Agency
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Status
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Submitted
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
                      {filteredTickets.map((ticket) => (
                        <tr key={ticket.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium">
                              <Link
                                to={`/citizen/tickets/${ticket.id}`}
                                className="hover:text-blue-600 hover:underline"
                              >
                                {ticket.title}
                              </Link>
                            </div>
                            <div className="text-xs text-gray-500 mt-1 truncate max-w-[250px]">
                              {ticket.location}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {ticket.category?.name || "Unknown Category"}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {ticket.assignedAgency
                                ? ticket.assignedAgency.name
                                : "Unassigned"}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={getStatusClass(ticket.status)}>
                              {getStatusText(ticket.status)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">
                              {getFormattedDate(ticket.createdAt)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <Link
                              to={`/citizen/tickets/${ticket.id}`}
                              className="text-blue-600 hover:text-blue-900 hover:underline"
                            >
                              View Details
                            </Link>
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

export default CitizenTickets;
