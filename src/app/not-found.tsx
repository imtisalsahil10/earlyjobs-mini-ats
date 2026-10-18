import Link from "next/link";
import { Card } from "@/components/ui";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-lg py-16">
      <Card className="px-6 py-12 text-center">
        <p className="text-xs font-medium text-slate-400">404</p>
        <h1 className="mt-1 text-lg font-semibold text-slate-900">
          We couldn&apos;t find that page
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          The candidate or role you&apos;re looking for may have been removed.
        </p>
        <Link
          href="/"
          className="mt-5 inline-flex h-9 items-center rounded-lg bg-slate-900 px-4 text-sm font-medium text-white hover:bg-slate-800"
        >
          Back to dashboard
        </Link>
      </Card>
    </div>
  );
}
