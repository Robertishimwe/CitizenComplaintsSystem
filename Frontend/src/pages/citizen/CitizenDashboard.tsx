
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { mockDataService, getStatusText, getPriorityText, getCategoryPath } from "@/services/mockData";
import { Ticket } from "@/types";

const CitizenDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [recentTickets, setRecentTickets] = useState<Ticket[]>([]);
  const [ticketCounts, setTicketCounts] = useState({
    total: 0,
    open: 0,
    closed: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = () => {
      if (user) {
        // Get user's tickets
        const tickets = mockDataService.getTicketsBySubmitter(user.id);
        
        // Sort by created date, newest first
        tickets.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        
        // Take the 5 most recent tickets
        const recent = tickets.slice(0, 5);
        
        setRecentTickets(recent);
        
        // Calculate counts
        const open = tickets.filter(t => 
          t.status !== "closed" && t.status !== "resolved"
        ).length;
        
        const closed = tickets.filter(t => 
          t.status === "closed" || t.status === "resolved"
        ).length;
        
        setTicketCounts({
          total: tickets.length,
          open,
          closed,
        });
      }
      
      setIsLoading(false);
    };

    fetchData();
  }, [user]);

  const getStatusClass = (status: string) => {
    switch (status) {
      case "new":
        return "bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs";
      case "assigned":
        return "bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs";
      case "in_progress":
        return "bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs";
      case "resolved":
        return "bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs";
      case "closed":
        return "bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs";
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
        <h1 className="text-2xl font-bold tracking-tight">Citizen Dashboard</h1>
        <Button 
          onClick={() => navigate("/citizen/tickets/create")}
          className="mt-2 sm:mt-0"
        >
          New Complaint
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="shadow-sm border-gray-200 transition-shadow hover:shadow-md">
          <CardHeader className="bg-blue-50 border-b">
            <CardTitle className="text-blue-700">Total Complaints</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="text-4xl font-bold">{ticketCounts.total}</p>
            <p className="text-sm text-gray-500 mt-1">All time submissions</p>
          </CardContent>
          <CardFooter className="border-t pt-4">
            <Button variant="outline" onClick={() => navigate('/citizen/tickets')} className="w-full">
              View All
            </Button>
          </CardFooter>
        </Card>

        <Card className="shadow-sm border-gray-200 transition-shadow hover:shadow-md">
          <CardHeader className="bg-amber-50 border-b">
            <CardTitle className="text-amber-700">Open Complaints</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="text-4xl font-bold">{ticketCounts.open}</p>
            <p className="text-sm text-gray-500 mt-1">Being processed</p>
          </CardContent>
          <CardFooter className="border-t pt-4">
            <Button variant="outline" onClick={() => navigate('/citizen/tickets?status=open')} className="w-full">
              View Open
            </Button>
          </CardFooter>
        </Card>

        <Card className="shadow-sm border-gray-200 transition-shadow hover:shadow-md">
          <CardHeader className="bg-green-50 border-b">
            <CardTitle className="text-green-700">Resolved Complaints</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="text-4xl font-bold">{ticketCounts.closed}</p>
            <p className="text-sm text-gray-500 mt-1">Successfully closed</p>
          </CardContent>
          <CardFooter className="border-t pt-4">
            <Button variant="outline" onClick={() => navigate('/citizen/tickets?status=closed')} className="w-full">
              View Closed
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* <Card className="shadow-sm border-gray-200">
        <CardHeader className="bg-gray-50 border-b">
          <CardTitle>Recent Complaints</CardTitle>
          <CardDescription>Your most recently submitted complaints</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {recentTickets.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                You haven't submitted any complaints yet.
              </p>
              <Button
                variant="outline"
                onClick={() => navigate('/citizen/tickets/create')}
                className="mt-4"
              >
                Submit your first complaint
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead>
                  <tr className="border-b">
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ticket ID</th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted</th>
                    <th className="py-3 px-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {recentTickets.map((ticket) => (
                    <tr 
                      key={ticket.id}
                      className="hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => navigate(`/citizen/tickets/${ticket.id}`)}
                    >
                      <td className="py-3 px-4 text-sm">{ticket.id.substring(0, 8)}</td>
                      <td className="py-3 px-4 text-sm font-medium">{ticket.title}</td>
                      <td className="py-3 px-4 text-sm">{getCategoryPath(ticket.categoryId)}</td>
                      <td className="py-3 px-4">
                        <span className={getStatusClass(ticket.status)}>
                          {getStatusText(ticket.status)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-500">
                        {new Date(ticket.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/citizen/tickets/${ticket.id}`);
                          }}
                        >
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
        <CardFooter className="border-t py-3 flex justify-end">
          <Button variant="link" onClick={() => navigate("/citizen/tickets")}>
            View all complaints →
          </Button>
        </CardFooter>
      </Card> */}
    </div>
  );
};

export default CitizenDashboard;
