import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Textarea } from '@/Components/ui/textarea';
import { Label } from '@/Components/ui/label';
import { Badge } from '@/Components/ui/badge';
import { Alert, AlertDescription } from '@/Components/ui/alert';
import {
  Bot,
  Upload,
  FileText,
  Sparkles,
  CheckCircle,
  AlertCircle,
  Copy,
  X,
} from 'lucide-react';
import useTranslate from '@/Hooks/useTranslate';
import useFinanceAI from '@/Hooks/useFinanceAI';

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

interface Props {
  onExpenseDataExtracted: (data: ExpenseData) => void;
  onClose: () => void;
}

export default function ReceiptProcessor({ onExpenseDataExtracted, onClose }: Props) {
  const { t } = useTranslate();
  const { processReceipt, loading } = useFinanceAI();
  const [receiptText, setReceiptText] = useState('');
  const [extractedData, setExtractedData] = useState<ExpenseData | null>(null);

  const handleProcessReceipt = async () => {
    if (!receiptText.trim()) {
      return;
    }

    const result = await processReceipt(receiptText);
    if (result) {
      setExtractedData(result);
    }
  };

  const handleApplyData = () => {
    if (extractedData) {
      onExpenseDataExtracted(extractedData);
      onClose();
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'bg-green-100 text-green-800';
    if (confidence >= 0.6) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getConfidenceText = (confidence: number) => {
    if (confidence >= 0.8) return 'High';
    if (confidence >= 0.6) return 'Medium';
    return 'Low';
  };

  return (
    <Card className="border-purple-200 bg-purple-50/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-purple-600" />
            <CardTitle className="text-purple-700">AI Receipt Processor</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-6 w-6 p-0 text-purple-600 hover:text-purple-800"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <CardDescription>
          Extract expense information from receipt text using AI
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!extractedData ? (
          <>
            <div className="space-y-2">
              <Label htmlFor="receipt-text">Receipt Text</Label>
              <Textarea
                id="receipt-text"
                placeholder="Paste or type the text from your receipt here..."
                value={receiptText}
                onChange={(e) => setReceiptText(e.target.value)}
                rows={6}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground">
                You can copy text from a digital receipt or type the information manually
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                onClick={handleProcessReceipt}
                disabled={!receiptText.trim() || loading}
                className="flex-1"
              >
                {loading ? (
                  <>
                    <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4 mr-2" />
                    Process Receipt
                  </>
                )}
              </Button>
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm">
                The AI will extract vendor name, amount, date, and other expense details from your receipt text.
              </AlertDescription>
            </Alert>
          </>
        ) : (
          <>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="font-medium">Expense Data Extracted</span>
                <Badge className={getConfidenceColor(extractedData.confidence)} variant="secondary">
                  {getConfidenceText(extractedData.confidence)} ({Math.round(extractedData.confidence * 100)}%)
                </Badge>
              </div>

              <div className="bg-white rounded-lg p-4 border space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-muted-foreground">Title</Label>
                    <p className="font-medium">{extractedData.title}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Amount</Label>
                    <p className="font-medium">${extractedData.amount.toFixed(2)}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Vendor</Label>
                    <p className="font-medium">{extractedData.vendor || 'Not specified'}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Date</Label>
                    <p className="font-medium">{extractedData.expense_date}</p>
                  </div>
                </div>

                {extractedData.description && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Description</Label>
                    <p className="text-sm">{extractedData.description}</p>
                  </div>
                )}

                {extractedData.suggested_category && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Suggested Category</Label>
                    <p className="text-sm">{extractedData.suggested_category}</p>
                  </div>
                )}

                {extractedData.items && extractedData.items.length > 0 && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Items</Label>
                    <div className="space-y-1">
                      {extractedData.items.map((item, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span>{item.description}</span>
                          <span>${item.amount.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {extractedData.tax_amount > 0 && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Tax Amount</Label>
                    <p className="text-sm">${extractedData.tax_amount.toFixed(2)}</p>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Button onClick={handleApplyData} className="flex-1">
                  <Copy className="h-4 w-4 mr-2" />
                  Apply to Form
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setExtractedData(null)}
                >
                  Try Again
                </Button>
              </div>
            </div>
          </>
        )}

        <div className="text-xs text-muted-foreground text-center pt-2 border-t">
          Powered by Mistral AI
        </div>
      </CardContent>
    </Card>
  );
}
