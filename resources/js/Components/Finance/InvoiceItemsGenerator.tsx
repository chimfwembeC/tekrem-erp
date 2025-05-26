import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Textarea } from '@/Components/ui/textarea';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Alert, AlertDescription } from '@/Components/ui/alert';
import {
  Bot,
  Sparkles,
  CheckCircle,
  AlertCircle,
  Copy,
  X,
  Calculator,
  FileText,
} from 'lucide-react';
import useTranslate from '@/Hooks/useTranslate';
import useFinanceAI from '@/Hooks/useFinanceAI';

interface InvoiceItem {
  description: string;
  quantity: number;
  unit_price: number;
}

interface InvoiceItems {
  items: InvoiceItem[];
  notes: string;
  total_estimated: number;
}

interface Props {
  onItemsGenerated: (items: InvoiceItem[], notes: string) => void;
  onClose: () => void;
}

export default function InvoiceItemsGenerator({ onItemsGenerated, onClose }: Props) {
  const { t } = useTranslate();
  const { generateInvoiceItems, loading } = useFinanceAI();
  const [projectDescription, setProjectDescription] = useState('');
  const [estimatedValue, setEstimatedValue] = useState('');
  const [generatedItems, setGeneratedItems] = useState<InvoiceItems | null>(null);

  const handleGenerateItems = async () => {
    if (!projectDescription.trim()) {
      return;
    }

    const result = await generateInvoiceItems({
      project_description: projectDescription,
      estimated_value: estimatedValue ? parseFloat(estimatedValue) : undefined,
    });

    if (result) {
      setGeneratedItems(result);
    }
  };

  const handleApplyItems = () => {
    if (generatedItems) {
      onItemsGenerated(generatedItems.items, generatedItems.notes);
      onClose();
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <Card className="border-green-200 bg-green-50/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-green-600" />
            <CardTitle className="text-green-700">AI Invoice Items Generator</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-6 w-6 p-0 text-green-600 hover:text-green-800"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <CardDescription>
          Generate professional invoice line items based on your project description
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!generatedItems ? (
          <>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="project-description">Project Description *</Label>
                <Textarea
                  id="project-description"
                  placeholder="Describe your project or service in detail..."
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                  rows={4}
                  className="resize-none"
                />
                <p className="text-xs text-muted-foreground">
                  Be specific about the services, deliverables, and scope of work
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="estimated-value">Estimated Total Value (Optional)</Label>
                <Input
                  id="estimated-value"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={estimatedValue}
                  onChange={(e) => setEstimatedValue(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Helps AI generate more accurate pricing
                </p>
              </div>
            </div>

            <Button
              onClick={handleGenerateItems}
              disabled={!projectDescription.trim() || loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                  Generating Items...
                </>
              ) : (
                <>
                  <Calculator className="h-4 w-4 mr-2" />
                  Generate Invoice Items
                </>
              )}
            </Button>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm">
                AI will break down your project into professional invoice line items with suggested quantities and pricing.
              </AlertDescription>
            </Alert>
          </>
        ) : (
          <>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="font-medium">Invoice Items Generated</span>
              </div>

              <div className="bg-white rounded-lg p-4 border space-y-4">
                <div className="space-y-3">
                  <h4 className="font-medium text-sm">Line Items</h4>
                  {generatedItems.items.map((item, index) => (
                    <div key={index} className="grid grid-cols-12 gap-2 items-center text-sm border-b pb-2">
                      <div className="col-span-6">
                        <p className="font-medium">{item.description}</p>
                      </div>
                      <div className="col-span-2 text-center">
                        <p>{item.quantity}</p>
                      </div>
                      <div className="col-span-2 text-right">
                        <p>{formatCurrency(item.unit_price)}</p>
                      </div>
                      <div className="col-span-2 text-right">
                        <p className="font-medium">{formatCurrency(item.quantity * item.unit_price)}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-3">
                  <div className="flex justify-between items-center font-medium">
                    <span>Total Estimated:</span>
                    <span className="text-lg">{formatCurrency(generatedItems.total_estimated)}</span>
                  </div>
                </div>

                {generatedItems.notes && (
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Suggested Notes</Label>
                    <div className="bg-gray-50 rounded p-3">
                      <p className="text-sm">{generatedItems.notes}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Button onClick={handleApplyItems} className="flex-1">
                  <Copy className="h-4 w-4 mr-2" />
                  Apply to Invoice
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setGeneratedItems(null)}
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
