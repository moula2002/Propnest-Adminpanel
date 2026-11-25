import Link from 'next/link';
import { Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
      <h1 className="text-6xl font-black text-slate-800 tracking-tight font-mono">404</h1>
      <h2 className="text-xl font-bold text-slate-900 mt-3">Administrative Resource Not Found</h2>
      <p className="text-sm text-slate-500 mt-1 max-w-sm">
        The requested admin route, dashboard metric, or entity does not exist.
      </p>
      <Link
        href="/dashboard"
        className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 transition-colors shadow-sm"
      >
        <Home className="w-4 h-4" />
        <span>Return to Dashboard</span>
      </Link>
    </div>
  );
}

