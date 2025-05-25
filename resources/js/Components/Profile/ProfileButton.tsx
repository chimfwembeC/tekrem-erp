import React, { ButtonHTMLAttributes } from 'react';
import { Button } from '@/Components/ui/button';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  isLoading?: boolean;
  loadingText?: string;
}

export default function ProfileButton({
  children,
  variant = 'default',
  isLoading,
  loadingText,
  className,
  disabled,
  ...props
}: Props) {
  return (
    <Button
      variant={variant}
      className={cn(className)}
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {loadingText || 'Please wait'}
        </>
      ) : (
        children
      )}
    </Button>
  );
}
