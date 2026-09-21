"use client";

import type { ReactNode } from "react";

type ConfirmFormProps = {
  action: (formData: FormData) => Promise<void>;
  confirmMessage: string;
  children: ReactNode;
  className?: string;
};

export function ConfirmForm({
  action,
  confirmMessage,
  children,
  className,
}: ConfirmFormProps) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    if (!window.confirm(confirmMessage)) {
      e.preventDefault();
    }
  };

  return (
    <form action={action} onSubmit={handleSubmit} className={className}>
      {children}
    </form>
  );
}