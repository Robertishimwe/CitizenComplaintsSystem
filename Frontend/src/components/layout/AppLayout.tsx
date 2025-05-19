
import { ReactNode } from "react";
import { Outlet } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import { useAuth } from "@/context/AuthContext";

interface AppLayoutProps {
  children?: ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
  const { userRole } = useAuth();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <Sidebar />
        <div className="flex-1 flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-1 bg-gray-50">
            <div className="p-4 md:p-6">
              {children || <Outlet />}
            </div>
          </main>
          <footer className="bg-white border-t py-4 px-6">
            <div className="max-w-7xl mx-auto">
              <p className="text-sm text-gray-500">
                &copy; {new Date().getFullYear()} Citizen Engagement System. All rights reserved.
              </p>
            </div>
          </footer>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AppLayout;
