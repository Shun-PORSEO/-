// src/backend/models/payment-model.ts

import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import { Invoice } from './invoice-model';

export interface PaymentAttributes {
  id?: number;
  invoiceId: number;
  amount: number;
  paymentDate: Date;
  paymentMethod: 'credit_card' | 'bank_transfer' | 'cash' | 'paypal';
  status: 'pending' | 'completed' | 'failed';
  transactionId?: string;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Payment extends Model<PaymentAttributes> implements PaymentAttributes {
  public id!: number;
  public invoiceId!: number;
  public amount!: number;
  public paymentDate!: Date;
  public paymentMethod!: 'credit_card' | 'bank_transfer' | 'cash' | 'paypal';
  public status!: 'pending' | 'completed' | 'failed';
  public transactionId?: string;
  public notes?: string;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Validation methods
  public validatePayment(): boolean {
    // Basic validation logic
    if (this.amount <= 0) {
      throw new Error('Payment amount must be greater than zero');
    }

    if (!this.paymentDate) {
      throw new Error('Payment date is required');
    }

    return true;
  }

  // Method to check payment status
  public isPaymentCompleted(): boolean {
    return this.status === 'completed';
  }

  // Static method to calculate total payments for an invoice
  static async calculateTotalPaymentsForInvoice(invoiceId: number): Promise<number> {
    const totalPayments = await this.sum('amount', {
      where: {
        invoiceId: invoiceId,
        status: 'completed'
      }
    });

    return totalPayments || 0;
  }
}

Payment.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  invoiceId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Invoice,
      key: 'id'
    }
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  paymentDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  paymentMethod: {
    type: DataTypes.ENUM('credit_card', 'bank_transfer', 'cash', 'paypal'),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'completed', 'failed'),
    defaultValue: 'pending'
  },
  transactionId: {
    type: DataTypes.STRING,
    unique: true
  },
  notes: {
    type: DataTypes.TEXT
  }
}, {
  sequelize,
  modelName: 'Payment',
  tableName: 'payments',
  timestamps: true
});

// Associations
Payment.belongsTo(Invoice, {
  foreignKey: 'invoiceId',
  as: 'invoice'
});

Invoice.hasMany(Payment, {
  foreignKey: 'invoiceId',
  as: 'payments'
});

export default Payment;