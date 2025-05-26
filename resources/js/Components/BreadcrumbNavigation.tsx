import React from 'react';
import { Link } from '@inertiajs/react';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/Components/ui/breadcrumb';
import useBreadcrumbs from '@/Hooks/useBreadcrumbs';

interface BreadcrumbNavigationProps {
  className?: string;
}

export default function BreadcrumbNavigation({ className }: BreadcrumbNavigationProps) {
  const breadcrumbs = useBreadcrumbs();

  if (breadcrumbs.length === 0) {
    return null;
  }

  return (
    <Breadcrumb className={className}>
      <BreadcrumbList>
        {breadcrumbs.map((breadcrumb, index) => (
          <React.Fragment key={index}>
            <BreadcrumbItem>
              {breadcrumb.isActive ? (
                <BreadcrumbPage>{breadcrumb.label}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink asChild>
                  <Link href={breadcrumb.href!}>{breadcrumb.label}</Link>
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
            {index < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
