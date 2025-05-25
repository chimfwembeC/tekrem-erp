import React, { PropsWithChildren } from 'react';
import { Button, ButtonProps } from '@/Components/ui/button';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface AuthButtonProps extends ButtonProps {
  isLoading?: boolean;
  loadingText?: string;
}

export default function AuthButton({
  children,
  isLoading,
  loadingText = 'Please wait',
  className,
  disabled,
  ...props
}: PropsWithChildren<AuthButtonProps>) {
  return (
    <Button
      className={cn("w-full", className)}
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {loadingText}
        </>
      ) : (
        children
      )}
    </Button>
  );
}
