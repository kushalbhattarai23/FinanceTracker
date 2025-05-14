import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const openSidebar = () => setSidebarOpen(true);
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />
      <main className="flex-1 overflow-x-hidden">
        <Header onOpenSidebar={openSidebar} />
        {children}
      </main>
    </div>
  );
}
