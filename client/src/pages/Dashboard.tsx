import { SummaryCards } from "@/components/SummaryCards";
import { PaymentMethodCards } from "@/components/PaymentMethodCards";
import { AddTransactionForm } from "@/components/AddTransactionForm";
import { TransactionTable } from "@/components/TransactionTable";
import { AnalyticsCharts } from "@/components/AnalyticsCharts";
import { Helmet } from "react-helmet";

export default function Dashboard() {
  return (
    <>
      <Helmet>
        <title>Dashboard | Finance Tracker</title>
        <meta name="description" content="Track your personal finances with Nepali and English date support." />
      </Helmet>

      <div className="p-4 md:p-6">
        <h2 className="text-xl font-semibold mb-4 hidden md:block">Dashboard Overview</h2>
        
        {/* Summary Cards */}
        <SummaryCards />
        
        {/* Payment Method Cards */}
        <h2 className="text-lg font-semibold mb-4">Payment Methods</h2>
        <PaymentMethodCards />
        
        {/* Add Transaction Form */}
        <AddTransactionForm />
        
        {/* Recent Transactions */}
        <TransactionTable />
        
        {/* Analytics Charts */}
        <AnalyticsCharts />
      </div>
    </>
  );
}
