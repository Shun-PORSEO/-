import { Request, Response } from 'express';
import { PaymentService } from '../services/payment-service';
import { PaymentModel } from '../models/payment-model';
import { validatePaymentInput } from '../utils/validation';

export class PaymentController {
  private paymentService: PaymentService;

  constructor(paymentService?: PaymentService) {
    this.paymentService = paymentService || new PaymentService();
  }

  // 支払いの作成
  async createPayment(req: Request, res: Response): Promise<Response> {
    try {
      // 入力バリデーション
      const validationError = validatePaymentInput(req.body);
      if (validationError) {
        return res.status(400).json({ 
          error: 'Invalid input', 
          details: validationError 
        });
      }

      // 支払いモデルの作成
      const paymentData: PaymentModel = {
        ...req.body,
        createdAt: new Date(),
        status: 'pending'
      };

      // 支払いサービスを通じて支払いを作成
      const createdPayment = await this.paymentService.createPayment(paymentData);

      return res.status(201).json(createdPayment);
    } catch (error) {
      console.error('Payment creation error:', error);
      return res.status(500).json({ 
        error: 'Failed to create payment', 
        message: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  }

  // 支払いの取得
  async getPayment(req: Request, res: Response): Promise<Response> {
    try {
      const paymentId = req.params.id;

      // 支払いサービスを通じて支払いを取得
      const payment = await this.paymentService.getPaymentById(paymentId);

      if (!payment) {
        return res.status(404).json({ error: 'Payment not found' });
      }

      return res.status(200).json(payment);
    } catch (error) {
      console.error('Payment retrieval error:', error);
      return res.status(500).json({ 
        error: 'Failed to retrieve payment', 
        message: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  }

  // 支払いの更新
  async updatePayment(req: Request, res: Response): Promise<Response> {
    try {
      const paymentId = req.params.id;
      const updateData = req.body;

      // 入力バリデーション
      const validationError = validatePaymentInput(updateData);
      if (validationError) {
        return res.status(400).json({ 
          error: 'Invalid input', 
          details: validationError 
        });
      }

      // 支払いサービスを通じて支払いを更新
      const updatedPayment = await this.paymentService.updatePayment(paymentId, updateData);

      if (!updatedPayment) {
        return res.status(404).json({ error: 'Payment not found' });
      }

      return res.status(200).json(updatedPayment);
    } catch (error) {
      console.error('Payment update error:', error);
      return res.status(500).json({ 
        error: 'Failed to update payment', 
        message: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  }

  // 支払いの削除
  async deletePayment(req: Request, res: Response): Promise<Response> {
    try {
      const paymentId = req.params.id;

      // 支払いサービスを通じて支払いを削除
      const deletionResult = await this.paymentService.deletePayment(paymentId);

      if (!deletionResult) {
        return res.status(404).json({ error: 'Payment not found' });
      }

      return res.status(204).send(); // No content
    } catch (error) {
      console.error('Payment deletion error:', error);
      return res.status(500).json({ 
        error: 'Failed to delete payment', 
        message: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  }
};