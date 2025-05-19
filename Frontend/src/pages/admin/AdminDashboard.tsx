
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import { mockDataService } from "@/services/mockData";
import { DashboardStats, Ticket, TicketStatus, TicketPriority } from "@/types";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"];

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalTickets: 0,
    openTickets: 0,
    closedTickets: 0,
    averageResolutionTime: 0,
    ticketsByCategory: [],
    ticketsByStatus: [],
    ticketsByPriority: [],
    ticketTrend: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = () => {
      // In a real application, this would be an API call
      const tickets = mockDataService.getTickets();
      
      // Calculate basic stats
      const openTicketsCount = tickets.filter(t => 
        t.status !== "closed" && t.status !== "resolved"
      ).length;
      
      const closedTicketsCount = tickets.filter(t => 
        t.status === "closed" || t.status === "resolved"
      ).length;
      
      // Calculate average resolution time (in hours)
      const closedTickets = tickets.filter(t => t.closedAt);
      let totalResolutionTime = 0;
      
      closedTickets.forEach(ticket => {
        if (ticket.closedAt) {
          const createdTime = new Date(ticket.createdAt).getTime();
          const closedTime = new Date(ticket.closedAt).getTime();
          const resolutionTime = (closedTime - createdTime) / (1000 * 60 * 60); // convert ms to hours
          totalResolutionTime += resolutionTime;
        }
      });
      
      const averageResolutionTime = closedTickets.length > 0 
        ? totalResolutionTime / closedTickets.length 
        : 0;
      
      // Group tickets by category
      const categories = mockDataService.getCategories();
      const ticketsByCategory = categories.map(category => {
        const count = tickets.filter(t => t.categoryId === category.id).length;
        return {
          categoryName: category.name,
          count: count
        };
      }).filter(c => c.count > 0).sort((a, b) => b.count - a.count);
      
      // Group tickets by status
      const statusCounts: Record<string, number> = {};
      tickets.forEach(ticket => {
        if (!statusCounts[ticket.status]) {
          statusCounts[ticket.status] = 0;
        }
        statusCounts[ticket.status]++;
      });
      
      const ticketsByStatus = Object.entries(statusCounts).map(([status, count]) => ({
        status: status as TicketStatus,
        count
      }));
      
      // Group tickets by priority
      const priorityCounts: Record<string, number> = {};
      tickets.forEach(ticket => {
        if (!priorityCounts[ticket.priority]) {
          priorityCounts[ticket.priority] = 0;
        }
        priorityCounts[ticket.priority]++;
      });
      
      const ticketsByPriority = Object.entries(priorityCounts).map(([priority, count]) => ({
        priority: priority as TicketPriority,
        count
      }));
      
      // Create ticket trend (last 7 days)
      const last7Days = Array.from({length: 7}, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        return d.toISOString().split('T')[0];
      }).reverse();
      
      const ticketTrend = last7Days.map(date => {
        const count = tickets.filter(ticket => 
          ticket.createdAt.toISOString().split('T')[0] === date
        ).length;
        
        return {
          date,
          count
        };
      });
      
      setStats({
        totalTickets: tickets.length,
        openTickets: openTicketsCount,
        closedTickets: closedTicketsCount,
        averageResolutionTime,
        ticketsByCategory,
        ticketsByStatus,
        ticketsByPriority,
        ticketTrend,
      });
      
      setIsLoading(false);
    };

    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <p>Loading dashboard data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center">
        <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="shadow-sm border-gray-200 transition-shadow hover:shadow-md">
          <CardHeader className="bg-blue-50 border-b">
            <CardTitle className="text-blue-700">Total Tickets</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="text-4xl font-bold">{stats.totalTickets}</p>
            <p className="text-sm text-gray-500 mt-1">All time submissions</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-gray-200 transition-shadow hover:shadow-md">
          <CardHeader className="bg-amber-50 border-b">
            <CardTitle className="text-amber-700">Open Tickets</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="text-4xl font-bold">{stats.openTickets}</p>
            <p className="text-sm text-gray-500 mt-1">Requiring attention</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-gray-200 transition-shadow hover:shadow-md">
          <CardHeader className="bg-green-50 border-b">
            <CardTitle className="text-green-700">Resolved Tickets</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="text-4xl font-bold">{stats.closedTickets}</p>
            <p className="text-sm text-gray-500 mt-1">
              Avg. resolution time: {Math.round(stats.averageResolutionTime)} hours
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-sm border-gray-200">
          <CardHeader>
            <CardTitle>Tickets by Category</CardTitle>
            <CardDescription>Distribution of tickets across categories</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={stats.ticketsByCategory}
                  margin={{ top: 5, right: 30, left: 20, bottom: 80 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="categoryName" 
                    angle={-45} 
                    textAnchor="end"
                    height={80}
                    interval={0}
                  />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-gray-200">
          <CardHeader>
            <CardTitle>Tickets by Status</CardTitle>
            <CardDescription>Current distribution of ticket statuses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.ticketsByStatus}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                    nameKey="status"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {stats.ticketsByStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any, name: any, props: any) => [`${value} tickets`, props.payload.status]} />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm border-gray-200">
        <CardHeader>
          <CardTitle>Ticket Submission Trend</CardTitle>
          <CardDescription>Number of tickets submitted over the last 7 days</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={stats.ticketTrend}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  name="Tickets" 
                  stroke="#8884d8" 
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-sm border-gray-200">
          <CardHeader className="flex flex-row justify-between items-center">
            <div>
              <CardTitle>Agency Management</CardTitle>
              <CardDescription>Manage government agencies</CardDescription>
            </div>
            <Button onClick={() => navigate('/admin/agencies')}>View All</Button>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-2">Top agencies by assigned tickets:</p>
            <ul className="space-y-2">
              {mockDataService.getAgencies().slice(0, 5).map(agency => (
                <li key={agency.id} className="flex justify-between items-center p-2 border rounded-md">
                  <span className="font-medium">{agency.name}</span>
                  <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                    {mockDataService.getTickets().filter(t => t.assignedAgencyId === agency.id).length} tickets
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-gray-200">
          <CardHeader className="flex flex-row justify-between items-center">
            <div>
              <CardTitle>Category Management</CardTitle>
              <CardDescription>Manage ticket categories</CardDescription>
            </div>
            <Button onClick={() => navigate('/admin/categories')}>View All</Button>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-2">Active categories:</p>
            <ul className="space-y-2">
              {mockDataService.getCategories().filter(c => c.isActive).slice(0, 5).map(category => (
                <li key={category.id} className="flex justify-between items-center p-2 border rounded-md">
                  <span className="font-medium">{category.name}</span>
                  <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded-full">
                    Active
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
