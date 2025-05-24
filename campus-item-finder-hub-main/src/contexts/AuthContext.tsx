import React, { createContext, useContext, useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";

type User = {
  id: string;
  email: string;
  name: string;
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  resetPassword: (email: string) => Promise<void>;
  confirmPasswordReset: (token: string, newPassword: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// In a real app, this would be connected to a backend
const mockUsers: User[] = [
  {
    id: "1",
    email: "demo@campus.edu",
    name: "Demo User",
  },
];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Check for existing auth in localStorage
    const savedUser = localStorage.getItem("campus-user");
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error("Failed to parse saved user:", error);
        localStorage.removeItem("campus-user");
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const foundUser = mockUsers.find(u => u.email === email);
    
    if (foundUser) {
      setUser(foundUser);
      localStorage.setItem("campus-user", JSON.stringify(foundUser));
      toast({
        title: "Logged in successfully",
        description: `Welcome back, ${foundUser.name}!`,
      });
    } else {
      // For demo purposes, auto-create the user
      const newUser = {
        id: Math.random().toString(36).substr(2, 9),
        email,
        name: email.split('@')[0],
      };
      mockUsers.push(newUser);
      setUser(newUser);
      localStorage.setItem("campus-user", JSON.stringify(newUser));
      toast({
        title: "Account created",
        description: "Welcome to Campus Item Finder!",
      });
    }
    
    setIsLoading(false);
  };

  const register = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const foundUser = mockUsers.find(u => u.email === email);
    
    if (foundUser) {
      toast({
        title: "Email already in use",
        description: "Please try logging in instead.",
        variant: "destructive",
      });
    } else {
      const newUser = {
        id: Math.random().toString(36).substr(2, 9),
        email,
        name,
      };
      mockUsers.push(newUser);
      setUser(newUser);
      localStorage.setItem("campus-user", JSON.stringify(newUser));
      toast({
        title: "Registration successful",
        description: "Welcome to Campus Item Finder!",
      });
    }
    
    setIsLoading(false);
  };

  const resetPassword = async (email: string) => {
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const foundUser = mockUsers.find(u => u.email === email);
    
    if (foundUser) {
      // In a real app, this would send an email with a reset link
      // For demo purposes, we'll just show a success message
      toast({
        title: "Reset link sent",
        description: "If an account exists with this email, you will receive password reset instructions.",
      });
    } else {
      // For security, we show the same message even if the user doesn't exist
      toast({
        title: "Reset link sent",
        description: "If an account exists with this email, you will receive password reset instructions.",
      });
    }
    
    setIsLoading(false);
  };

  const confirmPasswordReset = async (token: string, newPassword: string) => {
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // In a real app, this would validate the token and update the password
    // For demo purposes, we'll just show a success message
    toast({
      title: "Password reset successful",
      description: "You can now log in with your new password.",
    });
    
    setIsLoading(false);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("campus-user");
    toast({
      title: "Logged out",
      description: "You have been logged out successfully.",
    });
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isLoading, 
      login, 
      register, 
      logout,
      resetPassword,
      confirmPasswordReset
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
