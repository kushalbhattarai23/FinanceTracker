import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const [location] = useLocation();

  const navItems = [
    {
      name: "Dashboard",
      path: "/",
      icon: "ri-dashboard-line",
    },
    {
      name: "Transactions",
      path: "/transactions",
      icon: "ri-history-line",
    },
    {
      name: "Payment Methods",
      path: "/payment-methods",
      icon: "ri-wallet-3-line",
    },
  ];

  return (
    <aside
      className={cn(
        "bg-gray-800 text-white w-full md:w-64 flex-shrink-0 md:flex flex-col fixed md:sticky top-0 h-screen z-40 transition-all duration-300 ease-in-out",
        isOpen ? "left-0" : "-left-full md:left-0"
      )}
    >
      <div className="p-4 flex items-center justify-between">
        <h1 className="font-semibold text-xl">Finance Tracker</h1>
        <button onClick={onClose} className="md:hidden text-white">
          <i className="ri-close-line text-xl"></i>
        </button>
      </div>
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.path}>
              <div
                onClick={() => {
                  window.location.href = item.path;
                }}
                className={cn(
                  "flex items-center space-x-3 p-2 rounded-lg cursor-pointer",
                  location === item.path
                    ? "bg-gray-700"
                    : "hover:bg-gray-700"
                )}
              >
                <i className={`${item.icon} text-lg`}></i>
                <span>{item.name}</span>
              </div>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
