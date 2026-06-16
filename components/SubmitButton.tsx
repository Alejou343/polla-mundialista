"use client";

import { useFormStatus } from "react-dom";
import Loader from "./Loader";

export function SubmitButton({
  children,
  pendingLabel,
  className = "btn-primary w-full",
}: {
  children: React.ReactNode;
  pendingLabel: string;
  className?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <>
      <button type="submit" disabled={pending} className={className} aria-busy={pending}>
        {children}
      </button>
      {pending && <Loader fullscreen size="lg" label={pendingLabel} />}
    </>
  );
}
