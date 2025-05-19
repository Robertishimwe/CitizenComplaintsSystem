import * as React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import AppLayout from "@/components/layout/AppLayout";

// Common pages
import LandingPage from "@/pages/LandingPage";
import LoginPage from "@/pages/LoginPage";
import NotFound from "@/pages/NotFound";

// Admin pages
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminRoutingTable from "@/pages/admin/AdminRoutingTable";
import AdminAgencyManagement from "@/pages/admin/AdminAgencyManagement";
import AdminUserManagement from "@/pages/admin/AdminUserManagement";
import AdminCategoryManagement from "@/pages/admin/AdminCategoryManagement";

// Agency pages
import AgencyDashboard from "@/pages/agency/AgencyDashboard";
import AgencyTicketList from "@/pages/agency/AgencyTicketList";
import AgencyTicketDetail from "@/pages/agency/AgencyTicketDetail";

// Citizen pages
import CitizenDashboard from "@/pages/citizen/CitizenDashboard";
import CitizenTickets from "@/pages/citizen/CitizenTickets";
import CitizenTicketDetail from "@/pages/citizen/CitizenTicketDetail";
import CitizenTicketCreate from "@/pages/citizen/CitizenTicketCreate";

// Protected route component
const ProtectedRoute = ({ 
  children, 
  allowedRoles 
}: { 
  children: React.ReactNode;
  allowedRoles: string[];
}) => {
  const { isAuthenticated, userRole, isLoading } = useAuth();

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (userRole && !allowedRoles.includes(userRole)) {
    // Redirect based on user role
    if (userRole === 'admin') {
      return <Navigate to="/admin/dashboard" replace />;
    } else if (userRole === 'agency') {
      return <Navigate to="/agency/dashboard" replace />;
    } else {
      return <Navigate to="/citizen/dashboard" replace />;
    }
  }

  return <>{children}</>;
};

// Public route - redirects to appropriate dashboard if already logged in
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, userRole, isLoading } = useAuth();

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (isAuthenticated && userRole) {
    // Redirect based on user role
    if (userRole === 'admin') {
      return <Navigate to="/admin/dashboard" replace />;
    } else if (userRole === 'agency') {
      return <Navigate to="/agency/dashboard" replace />;
    } else {
      return <Navigate to="/citizen/dashboard" replace />;
    }
  }

  return <>{children}</>;
};

const queryClient = new QueryClient();

const App = () => (
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={
                <PublicRoute>
                  <LoginPage />
                </PublicRoute>
              } />
              
              {/* Admin routes */}
              <Route path="/admin" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AppLayout />
                </ProtectedRoute>
              }>
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="routing" element={<AdminRoutingTable />} />
                <Route path="agencies" element={<AdminAgencyManagement />} />
                <Route path="users" element={<AdminUserManagement />} />
                <Route path="categories" element={<AdminCategoryManagement />} />
                <Route index element={<Navigate to="dashboard" replace />} />
              </Route>

              {/* Agency routes */}
              <Route path="/agency" element={
                <ProtectedRoute allowedRoles={['agency']}>
                  <AppLayout />
                </ProtectedRoute>
              }>
                <Route path="dashboard" element={<AgencyDashboard />} />
                <Route path="tickets" element={<AgencyTicketList />} />
                <Route path="tickets/:id" element={<AgencyTicketDetail />} />
                <Route path="tickets/new" element={
                  <AgencyTicketList />
                } />
                <Route path="tickets/in-progress" element={
                  <AgencyTicketList />
                } />
                <Route path="tickets/resolved" element={
                  <AgencyTicketList />
                } />
                <Route index element={<Navigate to="dashboard" replace />} />
              </Route>

              {/* Citizen routes */}
              <Route path="/citizen" element={
                <ProtectedRoute allowedRoles={['citizen']}>
                  <AppLayout />
                </ProtectedRoute>
              }>
                <Route path="dashboard" element={<CitizenDashboard />} />
                <Route path="tickets" element={<CitizenTickets />} />
                <Route path="tickets/create" element={<CitizenTicketCreate />} />
                <Route path="tickets/:id" element={<CitizenTicketDetail />} />
                <Route index element={<Navigate to="dashboard" replace />} />
              </Route>
              
              {/* Catch-all route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </React.StrictMode>
);

export default App;
