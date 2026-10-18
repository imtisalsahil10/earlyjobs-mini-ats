"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { Search, X } from "lucide-react";
import { Select } from "@/components/ui";
import { STAGES, stageLabel } from "@/lib/stages";

type Props = {
  jobs: { id: string; title: string }[];
  sources: string[];
  sortOptions: { value: string; label: string }[];
};

export function FilterBar({ jobs, sources, sortOptions }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const urlQuery = searchParams.get("q") ?? "";
  const [query, setQuery] = useState(urlQuery);
  const [syncedQuery, setSyncedQuery] = useState(urlQuery);
  const isFirstRender = useRef(true);

  // Re-sync the input when navigation changes the URL (back button, clear filters).
  if (urlQuery !== syncedQuery) {
    setSyncedQuery(urlQuery);
    setQuery(urlQuery);
  }

  function pushParams(mutate: (params: URLSearchParams) => void) {
    const params = new URLSearchParams(searchParams.toString());
    mutate(params);
    // Any filter change invalidates the current page offset.
    params.delete("page");
    startTransition(() => {
      router.push(`/candidates${params.toString() ? `?${params}` : ""}`, {
        scroll: false,
      });
    });
  }

  // Debounce typing so each keystroke doesn't trigger a server round-trip.
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (query === urlQuery) return;

    const timeout = setTimeout(() => {
      pushParams((params) => {
        if (query.trim()) params.set("q", query.trim());
        else params.delete("q");
      });
    }, 300);

    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  function onSelect(key: string) {
    return (event: React.ChangeEvent<HTMLSelectElement>) => {
      const value = event.target.value;
      pushParams((params) => {
        if (value === "ALL") params.delete(key);
        else params.set(key, value);
      });
    };
  }

  const activeFilters = ["q", "stage", "jobId", "source"].filter((key) =>
    searchParams.get(key),
  ).length;

  return (
    <div
      className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center"
      data-pending={isPending ? "" : undefined}
    >
      <div className="relative flex-1">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
          aria-hidden
        />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search name, email, skill, title, or role…"
          aria-label="Search candidates"
          className="w-full rounded-lg border-0 bg-white py-2 pl-9 pr-3 text-sm text-slate-900 ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-slate-900"
        />
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:w-auto">
        <Select
          aria-label="Filter by stage"
          value={searchParams.get("stage") ?? "ALL"}
          onChange={onSelect("stage")}
          className="lg:w-36"
        >
          <option value="ALL">All stages</option>
          {STAGES.map((stage) => (
            <option key={stage} value={stage}>
              {stageLabel(stage)}
            </option>
          ))}
        </Select>

        <Select
          aria-label="Filter by role"
          value={searchParams.get("jobId") ?? "ALL"}
          onChange={onSelect("jobId")}
          className="lg:w-44"
        >
          <option value="ALL">All roles</option>
          {jobs.map((job) => (
            <option key={job.id} value={job.id}>
              {job.title}
            </option>
          ))}
        </Select>

        <Select
          aria-label="Filter by source"
          value={searchParams.get("source") ?? "ALL"}
          onChange={onSelect("source")}
          className="lg:w-36"
        >
          <option value="ALL">All sources</option>
          {sources.map((source) => (
            <option key={source} value={source}>
              {source}
            </option>
          ))}
        </Select>

        <Select
          aria-label="Sort candidates"
          value={searchParams.get("sort") ?? "recent"}
          onChange={onSelect("sort")}
          className="lg:w-40"
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </div>

      {activeFilters > 0 ? (
        <button
          type="button"
          onClick={() =>
            startTransition(() => router.push("/candidates", { scroll: false }))
          }
          className="inline-flex items-center gap-1 self-start rounded-lg px-2 py-1.5 text-xs font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-900 lg:self-auto"
        >
          <X className="h-3 w-3" aria-hidden />
          Clear {activeFilters} filter{activeFilters > 1 ? "s" : ""}
        </button>
      ) : null}
    </div>
  );
}
