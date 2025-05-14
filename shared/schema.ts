import { pgTable, text, serial, integer, boolean, timestamp, doublePrecision } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enum values for the transaction fields
export const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

export const PAYMENT_TYPES = [
  "CASH",
  "ESEWA",
  "KHALTI",
  "LAXMIBANK",
  "IMEPAY",
  "NIC ASIA",
  "MACHA BL",
] as const;

export const TRANSACTION_REASONS = [
  "Transportation",
  "Food",
  "Salary",
  "Internet",
  "TV",
  "House Rent Income",
  "Dad/ Mom",
  "Games / Apps",
  "Phone Recharge",
  "Festival",
  "Online to Cash",
  "Cash To Online",
  "Stationary",
  "Bank/ Wallet Interest",
  "Loan",
  "EMI",
  "Transfer to Antother app",
  "Given By others",
  "Gift to others",
  "Tech",
  "Lost",
  "Entertainment",
  "Clothes / Shoes",
  "Cash Withdrawal",
  "Medicine",
  "Haircut",
  "Card Game",
] as const;

export const TRANSACTION_TYPES = ["Income", "Expense"] as const;

// Transaction schema
export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  day: text("day", { enum: DAYS }).notNull(),
  nepaliDate: text("nepali_date").notNull(),
  englishDate: timestamp("english_date").notNull(),
  type: text("type", { enum: TRANSACTION_TYPES }).notNull(),
  amount: doublePrecision("amount").notNull(),
  reason: text("reason", { enum: TRANSACTION_REASONS }).notNull(),
  paymentType: text("payment_type", { enum: PAYMENT_TYPES }).notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow()
});

// Payment method balances schema
export const paymentMethods = pgTable("payment_methods", {
  id: serial("id").primaryKey(),
  name: text("name", { enum: PAYMENT_TYPES }).notNull().unique(),
  balance: doublePrecision("balance").notNull().default(0),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Create Zod schemas
export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  createdAt: true
});

export const insertPaymentMethodSchema = createInsertSchema(paymentMethods).omit({
  id: true,
  updatedAt: true
});

export const updatePaymentMethodSchema = createInsertSchema(paymentMethods).pick({
  balance: true
});

// Define types
export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type PaymentMethod = typeof paymentMethods.$inferSelect;
export type InsertPaymentMethod = z.infer<typeof insertPaymentMethodSchema>;
export type UpdatePaymentMethod = z.infer<typeof updatePaymentMethodSchema>;
export type TransactionType = typeof TRANSACTION_TYPES[number];
export type PaymentType = typeof PAYMENT_TYPES[number];
export type TransactionReason = typeof TRANSACTION_REASONS[number];
export type Day = typeof DAYS[number];

// Extended transaction schema with validation
export const transactionFormSchema = insertTransactionSchema.extend({
  amount: z.number().positive("Amount must be greater than 0"),
  nepaliDate: z.string().min(1, "Nepali date is required"),
  englishDate: z
    .string()
    .min(1, "English date is required")
    .transform((val) => new Date(val))
});
