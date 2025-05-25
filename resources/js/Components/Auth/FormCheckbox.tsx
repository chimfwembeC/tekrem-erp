import React from 'react';
import { Checkbox } from '@/Components/ui/checkbox';
import { Label } from '@/Components/ui/label';
import { cn } from '@/lib/utils';

interface FormCheckboxProps {
  id?: string;
  label?: string;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  name?: string;
  className?: string;
  labelClassName?: string;
  wrapperClassName?: string;
  disabled?: boolean;
}

export default function FormCheckbox({
  id,
  label,
  checked,
  onChange,
  name,
  className,
  labelClassName,
  wrapperClassName,
  disabled,
}: FormCheckboxProps) {
  const checkboxId = id || Math.random().toString(36).substring(2, 9);

  return (
    <div className={cn("flex items-center space-x-2", wrapperClassName)}>
      <Checkbox
        id={checkboxId}
        checked={checked}
        onCheckedChange={onChange}
        name={name}
        className={className}
        disabled={disabled}
      />
      {label && (
        <Label
          htmlFor={checkboxId}
          className={cn("text-sm font-medium cursor-pointer", labelClassName)}
        >
          {label}
        </Label>
      )}
    </div>
  );
}
