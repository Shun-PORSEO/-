以下に、指定された構造に基づいたinvoice-controller.tsの実装例を示します：

```typescript
import { Request, Response } from 'express';
import { InvoiceService } from '../services/invoice-service';
import { Invoice } from '../models/invoice-model';

export class InvoiceController {
  private invoiceService: InvoiceService;

  constructor(invoiceService: InvoiceService) {
    this.invoiceService = invoiceService;
  }

  // 請求書の作成
  async createInvoice(req: Request, res: Response): Promise<Response> {
    try {
      const invoiceData: Invoice = req.body;
      
      // 入力バリデーション
      if (!this.validateInvoiceData(invoiceData)) {
        return res.status(400).json({ 
          error: 'Invalid invoice data',
          message: 'Please provide all required fields'
        });
      }

      // 請求書の作成
      const createdInvoice = await this.invoiceService.createInvoice(invoiceData);
      
      return res.status(201).json(createdInvoice);
    } catch (error) {
      console.error('Error creating invoice:', error);
      return res.status(500).json({ 
        error: 'Internal Server Error',
        message: 'Unable to create invoice'
      });
    }
  }

  // 請求書の取得（ID指定）
  async getInvoiceById(req: Request, res: Response): Promise<Response> {
    try {
      const invoiceId = req.params.id;
      
      if (!invoiceId) {
        return res.status(400).json({ 
          error: 'Bad Request',
          message: 'Invoice ID is required'
        });
      }

      const invoice = await this.invoiceService.getInvoiceById(invoiceId);
      
      if (!invoice) {
        return res.status(404).json({ 
          error: 'Not Found',
          message: 'Invoice not found'
        });
      }

      return res.status(200).json(invoice);
    } catch (error) {
      console.error('Error fetching invoice:', error);
      return res.status(500).json({ 
        error: 'Internal Server Error',
        message: 'Unable to retrieve invoice'
      });
    }
  }

  // 請求書の更新
  async updateInvoice(req: Request, res: Response): Promise<Response> {
    try {
      const invoiceId = req.params.id;
      const updateData: Partial<Invoice> = req.body;

      if (!invoiceId) {
        return res.status(400).json({ 
          error: 'Bad Request',
          message: 'Invoice ID is required'
        });
      }

      // 入力バリデーション
      if (!this.validateUpdateData(updateData)) {
        return res.status(400).json({ 
          error: 'Invalid Update Data',
          message: 'Invalid fields for update'
        });
      }

      const updatedInvoice = await this.invoiceService.updateInvoice(invoiceId, updateData);
      
      if (!updatedInvoice) {
        return res.status(404).json({ 
          error: 'Not Found',
          message: 'Invoice not found'
        });
      }

      return res.status(200).json(updatedInvoice);
    } catch (error) {
      console.error('Error updating invoice:', error);
      return res.status(500).json({ 
        error: 'Internal Server Error',
        message: 'Unable to update invoice'
      });
    }
  }

  // 請求書の削除
  async deleteInvoice(req: Request, res: Response): Promise<Response> {
    try {
      const invoiceId = req.params.id;
      
      if (!invoiceId) {
        return res.status(400).json({ 
          error: 'Bad Request',
          message: 'Invoice ID is required'
        });
      }

      const deleteResult = await this.invoiceService.deleteInvoice(invoiceId);
      
      if (!deleteResult) {
        return res.status(404).json({ 
          error: 'Not Found',
          message: 'Invoice not found'
        });
      }

      return res.status(204).send(); // No content
    } catch (error) {
      console.error('Error deleting invoice:', error);
      return res.status(500).json({ 
        error: 'Internal Server Error',
        message: 'Unable to delete invoice'
      });
    }
  }

  // 請求書一覧の取得
  async getAllInvoices(req: Request, res: Response): Promise<Response> {
    try {
      // クエリパラメータからページネーションやフィルタリングの情報を取得
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const invoices = await this.invoiceService.getAllInvoices(page, limit);
      
      return res.status(200).json(invoices);
    } catch (error) {
      console.error('Error fetching invoices:', error);
      return res.status(500).json({ 