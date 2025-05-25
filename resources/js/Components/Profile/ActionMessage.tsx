import React, { PropsWithChildren } from 'react';
import { Transition } from '@headlessui/react';
import { Alert, AlertDescription } from '@/Components/ui/alert';
import { CheckCircle } from 'lucide-react';

interface Props {
  on: boolean;
  className?: string;
}

export default function ActionMessage({
  on,
  className,
  children,
}: PropsWithChildren<Props>) {
  return (
    <Transition
      show={on}
      enter="transition ease-in-out duration-300"
      enterFrom="opacity-0"
      enterTo="opacity-100"
      leave="transition ease-in-out duration-300"
      leaveFrom="opacity-100"
      leaveTo="opacity-0"
    >
      <Alert variant="success" className={className}>
        <CheckCircle className="h-4 w-4 mr-2" />
        <AlertDescription>{children}</AlertDescription>
      </Alert>
    </Transition>
  );
}
