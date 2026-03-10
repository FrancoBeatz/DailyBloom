import React, { useState, useEffect } from "react";
import Sidebar from "./components/layout/Sidebar";
import MobileNav from "./components/layout/MobileNav";
import { useAuth } from "@/lib/AuthContext";
import Login from "@/pages/Login";

export default function Layout({ children, currentPageName }) {
  const { user, loading } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMd, setIsMd] = useState(false);

  useEffect(() => {
    const check = () => setIsMd(window.innerWidth >= 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0e17] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-teal-500/20 border-t-teal-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <div className="min-h-screen bg-[#0a0e17] relative">
      {/* Ambient background effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-teal-500/[0.03] blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-purple-500/[0.03] blur-[120px]" />
      </div>

      {/* Desktop sidebar */}
      <div className="hidden md:block">
        <Sidebar
          currentPage={currentPageName}
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
      </div>

      {/* Mobile nav */}
      <MobileNav currentPage={currentPageName} />

      {/* Main content */}
      <main
        className="relative z-10 transition-all duration-300"
        style={{ marginLeft: isMd ? (sidebarCollapsed ? 72 : 260) : 0 }}
      >
        <div className="pt-16 pb-20 md:pt-0 md:pb-0 min-h-screen">
          {children}
        </div>
      </main>
    </div>
  );
}
