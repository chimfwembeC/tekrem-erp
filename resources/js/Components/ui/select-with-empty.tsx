import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';

interface SelectWithEmptyProps {
  value?: string | number | null;
  onValueChange: (value: string | undefined) => void;
  placeholder?: string;
  emptyLabel?: string;
  emptyValue?: string;
  children: React.ReactNode;
  disabled?: boolean;
  className?: string;
}

/**
 * A Select component that properly handles empty/null values
 * 
 * This component solves the common issue where Select components need to handle
 * "no selection" states without using invalid placeholder values like "empty".
 * 
 * Usage:
 * <SelectWithEmpty
 *   value={data.client_id}
 *   onValueChange={(value) => setData('client_id', value || '')}
 *   placeholder="Select a client"
 *   emptyLabel="No client"
 * >
 *   {clients.map(client => (
 *     <SelectItem key={client.id} value={client.id.toString()}>
 *       {client.name}
 *     </SelectItem>
 *   ))}
 * </SelectWithEmpty>
 */
export default function SelectWithEmpty({
  value,
  onValueChange,
  placeholder,
  emptyLabel = "None",
  emptyValue = "",
  children,
  disabled = false,
  className,
}: SelectWithEmptyProps) {
  // Convert value to string for Select component, handling null/undefined
  const selectValue = value ? value.toString() : undefined;

  const handleValueChange = (newValue: string) => {
    // If the empty value is selected, pass undefined to the parent
    if (newValue === emptyValue) {
      onValueChange(undefined);
    } else {
      onValueChange(newValue);
    }
  };

  return (
    <Select 
      value={selectValue} 
      onValueChange={handleValueChange}
      disabled={disabled}
    >
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={emptyValue}>{emptyLabel}</SelectItem>
        {children}
      </SelectContent>
    </Select>
  );
}
