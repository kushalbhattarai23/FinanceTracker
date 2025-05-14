import { useQuery } from "@tanstack/react-query";
import { Transaction } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";

export function AnalyticsCharts() {
  const { data: transactions = [], isLoading } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions"],
  });

  // For expense categories pie chart
  const getExpenseCategoriesData = () => {
    const expenseTransactions = transactions.filter(t => t.type === "Expense");
    const reasonCounts: Record<string, number> = {};
    
    expenseTransactions.forEach(transaction => {
      if (!reasonCounts[transaction.reason]) {
        reasonCounts[transaction.reason] = 0;
      }
      reasonCounts[transaction.reason] += transaction.amount;
    });
    
    return Object.entries(reasonCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5); // Top 5 categories
  };

  // For monthly trend bar chart
  const getMonthlyTrendData = () => {
    const months: Record<string, { month: string, income: number, expense: number }> = {};
    const date = new Date();
    const currentYear = date.getFullYear();
    
    // Initialize last 5 months
    for (let i = 4; i >= 0; i--) {
      const monthDate = new Date(currentYear, date.getMonth() - i, 1);
      const monthName = monthDate.toLocaleString('default', { month: 'short' });
      months[monthName] = { month: monthName, income: 0, expense: 0 };
    }
    
    transactions.forEach(transaction => {
      const transactionDate = new Date(transaction.englishDate);
      const monthName = transactionDate.toLocaleString('default', { month: 'short' });
      
      if (months[monthName]) {
        if (transaction.type === "Income") {
          months[monthName].income += transaction.amount;
        } else {
          months[monthName].expense += transaction.amount;
        }
      }
    });
    
    return Object.values(months);
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A569BD'];

  const expenseCategoriesData = getExpenseCategoriesData();
  const monthlyTrendData = getMonthlyTrendData();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card className="border border-gray-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Expense Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="aspect-square max-h-64 flex items-center justify-center">
              <Skeleton className="w-full h-full rounded-md" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border border-gray-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Monthly Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="aspect-square max-h-64 flex items-center justify-center">
              <Skeleton className="w-full h-full rounded-md" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
      <Card className="border border-gray-100">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Expense Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="aspect-square max-h-64 flex items-center justify-center">
            {expenseCategoriesData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expenseCategoriesData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  >
                    {expenseCategoriesData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `NPR ${value.toLocaleString()}`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center text-gray-500">
                No expense data available
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      <Card className="border border-gray-100">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Monthly Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="aspect-square max-h-64 flex items-center justify-center">
            {monthlyTrendData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={monthlyTrendData}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => `NPR ${value.toLocaleString()}`} />
                  <Legend />
                  <Bar dataKey="income" name="Income" fill="#10B981" />
                  <Bar dataKey="expense" name="Expense" fill="#EF4444" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center text-gray-500">
                No monthly data available
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
