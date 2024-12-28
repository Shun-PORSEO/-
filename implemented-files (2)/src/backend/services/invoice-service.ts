以下に、指定されたYAMLに基づいて`src/backend/services/invoice-service.ts`を実装します：

```typescript
import { Invoice } from '../models/invoice-model';
import { InvoiceRepository } from '../repositories/invoice-repository';
import { CreateInvoiceDTO, UpdateInvoiceDTO } from '../dtos/invoice-dto';

export class InvoiceService {
  private invoiceRepository: InvoiceRepository;

  constructor(invoiceRepository: InvoiceRepository) {
    this.invoiceRepository = invoiceRepository;
  }

  /**
   * 新しい請求書を作成する
   * @param createInvoiceDTO 請求書作成データ
   * @returns 作成された請求書
   */
  async createInvoice(createInvoiceDTO: CreateInvoiceDTO): Promise<Invoice> {
    // ビジネスルールのバリデーション
    this.validateCreateInvoice(createInvoiceDTO);

    // 請求書モデルの生成
    const newInvoice = new Invoice(createInvoiceDTO);

    // 請求書の保存
    return await this.invoiceRepository.save(newInvoice);
  }

  /**
   * 請求書を取得する
   * @param invoiceId 請求書ID
   * @returns 指定された請求書
   */
  async getInvoiceById(invoiceId: string): Promise<Invoice | null> {
    return await this.invoiceRepository.findById(invoiceId);
  }

  /**
   * すべての請求書を取得する
   * @param page ページ番号
   * @param limit 1ページあたりの件数
   * @returns 請求書のリスト
   */
  async getAllInvoices(page: number = 1, limit: number = 10): Promise<Invoice[]> {
    return await this.invoiceRepository.findAll(page, limit);
  }

  /**
   * 請求書を更新する
   * @param invoiceId 請求書ID
   * @param updateInvoiceDTO 更新データ
   * @returns 更新された請求書
   */
  async updateInvoice(invoiceId: string, updateInvoiceDTO: UpdateInvoiceDTO): Promise<Invoice> {
    // 既存の請求書を取得
    const existingInvoice = await this.invoiceRepository.findById(invoiceId);
    if (!existingInvoice) {
      throw new Error('請求書が見つかりません');
    }

    // ビジネスルールのバリデーション
    this.validateUpdateInvoice(existingInvoice, updateInvoiceDTO);

    // 請求書の更新
    Object.assign(existingInvoice, updateInvoiceDTO);
    return await this.invoiceRepository.update(existingInvoice);
  }

  /**
   * 請求書を削除する
   * @param invoiceId 請求書ID
   */
  async deleteInvoice(invoiceId: string): Promise<void> {
    // 削除前のバリデーション
    const existingInvoice = await this.invoiceRepository.findById(invoiceId);
    if (!existingInvoice) {
      throw new Error('請求書が見つかりません');
    }

    // 削除可能かどうかのビジネスルールチェック
    this.validateDeleteInvoice(existingInvoice);

    await this.invoiceRepository.delete(invoiceId);
  }

  /**
   * 請求書作成のバリデーション
   * @param createInvoiceDTO 請求書作成データ
   */
  private validateCreateInvoice(createInvoiceDTO: CreateInvoiceDTO): void {
    // 必須フィールドのチェック
    if (!createInvoiceDTO.clientId) {
      throw new Error('クライアントIDは必須です');
    }

    // 金額のバリデーション
    if (createInvoiceDTO.totalAmount <= 0) {
      throw new Error('請求金額は0より大きい必要があります');
    }
  }

  /**
   * 請求書更新のバリデーション
   * @param existingInvoice 既存の請求書
   * @param updateInvoiceDTO 更新データ
   */
  private validateUpdateInvoice(existingInvoice: Invoice, updateInvoiceDTO: UpdateInvoiceDTO): void {
    // 既に支払い済みの請求書は更新不可
    if (existingInvoice.status === 'PAID') {
      throw new Error('支払い済みの請求書は更新できません');
    }

    // 金額のバリデーション
    if (updateInvoiceDTO.totalAmount && updateInvoiceDTO.totalAmount <= 0) {
      throw new Error('請求金額は0より大きい必要があります');
    }
  }

  /**
   