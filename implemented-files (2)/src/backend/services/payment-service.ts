以下に、指定されたYAMLに基づいて`src/backend/services/payment-service.ts`を実装します：

```typescript
import { PaymentModel } from '../models/payment-model';
import { PaymentRepository } from '../repositories/payment-repository';
import { PaymentStatus } from '../types/payment-types';
import { ValidationError } from '../utils/error-handler';

export class PaymentService {
  private paymentRepository: PaymentRepository;

  constructor(paymentRepository: PaymentRepository) {
    this.paymentRepository = paymentRepository;
  }

  /**
   * 新しい支払いを作成する
   * @param paymentData 支払いデータ
   * @returns 作成された支払いオブジェクト
   */
  async createPayment(paymentData: Partial<PaymentModel>): Promise<PaymentModel> {
    // 入力バリデーション
    this.validatePaymentData(paymentData);

    // デフォルトステータスを設定
    paymentData.status = PaymentStatus.PENDING;

    // 支払い作成日を設定
    paymentData.createdAt = new Date();

    try {
      // リポジトリを通じて支払いを保存
      const createdPayment = await this.paymentRepository.create(paymentData);
      return createdPayment;
    } catch (error) {
      throw new Error(`支払いの作成に失敗しました: ${error.message}`);
    }
  }

  /**
   * IDに基づいて支払いを取得する
   * @param paymentId 支払いID
   * @returns 支払いオブジェクト
   */
  async getPaymentById(paymentId: string): Promise<PaymentModel> {
    try {
      const payment = await this.paymentRepository.findById(paymentId);
      
      if (!payment) {
        throw new Error('支払いが見つかりませんでした');
      }
      
      return payment;
    } catch (error) {
      throw new Error(`支払いの取得に失敗しました: ${error.message}`);
    }
  }

  /**
   * 支払いを更新する
   * @param paymentId 支払いID
   * @param updateData 更新するデータ
   * @returns 更新された支払いオブジェクト
   */
  async updatePayment(
    paymentId: string, 
    updateData: Partial<PaymentModel>
  ): Promise<PaymentModel> {
    // 入力バリデーション
    this.validatePaymentData(updateData);

    try {
      // 既存の支払いを取得
      const existingPayment = await this.getPaymentById(paymentId);

      // 更新日を設定
      updateData.updatedAt = new Date();

      // 支払いを更新
      const updatedPayment = await this.paymentRepository.update(
        paymentId, 
        { ...existingPayment, ...updateData }
      );

      return updatedPayment;
    } catch (error) {
      throw new Error(`支払いの更新に失敗しました: ${error.message}`);
    }
  }

  /**
   * 支払いのステータスを更新する
   * @param paymentId 支払いID
   * @param newStatus 新しいステータス
   * @returns 更新された支払いオブジェクト
   */
  async updatePaymentStatus(
    paymentId: string, 
    newStatus: PaymentStatus
  ): Promise<PaymentModel> {
    try {
      // 既存の支払いを取得
      const existingPayment = await this.getPaymentById(paymentId);

      // ステータス更新のビジネスルール
      this.validateStatusTransition(existingPayment.status, newStatus);

      // 支払いを更新
      const updatedPayment = await this.paymentRepository.update(paymentId, {
        ...existingPayment,
        status: newStatus,
        updatedAt: new Date()
      });

      return updatedPayment;
    } catch (error) {
      throw new Error(`支払いステータスの更新に失敗しました: ${error.message}`);
    }
  }

  /**
   * 支払いを削除する
   * @param paymentId 支払いID
   */
  async deletePayment(paymentId: string): Promise<void> {
    try {
      // 支払いの存在を確認
      await this.getPaymentById(paymentId);

      // 支払いを削除
      await this.paymentRepository.delete(paymentId);
    } catch (error) {
      throw new Error(`支払いの削除に失敗しました: ${error.message}`);
    }
  }

  /**
   * 支払いデータのバリデーション