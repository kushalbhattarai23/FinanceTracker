import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { formatCurrency } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface SummaryData {
  totalIncome: number;
  totalExpense: number;
  totalBalance: number;
  lastUpdated: string;
}

export function SummaryCards() {
  const { data, isLoading } = useQuery<SummaryData>({
    queryKey: ["/api/summary"],
  });

  // Format the last updated time
  const formatLastUpdated = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="border border-gray-100">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-5 w-5 rounded-full" />
              </div>
              <Skeleton className="h-8 w-32 mt-2" />
              <Skeleton className="h-3 w-20 mt-4" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <Card className="border border-gray-100">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500">Total Balance</h3>
            <i className="ri-wallet-3-line text-primary"></i>
          </div>
          <p className="text-2xl font-semibold">
            {formatCurrency(data?.totalBalance || 0)}
          </p>
          <div className="mt-2 text-xs text-gray-500">
            Updated: {data?.lastUpdated ? formatLastUpdated(data.lastUpdated) : "Today"}
          </div>
        </CardContent>
      </Card>
      
      <Card className="border border-gray-100">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500">Total Income</h3>
            <i className="ri-arrow-up-circle-line text-income"></i>
          </div>
          <p className="text-2xl font-semibold text-income">
            {formatCurrency(data?.totalIncome || 0)}
          </p>
          <div className="flex items-center mt-2 text-xs">
            <span className="text-income flex items-center">
              <i className="ri-arrow-up-line mr-1"></i> 
              <span className="text-gray-500 ml-1">
                from transactions
              </span>
            </span>
          </div>
        </CardContent>
      </Card>
      
      <Card className="border border-gray-100">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500">Total Expenses</h3>
            <i className="ri-arrow-down-circle-line text-expense"></i>
          </div>
          <p className="text-2xl font-semibold text-expense">
            {formatCurrency(data?.totalExpense || 0)}
          </p>
          <div className="flex items-center mt-2 text-xs">
            <span className="text-expense flex items-center">
              <i className="ri-arrow-up-line mr-1"></i> 
              <span className="text-gray-500 ml-1">
                from transactions
              </span>
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
