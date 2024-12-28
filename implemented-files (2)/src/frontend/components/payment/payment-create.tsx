以下に、指定されたYAMLに基づいたsrc/frontend/components/payment/payment-create.tsxの実装を提示します：

```typescript
import React, { useState } from 'react';
import { usePayment } from '../../hooks/use-payment';
import { useTranslation } from 'react-i18next';

interface PaymentCreateProps {
  invoiceId?: string;
}

export const PaymentCreate: React.FC<PaymentCreateProps> =