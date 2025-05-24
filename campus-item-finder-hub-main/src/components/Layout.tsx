import React, { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserCircle, LogOut, Menu } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import BackgroundElements from "./BackgroundElements";

type LayoutProps = {
  children: React.ReactNode;
};

const Layout = ({ children }: LayoutProps) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      <BackgroundElements />
      
      <motion.header 
        className={`fixed w-full z-50 transition-all duration-300 ${
          scrolled ? "bg-white/80 backdrop-blur-md shadow-md" : "bg-[#1a73e8]"
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <div className="container mx-auto px-4 h-16 flex justify-between items-center">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link to="/" className={`text-xl font-semibold transition-colors duration-300 ${
              scrolled ? "text-[#1a73e8]" : "text-white"
            }`}>
              Campus Item Finder
            </Link>
          </motion.div>

          {user ? (
            <div className="flex items-center gap-6">
              <div className="hidden md:flex items-center gap-6">
                {[
                  { to: "/dashboard", label: "Dashboard" },
                  { to: "/report-lost", label: "Report Lost" },
                  { to: "/report-found", label: "Report Found" }
                ].map((item) => (
                  <motion.div
                    key={item.to}
                    whileHover={{ y: -2 }}
                    whileTap={{ y: 0 }}
                  >
                    <Link 
                      to={item.to}
                      className={`relative ${
                        scrolled ? "text-gray-700" : "text-white"
                      } hover:opacity-80 transition-all duration-300`}
                    >
                      {item.label}
                      {location.pathname === item.to && (
                        <motion.div
                          className="absolute bottom-0 left-0 right-0 h-0.5 bg-current"
                          layoutId="underline"
                        />
                      )}
                    </Link>
                  </motion.div>
                ))}
              </div>
              <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
                <DropdownMenuTrigger asChild>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className={`relative transition-all duration-300 ${
                        scrolled 
                          ? "text-gray-700 hover:text-gray-900 hover:bg-gray-100/80" 
                          : "text-white hover:text-white/90 hover:bg-white/10"
                      }`}
                    >
                      <UserCircle className="h-5 w-5 md:mr-2" />
                      <span className="hidden md:inline">Chanukya</span>
                    </Button>
                  </motion.div>
                </DropdownMenuTrigger>
                <AnimatePresence>
                  {menuOpen && (
                    <DropdownMenuContent 
                      align="end"
                      asChild
                      forceMount
                    >
                      <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        className="bg-white rounded-lg shadow-lg p-2"
                      >
                        <DropdownMenuItem className="md:hidden">
                          <Link to="/dashboard" className="w-full">Dashboard</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="md:hidden">
                          <Link to="/report-lost" className="w-full">Report Lost</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="md:hidden">
                          <Link to="/report-found" className="w-full">Report Found</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={handleLogout} 
                          className="text-red-500 hover:text-red-600 hover:bg-red-50 transition-colors duration-300"
                        >
                          <LogOut className="mr-2 h-4 w-4" /> Logout
                        </DropdownMenuItem>
                      </motion.div>
                    </DropdownMenuContent>
                  )}
                </AnimatePresence>
              </DropdownMenu>
            </div>
          ) : (
            <div className="flex gap-4">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  variant="ghost" 
                  className={`transition-all duration-300 ${
                    scrolled 
                      ? "text-gray-700 hover:text-gray-900 hover:bg-gray-100/80" 
                      : "text-white hover:text-white/90 hover:bg-white/10"
                  }`}
                  onClick={() => navigate("/login")}
                >
                  Login
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  className={`transition-all duration-300 ${
                    scrolled 
                      ? "bg-[#1a73e8] text-white hover:bg-[#1557b0]"
                      : "bg-white text-[#1a73e8] hover:bg-white/90"
                  }`}
                  onClick={() => navigate("/register")}
                >
                  Sign Up
                </Button>
              </motion.div>
            </div>
          )}
        </div>
      </motion.header>

      <main className="flex-1 container mx-auto px-4 pt-24 relative z-10">
        {children}
      </main>

      <motion.footer 
        className="py-4 text-center text-sm text-muted-foreground relative z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <div className="container mx-auto px-4">
          <p>© {new Date().getFullYear()} Campus Item Finder. All rights reserved.</p>
        </div>
      </motion.footer>
    </div>
  );
};

export default Layout;
