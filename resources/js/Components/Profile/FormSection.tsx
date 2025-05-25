import React, { PropsWithChildren } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/Components/ui/card';

interface Props {
  title: string;
  description: string;
  onSubmit: (e: React.FormEvent) => void;
  renderActions?: () => React.ReactNode;
}

export default function FormSection({
  title,
  description,
  onSubmit,
  renderActions,
  children,
}: PropsWithChildren<Props>) {
  return (
    <div className="md:grid md:grid-cols-3 md:gap-6">
      <div className="md:col-span-1">
        <div className="px-4 sm:px-0">
          <h3 className="text-lg font-medium text-foreground">{title}</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {description}
          </p>
        </div>
      </div>

      <div className="mt-5 md:mt-0 md:col-span-2">
        <Card>
          <form onSubmit={onSubmit}>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-6 gap-6">
                {children}
              </div>
            </CardContent>

            {renderActions && (
              <CardFooter className="flex items-center justify-end px-6 py-3 bg-muted/30 border-t text-right">
                {renderActions()}
              </CardFooter>
            )}
          </form>
        </Card>
      </div>
    </div>
  );
}
