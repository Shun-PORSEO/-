import React, { useState, useEffect } from 'react';
import { usePayment } from '../../hooks/use-payment';
import { Payment } from '@/types/payment'; // 型定義のインポート
import { useTranslation } from 'react-i18next';

const PaymentList: React.FC = () => {
  const { t } = useTranslation();
  const { fetchPayments, deletePayment } = usePayment();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPayments = async () => {
      try {
        setIsLoading(true);
        const fetchedPayments = await fetchPayments();
        setPayments(fetchedPayments);
        setIsLoading(false);
      } catch (err) {
        setError(t('payment.fetchError'));
        setIsLoading(false);
      }
    };

    loadPayments();
  }, [fetchPayments, t]);

  const handleDeletePayment = async (paymentId: string) => {
    try {
      await deletePayment(paymentId);
      setPayments(payments.filter(payment => payment.id !== paymentId));
    } catch (err) {
      setError(t('payment.deleteError'));
    }
  };

  if (isLoading) {
    return <div>{t('common.loading')}</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="payment-list">
      <h2>{t('payment.list.title')}</h2>
      {payments.length === 0 ? (
        <p>{t('payment.list.empty')}</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>{t('payment.date')}</th>
              <th>{t('payment.amount')}</th>
              <th>{t('payment.method')}</th>
              <th>{t('payment.status')}</th>
              <th>{t('common.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((payment) => (
              <tr key={payment.id}>
                <td>{new Date(payment.date).toLocaleDateString()}</td>
                <td>{payment.amount.toLocaleString()} {payment.currency}</td>
                <td>{payment.method}</td>
                <td>{payment.status}</td>
                <td>
                  <button onClick={() => handleDeletePayment(payment.id)}>
                    {t('common.delete')}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default PaymentList;