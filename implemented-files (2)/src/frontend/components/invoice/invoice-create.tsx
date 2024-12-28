/**
 * 請求書作成コンポーネント
 * 顧客情報と請求書詳細を入力して新規請求書を作成する
 */

```typescript
import React, { useState, useCallback } from 'react';
import { useForm } from 'src/frontend/hooks/useForm';
import { useInvoiceCreate } from 'src/frontend/hooks/useInvoiceCreate';
import { InvoiceValidation } from 'src/frontend/utils/validation';
import { 
  Button, 
  Form, 
  Input, 
  Select, 
  DatePicker, 
  notification 
} from 'antd';
import { useTranslation } from 'react-i18next';

interface InvoiceFormValues {
  customerId: string;
  invoiceNumber: string;
  issueDate: Date;
  dueDate: Date;
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
  }>;
  totalAmount: number;
  status: string;
}

interface InvoiceCreateProps {
  customerId?: string;
  onCreateSuccess?: () => void;
}

export const InvoiceCreate: React.FC<InvoiceCreateProps> = ({ 
  customerId, 
  onCreateSuccess 
}) => {
  const { t } = useTranslation('invoice');
  const { createInvoice, isLoading } = useInvoiceCreate();
  
  const initialState: InvoiceFormValues = {
    customerId: customerId || '',
    invoiceNumber: '',
    issueDate: new Date(),
    dueDate: new Date(),
    items: [{ description: '', quantity: 1, unitPrice: 0 }],
    totalAmount: 0,
    status: 'draft'
  };

  const validate = useCallback((values: InvoiceFormValues) => {
    const errors: Record<string, string> = {};
    
    if (!values.customerId) {
      errors.customerId = t('validation.customerRequired');
    }
    
    if (!values.invoiceNumber) {
      errors.invoiceNumber = t('validation.invoiceNumberRequired');
    }
    
    const validationResult = InvoiceValidation.create(values);
    if (!validationResult.isValid) {
      Object.assign(errors, validationResult.errors);
    }
    
    return errors;
  }, [t]);

  const onSubmit = useCallback(async (values) => {
    try {
      const result = await createInvoice(values);
      
      notification.success({
        message: t('notification.createSuccess'),
        description: t('notification.invoiceCreated')
      });
      
      onCreateSuccess?.();
    } catch (error) {
      notification.error({
        message: t('notification.createError'),
        description: error.message
      });
    }
  }, [createInvoice, onCreateSuccess, t]);

  const { 
    values, 
    errors, 
    handleChange, 
    handleSubmit 
  } = useForm<InvoiceFormValues>(initialState, validate, onSubmit);

  const handleAddItem = () => {
    const newItem = { description: '', quantity: 1, unitPrice: 0 };
    handleChange('items', [...values.items, newItem]);
  };

  const handleRemoveItem = (index: number) => {
    const updatedItems = values.items.filter((_, i) => i !== index);
    handleChange('items', updatedItems);
  };

  return (
    <Form onFinish={handleSubmit}>
      <Select
        name="customerId"
        value={values.customerId}
        onChange={(value: string) => handleChange('customerId', value)}
        placeholder={t('form.selectCustomer')}
        status={errors.customerId ? 'error' : ''}
        help={errors.customerId}
      />
      
      <Input
        name="invoiceNumber"
        value={values.invoiceNumber}
        onChange={(e) => handleChange('invoiceNumber', e.target.value)}
        placeholder={t('form.invoiceNumber')}
        status={errors.invoiceNumber ? 'error' : ''}
      />
      
      {/* ... rest of the form ... */}
    </Form>
  );
};