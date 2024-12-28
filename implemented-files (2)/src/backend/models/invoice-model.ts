import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import { PaymentModel } from './payment-model';

// 請求書の属性インターフェース
interface InvoiceAttributes {
  id: number;
  clientName: string;
  invoiceNumber: string;
  issueDate: Date;
  dueDate: Date;
  totalAmount: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  description?: string;
  taxRate: number;
  currency: string;
  paymentId?: number;
}

// 作成時のオプショナル属性
interface InvoiceCreationAttributes extends Optional<InvoiceAttributes, 'id'> {}

// Sequelizeモデルクラス
class InvoiceModel extends Model<InvoiceAttributes, InvoiceCreationAttributes> implements InvoiceAttributes {
  public id!: number;
  public clientName!: string;
  public invoiceNumber!: string;
  public issueDate!: Date;
  public dueDate!: Date;
  public totalAmount!: number;
  public status!: 'draft' | 'sent' | 'paid' | 'overdue';
  public description?: string;
  public taxRate!: number;
  public currency!: string;
  public paymentId?: number;

  // ビジネスロジックメソッド：合計金額計算
  calculateTotalWithTax(): number {
    return this.totalAmount * (1 + this.taxRate);
  }

  // ステータス更新メソッド
  updateStatus(newStatus: InvoiceAttributes['status']): void {
    if (['draft', 'sent', 'paid', 'overdue'].includes(newStatus)) {
      this.status = newStatus;
      this.save();
    } else {
      throw new Error('Invalid invoice status');
    }
  }

  // 支払い関連付けメソッド
  async associatePayment(paymentId: number): Promise<void> {
    const payment = await PaymentModel.findByPk(paymentId);
    if (payment) {
      this.paymentId = paymentId;
      await this.save();
    } else {
      throw new Error('Payment not found');
    }
  }

  // 期限切れチェックメソッド
  isOverdue(): boolean {
    return this.status !== 'paid' && new Date() > this.dueDate;
  }
}

// モデルの初期化
InvoiceModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    clientName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    invoiceNumber: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    issueDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    dueDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    totalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('draft', 'sent', 'paid', 'overdue'),
      defaultValue: 'draft',
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    taxRate: {
      type: DataTypes.DECIMAL(5, 4),
      defaultValue: 0.1, // 10%の消費税
    },
    currency: {
      type: DataTypes.STRING(3),
      defaultValue: 'JPY',
    },
    paymentId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Payments',
        key: 'id',
      },
    },
  },
  {
    sequelize,
    modelName: 'Invoice',
    tableName: 'invoices',
    timestamps: true,
  }
);

// リレーションシップの設定
InvoiceModel.belongsTo(PaymentModel, {
  foreignKey: 'paymentId',
  as: 'payment',
});

export { InvoiceModel, InvoiceAttributes, InvoiceCreationAttributes };