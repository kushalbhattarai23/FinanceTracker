import { TransactionTable } from "@/components/TransactionTable";
import { AddTransactionForm } from "@/components/AddTransactionForm";
import { Helmet } from "react-helmet";

export default function Transactions() {
  return (
    <>
      <Helmet>
        <title>Transactions | Finance Tracker</title>
        <meta name="description" content="View and manage your financial transactions with detailed filtering and search options." />
      </Helmet>

      <div className="p-4 md:p-6">
        <h2 className="text-xl font-semibold mb-4 hidden md:block">Transactions</h2>
        
        {/* Add Transaction Form */}
        <AddTransactionForm />
        
        {/* Transactions Table */}
        <TransactionTable />
      </div>
    </>
  );
}
