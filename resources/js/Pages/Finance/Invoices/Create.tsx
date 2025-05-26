import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/Components/ui/select';
import {
  ArrowLeft,
  Plus,
  Trash2,
  FileText,
  User,
  Calendar,
  DollarSign,
  Calculator,
  Bot
} from 'lucide-react';
import useTranslate from '@/Hooks/useTranslate';
import InvoiceItemsGenerator from '@/Components/Finance/InvoiceItemsGenerator';
import { toast } from 'sonner';

interface Client {
  id: number;
  name: string;
  email: string;
}

interface Lead {
  id: number;
  name: string;
  email: string;
}

interface InvoiceItem {
  description: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

interface Props {
  clients?: Client[];
  leads?: Lead[];
  currencies?: Record<string, string>;
  statuses?: Record<string, string>;
}

export default function Create({ clients = [], leads = [], currencies = {}, statuses = {} }: Props) {
  const { t } = useTranslate();
  const [items, setItems] = useState<InvoiceItem[]>([
    { description: '', quantity: 1, unit_price: 0, total_price: 0 }
  ]);
  const [showItemsGenerator, setShowItemsGenerator] = useState(false);

  const { data, setData, post, processing, errors } = useForm({
    billable_type: '',
    billable_id: '',
    issue_date: new Date().toISOString().split('T')[0],
    due_date: '',
    currency: 'USD',
    status: 'draft',
    notes: '',
    terms: '',
    tax_rate: 0,
    discount_amount: 0,
    items: items,
  });

  const addItem = () => {
    setItems([...items, { description: '', quantity: 1, unit_price: 0, total_price: 0 }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      const newItems = items.filter((_, i) => i !== index);
      setItems(newItems);
      setData('items', newItems);
    }
  };

  const updateItem = (index: number, field: keyof InvoiceItem, value: string | number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };

    // Calculate total price for the item
    if (field === 'quantity' || field === 'unit_price') {
      newItems[index].total_price = newItems[index].quantity * newItems[index].unit_price;
    }

    setItems(newItems);
    setData('items', newItems);
  };

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + item.total_price, 0);
  };

  const calculateTaxAmount = () => {
    return (calculateSubtotal() * data.tax_rate) / 100;
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTaxAmount() - data.discount_amount;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Update items in form data
    const formData = {
      ...data,
      items: items,
      subtotal: calculateSubtotal(),
      tax_amount: calculateTaxAmount(),
      total_amount: calculateTotal(),
    };

    post(route('finance.invoices.store'), {
      data: formData,
      onSuccess: () => {
        toast.success(t('finance.invoice_created', 'Invoice created successfully'));
      },
      onError: () => {
        toast.error(t('common.error_occurred', 'An error occurred'));
      },
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: data.currency,
    }).format(amount);
  };

  const handleItemsGenerated = (generatedItems: any[], notes: string) => {
    const newItems = generatedItems.map(item => ({
      description: item.description,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total_price: item.quantity * item.unit_price,
    }));

    setItems(newItems);
    setData('items', newItems);

    if (notes && !data.notes) {
      setData('notes', notes);
    }

    toast.success('Invoice items generated successfully!');
  };

  return (
    <AppLayout
      title={t('finance.create_invoice', 'Create Invoice')}
      breadcrumbs={[
        { label: t('finance.title', 'Finance'), href: '/finance' },
        { label: t('finance.invoices', 'Invoices'), href: '/finance/invoices' },
        { label: t('finance.create_invoice', 'Create Invoice') },
      ]}
    >
      <Head title={t('finance.create_invoice', 'Create Invoice')} />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href={route('finance.invoices.index')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('common.back', 'Back')}
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {t('finance.create_invoice', 'Create Invoice')}
            </h1>
            <p className="text-muted-foreground">
              {t('finance.create_invoice_description', 'Create a new invoice for your client')}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Invoice Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  {t('finance.invoice_details', 'Invoice Details')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="issue_date">
                      {t('finance.issue_date', 'Issue Date')} *
                    </Label>
                    <Input
                      id="issue_date"
                      type="date"
                      value={data.issue_date}
                      onChange={(e) => setData('issue_date', e.target.value)}
                      required
                    />
                    {errors.issue_date && (
                      <p className="text-sm text-red-600">{errors.issue_date}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="due_date">
                      {t('finance.due_date', 'Due Date')} *
                    </Label>
                    <Input
                      id="due_date"
                      type="date"
                      value={data.due_date}
                      onChange={(e) => setData('due_date', e.target.value)}
                      required
                    />
                    {errors.due_date && (
                      <p className="text-sm text-red-600">{errors.due_date}</p>
                    )}
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="currency">
                      {t('finance.currency', 'Currency')} *
                    </Label>
                    <Select value={data.currency} onValueChange={(value) => setData('currency', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(currencies || {}).map(([code, name]) => (
                          <SelectItem key={code} value={code}>
                            {code} - {name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.currency && (
                      <p className="text-sm text-red-600">{errors.currency}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="status">
                      {t('common.status', 'Status')} *
                    </Label>
                    <Select value={data.status} onValueChange={(value) => setData('status', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(statuses || {}).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.status && (
                      <p className="text-sm text-red-600">{errors.status}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Client Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  {t('finance.client_details', 'Client Details')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="billable_type">
                    {t('finance.client_type', 'Client Type')} *
                  </Label>
                  <Select
                    value={data.billable_type}
                    onValueChange={(value) => {
                      setData('billable_type', value);
                      setData('billable_id', '');
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('finance.select_client_type', 'Select client type')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="client">{t('crm.client', 'Client')}</SelectItem>
                      <SelectItem value="lead">{t('crm.lead', 'Lead')}</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.billable_type && (
                    <p className="text-sm text-red-600">{errors.billable_type}</p>
                  )}
                </div>

                {data.billable_type && (
                  <div className="space-y-2">
                    <Label htmlFor="billable_id">
                      {data.billable_type === 'client' ? t('crm.client', 'Client') : t('crm.lead', 'Lead')} *
                    </Label>
                    <Select value={data.billable_id} onValueChange={(value) => setData('billable_id', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder={`Select ${data.billable_type}`} />
                      </SelectTrigger>
                      <SelectContent>
                        {(data.billable_type === 'client' ? clients : leads)?.map((item) => (
                          <SelectItem key={item.id} value={item.id.toString()}>
                            <div>
                              <p className="font-medium">{item.name}</p>
                              <p className="text-xs text-muted-foreground">{item.email}</p>
                            </div>
                          </SelectItem>
                        )) || []}
                      </SelectContent>
                    </Select>
                    {errors.billable_id && (
                      <p className="text-sm text-red-600">{errors.billable_id}</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Invoice Items */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="h-4 w-4" />
                    {t('finance.invoice_items', 'Invoice Items')}
                  </CardTitle>
                  <CardDescription>
                    {t('finance.add_items_description', 'Add items or services to your invoice')}
                  </CardDescription>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowItemsGenerator(true)}
                  className="text-green-600 border-green-200 hover:bg-green-50"
                >
                  <Bot className="h-4 w-4 mr-1" />
                  Generate with AI
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* AI Items Generator */}
              {showItemsGenerator && (
                <InvoiceItemsGenerator
                  onItemsGenerated={handleItemsGenerated}
                  onClose={() => setShowItemsGenerator(false)}
                />
              )}
              {items.map((item, index) => (
                <div key={index} className="grid gap-4 md:grid-cols-12 items-end p-4 border rounded-lg">
                  <div className="md:col-span-5 space-y-2">
                    <Label htmlFor={`description-${index}`}>
                      {t('finance.description', 'Description')}
                    </Label>
                    <Input
                      id={`description-${index}`}
                      placeholder={t('finance.item_description', 'Item description')}
                      value={item.description}
                      onChange={(e) => updateItem(index, 'description', e.target.value)}
                    />
                  </div>

                  <div className="md:col-span-2 space-y-2">
                    <Label htmlFor={`quantity-${index}`}>
                      {t('finance.quantity', 'Quantity')}
                    </Label>
                    <Input
                      id={`quantity-${index}`}
                      type="number"
                      min="1"
                      step="1"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                    />
                  </div>

                  <div className="md:col-span-2 space-y-2">
                    <Label htmlFor={`unit_price-${index}`}>
                      {t('finance.unit_price', 'Unit Price')}
                    </Label>
                    <Input
                      id={`unit_price-${index}`}
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.unit_price}
                      onChange={(e) => updateItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                    />
                  </div>

                  <div className="md:col-span-2 space-y-2">
                    <Label>{t('finance.total', 'Total')}</Label>
                    <div className="h-10 px-3 py-2 border rounded-md bg-muted flex items-center">
                      {formatCurrency(item.total_price)}
                    </div>
                  </div>

                  <div className="md:col-span-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeItem(index)}
                      disabled={items.length === 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}

              <Button type="button" variant="outline" onClick={addItem}>
                <Plus className="h-4 w-4 mr-2" />
                {t('finance.add_item', 'Add Item')}
              </Button>
            </CardContent>
          </Card>

          {/* Totals and Additional Info */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Additional Information */}
            <Card>
              <CardHeader>
                <CardTitle>{t('finance.additional_information', 'Additional Information')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="notes">
                    {t('finance.notes', 'Notes')}
                  </Label>
                  <Textarea
                    id="notes"
                    placeholder={t('finance.invoice_notes_placeholder', 'Add any notes for the client...')}
                    value={data.notes}
                    onChange={(e) => setData('notes', e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="terms">
                    {t('finance.terms', 'Terms & Conditions')}
                  </Label>
                  <Textarea
                    id="terms"
                    placeholder={t('finance.terms_placeholder', 'Payment terms and conditions...')}
                    value={data.terms}
                    onChange={(e) => setData('terms', e.target.value)}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Invoice Totals */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  {t('finance.invoice_totals', 'Invoice Totals')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="tax_rate">
                      {t('finance.tax_rate', 'Tax Rate (%)')}
                    </Label>
                    <Input
                      id="tax_rate"
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      value={data.tax_rate}
                      onChange={(e) => setData('tax_rate', parseFloat(e.target.value) || 0)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="discount_amount">
                      {t('finance.discount_amount', 'Discount Amount')}
                    </Label>
                    <Input
                      id="discount_amount"
                      type="number"
                      min="0"
                      step="0.01"
                      value={data.discount_amount}
                      onChange={(e) => setData('discount_amount', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </div>

                <div className="space-y-3 pt-4 border-t">
                  <div className="flex justify-between">
                    <span>{t('finance.subtotal', 'Subtotal')}:</span>
                    <span className="font-medium">{formatCurrency(calculateSubtotal())}</span>
                  </div>

                  {data.tax_rate > 0 && (
                    <div className="flex justify-between">
                      <span>{t('finance.tax', 'Tax')} ({data.tax_rate}%):</span>
                      <span className="font-medium">{formatCurrency(calculateTaxAmount())}</span>
                    </div>
                  )}

                  {data.discount_amount > 0 && (
                    <div className="flex justify-between">
                      <span>{t('finance.discount', 'Discount')}:</span>
                      <span className="font-medium">-{formatCurrency(data.discount_amount)}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-lg font-bold pt-2 border-t">
                    <span>{t('finance.total', 'Total')}:</span>
                    <span>{formatCurrency(calculateTotal())}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" asChild>
              <Link href={route('finance.invoices.index')}>
                {t('common.cancel', 'Cancel')}
              </Link>
            </Button>
            <Button type="submit" disabled={processing}>
              {processing ? t('common.saving', 'Saving...') : t('finance.create_invoice', 'Create Invoice')}
            </Button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
