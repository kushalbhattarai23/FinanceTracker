import { useLocation } from "wouter";

interface HeaderProps {
  onOpenSidebar: () => void;
}

export function Header({ onOpenSidebar }: HeaderProps) {
  const [location] = useLocation();

  // Get page title based on current route
  const getPageTitle = () => {
    switch (location) {
      case "/":
        return "Dashboard";
      case "/transactions":
        return "Transactions";
      case "/payment-methods":
        return "Payment Methods";
      default:
        return "Finance Tracker";
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center md:hidden">
          <button onClick={onOpenSidebar} className="text-gray-600">
            <i className="ri-menu-line text-xl"></i>
          </button>
        </div>
        <h1 className="text-lg font-semibold md:hidden">{getPageTitle()}</h1>
        <div className="flex items-center space-x-4">
          <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
            <i className="ri-user-fill text-gray-600"></i>
          </div>
        </div>
      </div>
    </header>
  );
}
