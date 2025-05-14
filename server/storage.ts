import {
  type Transaction,
  type InsertTransaction,
  type PaymentMethod,
  type InsertPaymentMethod,
  type PaymentType,
  type User,
  type InsertUser,
  PAYMENT_TYPES,
} from "@shared/schema";

// Storage interface
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(insertUser: InsertUser): Promise<User>;
  
  // Transaction methods
  getTransactions(userId: number): Promise<Transaction[]>;
  getTransactionById(id: number, userId: number): Promise<Transaction | undefined>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  updateTransaction(id: number, userId: number, transaction: Partial<InsertTransaction>): Promise<Transaction | undefined>;
  deleteTransaction(id: number, userId: number): Promise<boolean>;
  
  // Payment method methods
  getPaymentMethods(userId: number): Promise<PaymentMethod[]>;
  getPaymentMethodByName(userId: number, name: PaymentType): Promise<PaymentMethod | undefined>;
  createPaymentMethod(paymentMethod: InsertPaymentMethod): Promise<PaymentMethod>;
  updatePaymentMethod(userId: number, name: PaymentType, balance: number): Promise<PaymentMethod | undefined>;
  
  // Utility methods
  initializePaymentMethodsForUser(userId: number): Promise<void>;
  initializePaymentMethods(): Promise<void>; // Legacy method for backwards compatibility
}

// Import database storage implementation
import { DatabaseStorage } from "./storage-db";

// Create and export the database storage instance
export const storage = new DatabaseStorage();

// Initialize payment methods with default values
storage.initializePaymentMethods().catch(console.error);
