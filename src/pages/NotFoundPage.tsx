import { Link } from 'wouter';

export function NotFoundPage() {
  return (
    <div className="grid min-h-screen place-items-center bg-paper p-8 text-ink">
      <div className="rounded-2xl border border-taupe bg-white p-8 text-center shadow-card">
        <h1 className="font-serif text-3xl">Archive Not Found</h1>
        <p className="mt-2 text-sm text-ink/70">The requested route does not exist in this prototype.</p>
        <Link href="/" className="mt-4 inline-block rounded-lg border border-ink bg-ink px-4 py-2 text-paper">Return Home</Link>
      </div>
    </div>
  );
}
