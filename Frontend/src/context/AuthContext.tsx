
import React, { createContext, useContext, useState, useEffect } from "react";
import { mockDataService } from "../services/mockData";
import { User, UserRole, LoginResponse } from "../types";
import { useToast } from "@/components/ui/use-toast";
import { authApi } from "@/utils/api";

interface AuthContextType {
  user: User | null;
  login: (phone: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
  userRole: UserRole | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ 
  children
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { toast } = useToast();

  useEffect(() => {
    // Check local storage for saved auth data
    const checkAuth = () => {
      const savedAuth = localStorage.getItem("auth");
      if (savedAuth) {
        try {
          const authData = JSON.parse(savedAuth) as LoginResponse;
          setUser(authData.user);
          // Store token separately for easy access
          localStorage.setItem("authToken", authData.token);
        } catch (error) {
          console.error("Failed to parse stored auth data", error);
          localStorage.removeItem("auth");
          localStorage.removeItem("authToken");
        }
      }
      setIsLoading(false);
    };
    
    checkAuth();
  }, []);

  const login = async (phone: string, password: string): Promise<boolean> => {
    try {
      // Use live API in production, fallback to mock in development if needed
      const isProduction = import.meta.env.PROD;
      
      let response;
      try {
        // Try to use the real API first
        response = await authApi.login(phone, password);
      } catch (apiError) {
        // If in development and API fails, fallback to mock data
        if (!isProduction) {
          console.warn('API login failed, falling back to mock data:', apiError);
          // response = mockDataService.login(phone, password);
        } else {
          // In production, don't fall back to mock data
          throw apiError;
        }
      }

      if (response) {
        setUser(response.user);
        localStorage.setItem("auth", JSON.stringify(response));
        localStorage.setItem("authToken", response.token);
        toast({
          title: "Login Successful",
          description: `Welcome back, ${response.user.name}!`,
        });
        return true;
      } else {
        toast({
          title: "Login Failed",
          description: "Invalid phone number or password.",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      console.error("Login error:", error);

      // console.log(">>>>>>>>>>", error)
      toast({
        title: "Login Error",
        description: "An error occurred during login. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("auth");
    localStorage.removeItem("authToken");
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isLoading,
        isAuthenticated: !!user,
        userRole: user?.role || null,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
