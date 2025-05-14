import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { PaymentMethod } from "@shared/schema";
import { formatCurrency } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

export function PaymentMethodCards() {
  const { data: paymentMethods, isLoading } = useQuery<PaymentMethod[]>({
    queryKey: ["/api/payment-methods"],
  });

  // Define payment method icon and color mapping
  const paymentMethodIcons: Record<string, { icon: string; color: string }> = {
    "CASH": { icon: "ri-money-dollar-circle-line", color: "text-yellow-500" },
    "ESEWA": { icon: "ri-wallet-line", color: "text-green-500" },
    "KHALTI": { icon: "ri-wallet-line", color: "text-purple-500" },
    "LAXMIBANK": { icon: "ri-bank-line", color: "text-blue-500" },
    "IMEPAY": { icon: "ri-bank-card-line", color: "text-red-500" },
    "NIC ASIA": { icon: "ri-bank-line", color: "text-indigo-500" },
    "MACHA BL": { icon: "ri-bank-line", color: "text-teal-500" },
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4, 5, 6, 7].map((i) => (
          <Card key={i} className="border border-gray-100">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Skeleton className="h-5 w-24" />
              </div>
              <Skeleton className="h-7 w-20 mt-2" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {paymentMethods?.map((method) => (
        <Card key={method.name} className="border border-gray-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <i className={`${paymentMethodIcons[method.name]?.icon || 'ri-wallet-line'} ${paymentMethodIcons[method.name]?.color || 'text-gray-500'} mr-2 text-lg`}></i>
                <h3 className="text-sm font-medium">{method.name}</h3>
              </div>
            </div>
            <p className="text-xl font-semibold">
              {formatCurrency(method.balance)}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
