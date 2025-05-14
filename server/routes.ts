import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertTransactionSchema, 
  updatePaymentMethodSchema,
  PAYMENT_TYPES,
  transactionFormSchema
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize the server
  const httpServer = createServer(app);
  
  // Initialize payment methods if they don't exist
  await storage.initializePaymentMethods();

  // Get all transactions
  app.get("/api/transactions", async (req: Request, res: Response) => {
    try {
      const transactions = await storage.getTransactions();
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ message: "Error fetching transactions" });
    }
  });

  // Get a transaction by ID
  app.get("/api/transactions/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid transaction ID" });
      }

      const transaction = await storage.getTransactionById(id);
      if (!transaction) {
        return res.status(404).json({ message: "Transaction not found" });
      }

      res.json(transaction);
    } catch (error) {
      res.status(500).json({ message: "Error fetching transaction" });
    }
  });

  // Create a new transaction
  app.post("/api/transactions", async (req: Request, res: Response) => {
    try {
      const validatedData = transactionFormSchema.parse(req.body);
      const transaction = await storage.createTransaction(validatedData);
      res.status(201).json(transaction);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Error creating transaction" });
    }
  });

  // Update a transaction
  app.patch("/api/transactions/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid transaction ID" });
      }

      // Partial validation of the update data
      const validatedData = insertTransactionSchema.partial().parse(req.body);
      
      const updatedTransaction = await storage.updateTransaction(id, validatedData);
      if (!updatedTransaction) {
        return res.status(404).json({ message: "Transaction not found" });
      }

      res.json(updatedTransaction);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Error updating transaction" });
    }
  });

  // Delete a transaction
  app.delete("/api/transactions/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid transaction ID" });
      }

      const success = await storage.deleteTransaction(id);
      if (!success) {
        return res.status(404).json({ message: "Transaction not found" });
      }

      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Error deleting transaction" });
    }
  });

  // Get all payment methods
  app.get("/api/payment-methods", async (req: Request, res: Response) => {
    try {
      const paymentMethods = await storage.getPaymentMethods();
      res.json(paymentMethods);
    } catch (error) {
      res.status(500).json({ message: "Error fetching payment methods" });
    }
  });

  // Get payment method by name
  app.get("/api/payment-methods/:name", async (req: Request, res: Response) => {
    try {
      const name = req.params.name;
      if (!PAYMENT_TYPES.includes(name as any)) {
        return res.status(400).json({ message: "Invalid payment method name" });
      }

      const paymentMethod = await storage.getPaymentMethodByName(name as any);
      if (!paymentMethod) {
        return res.status(404).json({ message: "Payment method not found" });
      }

      res.json(paymentMethod);
    } catch (error) {
      res.status(500).json({ message: "Error fetching payment method" });
    }
  });

  // Update payment method balance
  app.patch("/api/payment-methods/:name", async (req: Request, res: Response) => {
    try {
      const name = req.params.name;
      if (!PAYMENT_TYPES.includes(name as any)) {
        return res.status(400).json({ message: "Invalid payment method name" });
      }

      const { balance } = updatePaymentMethodSchema.parse(req.body);
      
      const updatedPaymentMethod = await storage.updatePaymentMethod(name as any, balance);
      if (!updatedPaymentMethod) {
        return res.status(404).json({ message: "Payment method not found" });
      }

      res.json(updatedPaymentMethod);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Error updating payment method" });
    }
  });

  // Get summary information (total income, expense, balance)
  app.get("/api/summary", async (req: Request, res: Response) => {
    try {
      const transactions = await storage.getTransactions();
      const paymentMethods = await storage.getPaymentMethods();
      
      const totalIncome = transactions
        .filter(t => t.type === "Income")
        .reduce((sum, t) => sum + t.amount, 0);
      
      const totalExpense = transactions
        .filter(t => t.type === "Expense")
        .reduce((sum, t) => sum + t.amount, 0);
      
      const totalBalance = paymentMethods
        .reduce((sum, pm) => sum + pm.balance, 0);
      
      res.json({
        totalIncome,
        totalExpense,
        totalBalance,
        lastUpdated: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({ message: "Error fetching summary" });
    }
  });

  return httpServer;
}
