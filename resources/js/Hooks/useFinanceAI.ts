import { useState } from 'react';
import { router } from '@inertiajs/react';
import { toast } from 'sonner';

interface TransactionSuggestions {
  category?: {
    category: string;
    confidence: number;
    reasoning: string;
  };
  enhanced_description?: string;
  duplicate_check?: {
    is_duplicate: boolean;
    confidence: number;
    similar_transactions: number[];
    reasoning: string;
  };
}

interface ExpenseData {
  title: string;
  description: string;
  amount: number;
  vendor: string;
  expense_date: string;
  suggested_category?: string;
  items: Array<{
    description: string;
    amount: number;
  }>;
  tax_amount: number;
  confidence: number;
}

interface InvoiceItems {
  items: Array<{
    description: string;
    quantity: number;
    unit_price: number;
  }>;
  notes: string;
  total_estimated: number;
}

export default function useFinanceAI() {
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<TransactionSuggestions | null>(null);

  const getTransactionSuggestions = async (data: {
    description: string;
    amount?: number;
    vendor?: string;
    date?: string;
  }): Promise<TransactionSuggestions | null> => {
    setLoading(true);
    
    try {
      const response = await fetch(route('finance.transactions.ai-suggestions'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        setSuggestions(result.suggestions);
        return result.suggestions;
      } else {
        toast.error('Failed to get AI suggestions');
        return null;
      }
    } catch (error) {
      console.error('Error getting AI suggestions:', error);
      toast.error('Error getting AI suggestions');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const processReceipt = async (receiptText: string): Promise<ExpenseData | null> => {
    setLoading(true);
    
    try {
      const response = await fetch(route('finance.expenses.process-receipt'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
        body: JSON.stringify({ receipt_text: receiptText }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Receipt processed successfully!');
        return result.expense_data;
      } else {
        toast.error(result.message || 'Failed to process receipt');
        return null;
      }
    } catch (error) {
      console.error('Error processing receipt:', error);
      toast.error('Error processing receipt');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const generateInvoiceItems = async (data: {
    project_description: string;
    estimated_value?: number;
  }): Promise<InvoiceItems | null> => {
    setLoading(true);
    
    try {
      const response = await fetch(route('finance.invoices.generate-items'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Invoice items generated successfully!');
        return {
          items: result.items,
          notes: result.notes,
          total_estimated: result.total_estimated,
        };
      } else {
        toast.error(result.message || 'Failed to generate invoice items');
        return null;
      }
    } catch (error) {
      console.error('Error generating invoice items:', error);
      toast.error('Error generating invoice items');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const clearSuggestions = () => {
    setSuggestions(null);
  };

  return {
    loading,
    suggestions,
    getTransactionSuggestions,
    processReceipt,
    generateInvoiceItems,
    clearSuggestions,
  };
}
