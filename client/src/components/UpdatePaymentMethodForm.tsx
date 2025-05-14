import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { PaymentMethod, PaymentType } from "@shared/schema";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";

// Define the form schema
const updateBalanceSchema = z.object({
  balance: z.number({ 
    required_error: "Balance is required",
    invalid_type_error: "Balance must be a number"
  }),
});

type FormData = z.infer<typeof updateBalanceSchema>;

interface UpdatePaymentMethodFormProps {
  paymentMethod: PaymentMethod;
  onClose: () => void;
}

export function UpdatePaymentMethodForm({ paymentMethod, onClose }: UpdatePaymentMethodFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form with validation
  const form = useForm<FormData>({
    resolver: zodResolver(updateBalanceSchema),
    defaultValues: {
      balance: paymentMethod.balance,
    },
  });

  // Update payment method mutation
  const updatePaymentMethod = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await apiRequest(
        "PATCH", 
        `/api/payment-methods/${paymentMethod.name}`, 
        data
      );
      return response.json();
    },
    onSuccess: () => {
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/payment-methods"] });
      queryClient.invalidateQueries({ queryKey: ["/api/summary"] });
      
      // Show success message
      toast({
        title: "Balance updated",
        description: `${paymentMethod.name} balance has been updated successfully.`,
      });
      
      // Close the form
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Error updating balance",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Form submission handler
  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      await updatePaymentMethod.mutateAsync(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="border border-gray-100 mb-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center">
          Update {paymentMethod.name} Balance
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="balance"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Balance: {formatCurrency(paymentMethod.balance)}</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Enter new balance"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end">
              <Button
                type="button"
                variant="outline"
                className="mr-2"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Updating..." : "Update Balance"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}