import React, { PropsWithChildren } from 'react';
import { Link } from '@inertiajs/react';
import { cn } from '@/lib/utils';

interface LinkButtonProps {
  href: string;
  className?: string;
}

export default function LinkButton({
  children,
  href,
  className,
}: PropsWithChildren<LinkButtonProps>) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex text-sm text-muted-foreground hover:text-primary underline underline-offset-4 transition-colors",
        className
      )}
    >
      {children}
    </Link>
  );
}
