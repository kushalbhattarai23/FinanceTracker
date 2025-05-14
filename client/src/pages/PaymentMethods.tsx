import { PaymentMethodCards } from "@/components/PaymentMethodCards";
import { Helmet } from "react-helmet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { PaymentMethod } from "@shared/schema";
import { formatCurrency } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

export default function PaymentMethods() {
  const { data: paymentMethods = [], isLoading } = useQuery<PaymentMethod[]>({
    queryKey: ["/api/payment-methods"],
  });

  // Define payment method icon and color mapping
  const paymentMethodIcons: Record<string, { icon: string; color: string; description: string }> = {
    "CASH": { 
      icon: "ri-money-dollar-circle-line", 
      color: "text-yellow-500",
      description: "Physical money for in-person transactions"
    },
    "ESEWA": { 
      icon: "ri-wallet-line", 
      color: "text-green-500",
      description: "Digital wallet for online payments"
    },
    "KHALTI": { 
      icon: "ri-wallet-line", 
      color: "text-purple-500",
      description: "Mobile wallet for instant transfers"
    },
    "LAXMIBANK": { 
      icon: "ri-bank-line", 
      color: "text-blue-500",
      description: "Bank account for savings and transfers"
    },
    "IMEPAY": { 
      icon: "ri-bank-card-line", 
      color: "text-red-500",
      description: "Digital payment service"
    },
    "NIC ASIA": { 
      icon: "ri-bank-line", 
      color: "text-indigo-500",
      description: "Bank account for daily transactions"
    },
    "MACHA BL": { 
      icon: "ri-bank-line", 
      color: "text-teal-500",
      description: "Banking service for financial management"
    },
  };

  return (
    <>
      <Helmet>
        <title>Payment Methods | Finance Tracker</title>
        <meta name="description" content="Manage and track balances across multiple payment methods including cash, digital wallets, and bank accounts." />
      </Helmet>

      <div className="p-4 md:p-6">
        <h2 className="text-xl font-semibold mb-4 hidden md:block">Payment Methods</h2>
        
        {/* Payment Method Cards */}
        <PaymentMethodCards />

        {/* Detailed Payment Method List */}
        <h2 className="text-lg font-semibold mb-4">Payment Method Details</h2>
        <div className="grid grid-cols-1 gap-4 mb-6">
          {isLoading ? (
            <Card>
              <CardContent className="p-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-20 w-full mt-4" />
              </CardContent>
            </Card>
          ) : (
            paymentMethods.map((method) => (
              <Card key={method.name} className="border border-gray-100">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center text-lg">
                    <i className={`${paymentMethodIcons[method.name]?.icon || 'ri-wallet-line'} ${paymentMethodIcons[method.name]?.color || 'text-gray-500'} mr-2 text-xl`}></i>
                    {method.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-sm text-gray-500 mb-2">
                        {paymentMethodIcons[method.name]?.description || "Payment method for transactions"}
                      </p>
                      <p className="text-sm text-gray-500">
                        Last updated: {new Date(method.updatedAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="mt-4 md:mt-0">
                      <div className="text-2xl font-semibold">
                        {formatCurrency(method.balance)}
                      </div>
                      <div className={`text-sm ${method.balance >= 0 ? 'text-income' : 'text-expense'}`}>
                        {method.balance >= 0 ? 'Available Balance' : 'Negative Balance'}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </>
  );
}
