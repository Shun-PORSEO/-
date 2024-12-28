以下に、src/tests/backend/invoice-service.test.tsの実装例を示します：

```typescript
import { InvoiceService } from '../../backend/services/invoice-service';
import { InvoiceModel } from '../../backend/models/invoice-model';
import { InvoiceRepository } from '../../backend/repositories/invoice-repository';

describe('InvoiceService', () => {
  let invoiceService: InvoiceService;
  let mockInvoiceRepository: jest.Mocked<InvoiceRepository>;

  beforeEach(() => {
    // モックの作成
    mockInvoiceRepository = {
      create: jest.fn(),
      