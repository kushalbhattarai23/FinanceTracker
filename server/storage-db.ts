import {
  transactions,
  paymentMethods,
  type Transaction,
  type InsertTransaction,
  type PaymentMethod,
  type InsertPaymentMethod,
  type UpdatePaymentMethod,
  type PaymentType,
  PAYMENT_TYPES,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";
import { IStorage } from "./storage";

export class DatabaseStorage implements IStorage {
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
  async initializePaymentMethods(): Promise<void> {
    try {
      const existingMethods = await this.getPaymentMethods();
      const existingMethodNames = existingMethods.map(m => m.name);
      
      for (const paymentType of PAYMENT_TYPES) {
        if (!existingMethodNames.includes(paymentType)) {
          try {
            await this.createPaymentMethod({
              name: paymentType,
              balance: 0,
            });
            console.log(`Created payment method: ${paymentType}`);
          } catch (error) {
            // If the payment method already exists (e.g., due to a race condition),
            // just log and continue
            console.log(`Payment method ${paymentType} already exists or couldn't be created:`, error.message);
          }
        }
      }
    } catch (error) {
      console.error("Error initializing payment methods:", error);
    }
  }

  // Utility method to update payment method balance
  private async updatePaymentMethodBalance(paymentType: PaymentType, amountChange: number): Promise<void> {
    try {
      const paymentMethod = await this.getPaymentMethodByName(paymentType);
      
      if (paymentMethod) {
        const newBalance = paymentMethod.balance + amountChange;
        await this.updatePaymentMethod(paymentType, newBalance);
      } else {
        // Create if it doesn't exist
        try {
          await this.createPaymentMethod({
            name: paymentType,
            balance: amountChange,
          });
        } catch (err) {
          // If creation fails (e.g., due to a race condition where another request created it),
          // try updating it instead
          console.log(`Could not create payment method ${paymentType}, trying to update instead:`, err.message);
          const refreshedMethod = await this.getPaymentMethodByName(paymentType);
          if (refreshedMethod) {
            const updatedBalance = refreshedMethod.balance + amountChange;
            await this.updatePaymentMethod(paymentType, updatedBalance);
          }
        }
      }
    } catch (error) {
      console.error(`Error updating balance for payment method ${paymentType}:`, error);
    }
  }
}