import {
  transactions,
  paymentMethods,
  users,
  type Transaction,
  type InsertTransaction,
  type PaymentMethod,
  type InsertPaymentMethod,
  type UpdatePaymentMethod,
  type PaymentType,
  type User,
  type InsertUser,
  PAYMENT_TYPES,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";
import { IStorage } from "./storage";

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result.length > 0 ? result[0] : undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username));
    return result.length > 0 ? result[0] : undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [newUser] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    
    // Initialize payment methods for this user
    await this.initializePaymentMethodsForUser(newUser.id);
    
    return newUser;
  }

  // Transaction methods
  async getTransactions(): Promise<Transaction[]> {
    return db.select().from(transactions).orderBy(desc(transactions.englishDate));
  }

  async getTransactionById(id: number): Promise<Transaction | undefined> {
    const result = await db.select().from(transactions).where(eq(transactions.id, id));
    return result.length > 0 ? result[0] : undefined;
  }

  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const [newTransaction] = await db.insert(transactions).values(transaction).returning();
    
    // Update payment method balance
    await this.updatePaymentMethodBalance(
      transaction.paymentType,
      transaction.type === "Income" ? transaction.amount : -transaction.amount
    );
    
    return newTransaction;
  }

  async updateTransaction(id: number, updatedFields: Partial<InsertTransaction>): Promise<Transaction | undefined> {
    const existingTransaction = await this.getTransactionById(id);
    
    if (!existingTransaction) {
      return undefined;
    }
    
    // If payment type, amount or transaction type changed, update payment method balances
    if (
      updatedFields.paymentType !== undefined ||
      updatedFields.amount !== undefined ||
      updatedFields.type !== undefined
    ) {
      // Revert the previous transaction's effect on balance
      await this.updatePaymentMethodBalance(
        existingTransaction.paymentType,
        existingTransaction.type === "Income" ? -existingTransaction.amount : existingTransaction.amount
      );
      
      // Apply the new transaction's effect on balance
      const newPaymentType = updatedFields.paymentType || existingTransaction.paymentType;
      const newAmount = updatedFields.amount || existingTransaction.amount;
      const newType = updatedFields.type || existingTransaction.type;
      
      await this.updatePaymentMethodBalance(
        newPaymentType,
        newType === "Income" ? newAmount : -newAmount
      );
    }
    
    const [updated] = await db
      .update(transactions)
      .set(updatedFields)
      .where(eq(transactions.id, id))
      .returning();
    
    return updated;
  }

  async deleteTransaction(id: number): Promise<boolean> {
    const transaction = await this.getTransactionById(id);
    
    if (!transaction) {
      return false;
    }
    
    // Revert the effect of this transaction on payment method balance
    await this.updatePaymentMethodBalance(
      transaction.paymentType,
      transaction.type === "Income" ? -transaction.amount : transaction.amount
    );
    
    const result = await db
      .delete(transactions)
      .where(eq(transactions.id, id))
      .returning({ id: transactions.id });
    
    return result.length > 0;
  }

  // Payment method methods
  async getPaymentMethods(): Promise<PaymentMethod[]> {
    return db.select().from(paymentMethods);
  }

  async getPaymentMethodByName(name: PaymentType): Promise<PaymentMethod | undefined> {
    const result = await db.select().from(paymentMethods).where(eq(paymentMethods.name, name));
    return result.length > 0 ? result[0] : undefined;
  }

  async createPaymentMethod(paymentMethod: InsertPaymentMethod): Promise<PaymentMethod> {
    const [newPaymentMethod] = await db
      .insert(paymentMethods)
      .values(paymentMethod)
      .returning();
    
    return newPaymentMethod;
  }

  async updatePaymentMethod(name: PaymentType, balance: number): Promise<PaymentMethod | undefined> {
    const existingPaymentMethod = await this.getPaymentMethodByName(name);
    
    if (!existingPaymentMethod) {
      return undefined;
    }
    
    const [updated] = await db
      .update(paymentMethods)
      .set({ 
        balance,
        updatedAt: new Date()
      })
      .where(eq(paymentMethods.name, name))
      .returning();
    
    return updated;
  }

  // Utility methods
  async initializePaymentMethodsForUser(userId: number): Promise<void> {
    try {
      // Get existing payment methods for this user
      const existingMethods = await db
        .select()
        .from(paymentMethods)
        .where(eq(paymentMethods.userId, userId));
      
      const existingMethodNames = existingMethods.map(m => m.name);
      
      // Create missing payment methods for this user
      for (const paymentType of PAYMENT_TYPES) {
        if (!existingMethodNames.includes(paymentType)) {
          try {
            await this.createPaymentMethod({
              userId,
              name: paymentType,
              balance: 0,
            });
            console.log(`Created payment method: ${paymentType} for user ${userId}`);
          } catch (error: any) {
            // If the payment method already exists (e.g., due to a race condition),
            // just log and continue
            console.log(`Payment method ${paymentType} for user ${userId} already exists or couldn't be created:`, 
              error?.message || "Unknown error");
          }
        }
      }
    } catch (error: any) {
      console.error(`Error initializing payment methods for user ${userId}:`, 
        error?.message || "Unknown error");
    }
  }
  
  // Legacy method for backward compatibility
  async initializePaymentMethods(): Promise<void> {
    console.log("Warning: initializePaymentMethods is deprecated. Use initializePaymentMethodsForUser instead.");
  }

  // Utility method to update payment method balance
  private async updatePaymentMethodBalance(userId: number, paymentType: PaymentType, amountChange: number): Promise<void> {
    try {
      const paymentMethod = await db
        .select()
        .from(paymentMethods)
        .where(and(
          eq(paymentMethods.userId, userId),
          eq(paymentMethods.name, paymentType)
        ));
      
      if (paymentMethod.length > 0) {
        const currentMethod = paymentMethod[0];
        const newBalance = currentMethod.balance + amountChange;
        
        await db
          .update(paymentMethods)
          .set({ 
            balance: newBalance,
            updatedAt: new Date()
          })
          .where(and(
            eq(paymentMethods.userId, userId),
            eq(paymentMethods.name, paymentType)
          ));
      } else {
        // Create if it doesn't exist
        try {
          await this.createPaymentMethod({
            userId,
            name: paymentType,
            balance: amountChange,
          });
        } catch (err: any) {
          // If creation fails (e.g., due to a race condition where another request created it),
          // try updating it instead
          console.log(`Could not create payment method ${paymentType} for user ${userId}, trying to update instead:`, 
            err?.message || "Unknown error");
          
          const refreshedMethod = await db
            .select()
            .from(paymentMethods)
            .where(and(
              eq(paymentMethods.userId, userId),
              eq(paymentMethods.name, paymentType)
            ));
          
          if (refreshedMethod.length > 0) {
            const currentMethod = refreshedMethod[0];
            const newBalance = currentMethod.balance + amountChange;
            
            await db
              .update(paymentMethods)
              .set({ 
                balance: newBalance,
                updatedAt: new Date()
              })
              .where(and(
                eq(paymentMethods.userId, userId),
                eq(paymentMethods.name, paymentType)
              ));
          }
        }
      }
    } catch (error: any) {
      console.error(`Error updating balance for payment method ${paymentType} for user ${userId}:`, 
        error?.message || "Unknown error");
    }
  }
}