以下に、src/tests/backend/payment-service.test.tsの実装を提示します：

```typescript
import { PaymentService } from '../../backend/services/payment-service';
import { PaymentModel } from '../../backend/models/payment-model';
import { PaymentRepository } from '../../backend/repositories/payment-repository';

describe('PaymentService', () => {
  let paymentService: PaymentService;
  let mockPaymentRepository: jest.Mocked<PaymentRepository>;

  beforeEach(() => {
    mockPaymentRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    paymentService = new PaymentService(mockPaymentRepository);
  });

  describe('createPayment', () => {
    it('should create a new payment successfully', async () => {
      const paymentData: PaymentModel = {
        id: '1',
        amount: 1000,
        invoiceId: '