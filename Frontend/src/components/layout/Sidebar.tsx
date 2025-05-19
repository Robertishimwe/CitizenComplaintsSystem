
import { Link, useLocation } from "react-router-dom";
import { 
  BarChart3, 
  Settings, 
  Users, 
  Building,
  TicketCheck, 
  Home, 
  PlusCircle, 
  LogOut, 
  List, 
  FileCog, 
  PanelLeftOpen, 
  Shuffle 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import {
  Sidebar as SidebarComponent,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
} from "@/components/ui/sidebar";

const Sidebar = () => {
  const location = useLocation();
  const { userRole, logout } = useAuth();
  
  const isActive = (path: string) => {
    return location.pathname.includes(path);
  };

  return (
    <SidebarComponent>
      <SidebarHeader className="border-b py-4 px-5 flex justify-between items-center">
         <div className="flex-shrink-0 flex items-center">
              <Link to={""} className="flex items-center">
                <img
                  className="h-10 w-auto"
                  src="/lovable-uploads/b9cb15e5-5c0f-4646-8ab2-b35b16a23795.png"
                  alt="Rwanda Government Seal"
                />
                <span className="ml-2 text-lg font-semibold text-gray-900">CES</span>
              </Link>
            </div>
        {/* <div className="font-semibold flex items-center text-lg">
          <TicketCheck size={22} className="mr-2 text-primary" />
          <span>CES</span>
        </div>
        <SidebarTrigger /> */}
      </SidebarHeader>
      
      <SidebarContent className="p-2">
        {userRole === "admin" && (
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link to="/admin/dashboard" className={isActive("/admin/dashboard") ? "bg-primary/10 text-primary" : ""}>
                  <BarChart3 size={18} />
                  <span>Dashboard</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link to="/admin/routing" className={isActive("/admin/routing") ? "bg-primary/10 text-primary" : ""}>
                  <Shuffle size={18} />
                  <span>Routing Table</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link to="/admin/agencies" className={isActive("/admin/agencies") ? "bg-primary/10 text-primary" : ""}>
                  <Building size={18} />
                  <span>Agencies</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link to="/admin/categories" className={isActive("/admin/categories") ? "bg-primary/10 text-primary" : ""}>
                  <List size={18} />
                  <span>Categories</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link to="/admin/users" className={isActive("/admin/users") ? "bg-primary/10 text-primary" : ""}>
                  <Users size={18} />
                  <span>Users</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        )}
        
        {userRole === "agency" && (
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link to="/agency/dashboard" className={isActive("/agency/dashboard") ? "bg-primary/10 text-primary" : ""}>
                  <BarChart3 size={18} />
                  <span>Dashboard</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link to="/agency/tickets" className={isActive("/agency/tickets") ? "bg-primary/10 text-primary" : ""}>
                  <TicketCheck size={18} />
                  <span>All Tickets</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link to="/agency/tickets/new" className={isActive("/agency/tickets/new") ? "bg-primary/10 text-primary" : ""}>
                  <FileCog size={18} />
                  <span>New Tickets</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link to="/agency/tickets/in-progress" className={isActive("/agency/tickets/in-progress") ? "bg-primary/10 text-primary" : ""}>
                  <PanelLeftOpen size={18} />
                  <span>In Progress</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link to="/agency/tickets/resolved" className={isActive("/agency/tickets/resolved") ? "bg-primary/10 text-primary" : ""}>
                  <Settings size={18} />
                  <span>Resolved</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        )}
        
        {userRole === "citizen" && (
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link to="/citizen/dashboard" className={isActive("/citizen/dashboard") ? "bg-primary/10 text-primary" : ""}>
                  <Home size={18} />
                  <span>Home</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link to="/citizen/tickets" className={isActive("/citizen/tickets") && !isActive("/citizen/tickets/create") ? "bg-primary/10 text-primary" : ""}>
                  <TicketCheck size={18} />
                  <span>My Complaints</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link to="/citizen/tickets/create" className={isActive("/citizen/tickets/create") ? "bg-primary/10 text-primary" : ""}>
                  <PlusCircle size={18} />
                  <span>New Complaint</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        )}
      </SidebarContent>
      
      <SidebarFooter className="border-t p-4">
        <Button 
          variant="outline" 
          onClick={logout} 
          className="w-full flex items-center justify-center gap-2"
        >
          <LogOut size={16} />
          <span>Logout</span>
        </Button>
      </SidebarFooter>
    </SidebarComponent>
  );
};

export default Sidebar;
