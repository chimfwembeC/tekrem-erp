import React, { PropsWithChildren } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/Components/ui/card';
import ApplicationLogo from '@/Components/ApplicationLogo';

interface AuthCardProps {
  title?: string;
  description?: string;
  footer?: React.ReactNode;
}

export default function AuthCard({
  children,
  title,
  description,
  footer,
}: PropsWithChildren<AuthCardProps>) {
  return (
    <div className="min-h-screen flex flex-col sm:justify-center items-center pt-6 sm:pt-0 bg-muted/40">
      <div className="mb-6">
        <ApplicationLogo className="w-20 h-20" />
      </div>

      <Card className="w-full sm:max-w-md">
        {(title || description) && (
          <CardHeader>
            {title && <CardTitle>{title}</CardTitle>}
            {description && <CardDescription>{description}</CardDescription>}
          </CardHeader>
        )}
        <CardContent>
          {children}
        </CardContent>
        {footer && (
          <CardFooter>
            {footer}
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
