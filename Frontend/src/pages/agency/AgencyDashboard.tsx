import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import {
  mockDataService,
  getStatusText,
  getTimeElapsed,
  getCategoryNameById,
} from "@/services/mockData";
import { Ticket } from "@/types";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
} from "recharts";

const AgencyDashboard = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalTickets: 0,
    newTickets: 0,
    inProgressTickets: 0,
    resolvedTickets: 0,
    averageResponseTime: 0,
    ticketsByStatus: [],
    ticketsByPriority: [],
    ticketTrend: [],
  });

  useEffect(() => {
    const fetchData = () => {
      if (user?.agencyId) {
        const agencyTickets = mockDataService.getTicketsByAgency(user.agencyId);
        setTickets(agencyTickets);
        
        // Calculate statistics
        const newTickets = agencyTickets.filter((t) => t.status === "new").length;
        const inProgressTickets = agencyTickets.filter((t) => t.status === "in_progress_pending_agent" || t.status === "in_progress_pending_citizen").length;
        const resolvedTickets = agencyTickets.filter((t) => ["resolved", "closed"].includes(t.status)).length;
        
        // Sample data for charts
        const statusData = [
          { name: "New", value: newTickets },
          { name: "In Progress", value: inProgressTickets },
          { name: "Resolved", value: resolvedTickets },
        ];
        
        const priorityData = [
          { name: "Low", value: agencyTickets.filter(t => t.priority === "low").length },
          { name: "Medium", value: agencyTickets.filter(t => t.priority === "medium").length },
          { name: "High", value: agencyTickets.filter(t => t.priority === "high").length },
          { name: "Urgent", value: agencyTickets.filter(t => t.priority === "urgent").length },
        ];
        
        // Sample trend data
        const trendData = Array.from({ length: 7 }, (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - (6 - i));
          return {
            name: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            new: Math.floor(Math.random() * 5),
            resolved: Math.floor(Math.random() * 4),
          };
        });
        
        setStats({
          totalTickets: agencyTickets.length,
          newTickets,
          inProgressTickets,
          resolvedTickets,
          averageResponseTime: 24, // Mock value
          ticketsByStatus: statusData,
          ticketsByPriority: priorityData,
          ticketTrend: trendData,
        });
      }
      setIsLoading(false);
    };

    fetchData();
  }, [user]);

  const getStatusClass = (status: string) => {
    switch (status) {
      case "new":
        return "status-new";
      case "assigned":
        return "status-assigned";
      case "in_progress_pending_agent":
        return "status-in-progress";
      case "in_progress_pending_citizen":
        return "status-in-progress";
      case "resolved":
        return "status-resolved";
      case "closed":
        return "status-closed";
      default:
        return "status-badge bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Agency Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Tickets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalTickets}</div>
            <p className="text-xs text-muted-foreground mt-1">
              All assigned tickets
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">New Tickets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.newTickets}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Awaiting initial response
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.inProgressTickets}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Currently being addressed
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Resolved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.resolvedTickets}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Successfully addressed
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Tickets by Status</CardTitle>
            <CardDescription>
              Distribution of tickets by current status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={stats.ticketsByStatus}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ticket Trend</CardTitle>
            <CardDescription>
              Daily new and resolved tickets over the past 7 days
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={stats.ticketTrend}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="new"
                    stroke="#3b82f6"
                    activeDot={{ r: 8 }}
                    name="New"
                  />
                  <Line
                    type="monotone"
                    dataKey="resolved"
                    stroke="#10b981"
                    name="Resolved"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AgencyDashboard;
