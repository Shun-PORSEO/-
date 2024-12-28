import React, { useState, useEffect } from 'react';
import { useInvoice } from '../../hooks/use-invoice';
import { Invoice } from '../../../backend/models/invoice-model';
import { useTranslation } from 'react-i18next';

interface InvoiceListProps {
  status?: 'all' | 'paid' | 'unpaid';
}

export const InvoiceList: React.FC<InvoiceListProps> = ({ status = 'all' }) => {
  const { t } = useTranslation();
  const { fetchInvoices } = useInvoice();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadInvoices = async () => {
      try {
        setLoading(true);
        const fetchedInvoices = await fetchInvoices(status);
        setInvoices(fetchedInvoices);
        setLoading(false);
      } catch (err) {
        setError(t('invoice.fetchError'));
        setLoading(false);
      }
    };

    loadInvoices();
  }, [status, fetchInvoices, t]);

  const renderInvoiceTable = () => {
    if (loading) {
      return <div>{t('common.loading')}</div>;
    }

    if (error) {
      return <div>{error}</div>;
    }

    if (invoices.length === 0) {
      return <div>{t('invoice.noInvoices')}</div>;
    }

    return (
      <table>
        <thead>
          <tr>
            <th>{t('invoice.number')}</th>
            <th>{t('invoice.date')}</th>
            <th>{t('invoice.amount')}</th>
            <th>{t('invoice.status')}</th>
            <th>{t('invoice.actions')}</th>
          </tr>
        </thead>
        <tbody>
          {invoices.map((invoice) => (
            <tr key={invoice.id}>
              <td>{invoice.invoiceNumber}</td>
              <td>{new Date(invoice.date).toLocaleDateString()}</td>
              <td>{invoice.totalAmount.toLocaleString()} JPY</td>
              <td>{t(`invoice.status.${invoice.status}`)}</td>
              <td>
                <button onClick={() => handleViewDetails(invoice.id)}>
                  {t('common.view')}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  const handleViewDetails = (invoiceId: string) => {
    // 請求書詳細画面への遷移ロジック
    console.log(`View details for invoice ${invoiceId}`);
  };

  return (
    <div className="invoice-list-container">
      <h2>{t('invoice.list.title')}</h2>
      <div className="invoice-list-filters">
        {/* フィルター機能の実装 */}
      </div>
      {renderInvoiceTable()}
    </div>
  );
};

export default InvoiceList;