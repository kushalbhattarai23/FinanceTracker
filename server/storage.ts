import {
  type Transaction,
  type InsertTransaction,
  type PaymentMethod,
  type InsertPaymentMethod,
  type PaymentType,
  PAYMENT_TYPES,
} from "@shared/schema";

// Storage interface
export interface IStorage {
  // Transaction methods
  getTransactions(): Promise<Transaction[]>;
  getTransactionById(id: number): Promise<Transaction | undefined>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  updateTransaction(id: number, transaction: Partial<InsertTransaction>): Promise<Transaction | undefined>;
  deleteTransaction(id: number): Promise<boolean>;
  
  // Payment method methods
  getPaymentMethods(): Promise<PaymentMethod[]>;
  getPaymentMethodByName(name: PaymentType): Promise<PaymentMethod | undefined>;
  createPaymentMethod(paymentMethod: InsertPaymentMethod): Promise<PaymentMethod>;
  updatePaymentMethod(name: PaymentType, balance: number): Promise<PaymentMethod | undefined>;
  
  // Utility methods
  initializePaymentMethods(): Promise<void>;
}

// Import database storage implementation
import { DatabaseStorage } from "./storage-db";

// Create and export the database storage instance
export const storage = new DatabaseStorage();

// Initialize payment methods with default values
storage.initializePaymentMethods().catch(console.error);
