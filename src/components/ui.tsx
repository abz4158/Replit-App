import { type ButtonHTMLAttributes, type PropsWithChildren, type SelectHTMLAttributes } from 'react';

export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

export function Card({ className = '', children }: PropsWithChildren<{ className?: string }>) {
  return <section className={cn('rounded-2xl border border-taupe/80 bg-white shadow-card', className)}>{children}</section>;
}

export function Button({ className = '', ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={cn(
        'rounded-lg border border-ink bg-ink px-3 py-2 text-sm font-medium text-paper transition hover:-translate-y-px hover:bg-black disabled:opacity-60',
        className,
      )}
    />
  );
}

export function GhostButton({ className = '', ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={cn(
        'rounded-lg border border-taupe bg-transparent px-2.5 py-2 text-sm text-ink transition hover:border-ink/40 hover:bg-mist',
        className,
      )}
    />
  );
}

export function Input({ className = '', ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        'w-full rounded-lg border border-taupe bg-white px-3 py-2 text-sm text-ink outline-none transition focus:border-ink/40 focus:ring-2 focus:ring-ink/10',
        className,
      )}
    />
  );
}

export function Textarea({ className = '', ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={cn(
        'w-full rounded-lg border border-taupe bg-white px-3 py-2 text-sm text-ink outline-none transition focus:border-ink/40 focus:ring-2 focus:ring-ink/10',
        className,
      )}
    />
  );
}

export function Label({ children }: PropsWithChildren) {
  return <label className="mb-1.5 block text-[11px] uppercase tracking-[0.18em] text-ink/60">{children}</label>;
}

export function Select({ className = '', ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={cn(
        'w-full rounded-lg border border-taupe bg-white px-3 py-2 text-sm text-ink outline-none transition focus:border-ink/40 focus:ring-2 focus:ring-ink/10',
        className,
      )}
    />
  );
}

export function Badge({ className = '', children }: PropsWithChildren<{ className?: string }>) {
  return <span className={cn('rounded-full border border-taupe bg-mist px-2.5 py-1 text-[11px] uppercase tracking-wide text-ink/80', className)}>{children}</span>;
}
