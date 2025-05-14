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

export class MemStorage implements IStorage {
  private transactions: Map<number, Transaction>;
  private paymentMethods: Map<string, PaymentMethod>;
  private nextTransactionId: number;
  private nextPaymentMethodId: number;

  constructor() {
    this.transactions = new Map();
    this.paymentMethods = new Map();
    this.nextTransactionId = 1;
    this.nextPaymentMethodId = 1;
  }

  // Transaction methods
  async getTransactions(): Promise<Transaction[]> {
    return Array.from(this.transactions.values()).sort((a, b) => {
      // Sort by date descending (newest first)
      return new Date(b.englishDate).getTime() - new Date(a.englishDate).getTime();
    });
  }

  async getTransactionById(id: number): Promise<Transaction | undefined> {
    return this.transactions.get(id);
  }

  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const id = this.nextTransactionId++;
    const now = new Date();
    
    const newTransaction: Transaction = {
      ...transaction,
      id,
      createdAt: now,
    };
    
    this.transactions.set(id, newTransaction);
    
    // Update payment method balance
    await this.updatePaymentMethodBalance(
      transaction.paymentType,
      transaction.type === "Income" ? transaction.amount : -transaction.amount
    );
    
    return newTransaction;
  }

  async updateTransaction(
    id: number, 
    updatedFields: Partial<InsertTransaction>
  ): Promise<Transaction | undefined> {
    const existingTransaction = this.transactions.get(id);
    
    if (!existingTransaction) {
      return undefined;
    }
    
    // If payment type or amount or transaction type changed, update payment method balances
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
    
    const updated: Transaction = {
      ...existingTransaction,
      ...updatedFields,
    };
    
    this.transactions.set(id, updated);
    return updated;
  }

  async deleteTransaction(id: number): Promise<boolean> {
    const transaction = this.transactions.get(id);
    
    if (!transaction) {
      return false;
    }
    
    // Revert the effect of this transaction on payment method balance
    await this.updatePaymentMethodBalance(
      transaction.paymentType,
      transaction.type === "Income" ? -transaction.amount : transaction.amount
    );
    
    this.transactions.delete(id);
    return true;
  }

  // Payment method methods
  async getPaymentMethods(): Promise<PaymentMethod[]> {
    return Array.from(this.paymentMethods.values());
  }

  async getPaymentMethodByName(name: PaymentType): Promise<PaymentMethod | undefined> {
    return this.paymentMethods.get(name);
  }

  async createPaymentMethod(paymentMethod: InsertPaymentMethod): Promise<PaymentMethod> {
    const id = this.nextPaymentMethodId++;
    const now = new Date();
    
    const newPaymentMethod: PaymentMethod = {
      ...paymentMethod,
      id,
      updatedAt: now,
    };
    
    this.paymentMethods.set(paymentMethod.name, newPaymentMethod);
    return newPaymentMethod;
  }

  async updatePaymentMethod(name: PaymentType, balance: number): Promise<PaymentMethod | undefined> {
    const existingPaymentMethod = this.paymentMethods.get(name);
    
    if (!existingPaymentMethod) {
      return undefined;
    }
    
    const updated: PaymentMethod = {
      ...existingPaymentMethod,
      balance,
      updatedAt: new Date(),
    };
    
    this.paymentMethods.set(name, updated);
    return updated;
  }

  // Initialize all payment methods with zero balance
  async initializePaymentMethods(): Promise<void> {
    for (const paymentType of PAYMENT_TYPES) {
      if (!this.paymentMethods.has(paymentType)) {
        await this.createPaymentMethod({
          name: paymentType,
          balance: 0,
        });
      }
    }
  }

  // Utility method to update payment method balance
  private async updatePaymentMethodBalance(paymentType: PaymentType, amountChange: number): Promise<void> {
    const paymentMethod = await this.getPaymentMethodByName(paymentType);
    
    if (paymentMethod) {
      const newBalance = paymentMethod.balance + amountChange;
      await this.updatePaymentMethod(paymentType, newBalance);
    } else {
      // Create if it doesn't exist
      await this.createPaymentMethod({
        name: paymentType,
        balance: amountChange,
      });
    }
  }
}

// Create and export instance
export const storage = new MemStorage();

// Initialize payment methods with default values
storage.initializePaymentMethods().catch(console.error);
