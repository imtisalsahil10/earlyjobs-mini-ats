import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function parseSkills(skills: string) {
  return skills
    .split(",")
    .map((skill) => skill.trim())
    .filter(Boolean);
}

/** Annual figures are stored in rupees and shown in lakhs, as is conventional in India. */
export function formatSalary(min?: number | null, max?: number | null) {
  if (!min && !max) return "Not disclosed";
  const fmt = (value: number) => {
    const lakhs = value / 100_000;
    return `₹${Number.isInteger(lakhs) ? lakhs : lakhs.toFixed(1)}L`;
  };
  if (min && max) return `${fmt(min)} – ${fmt(max)}`;
  return fmt((min ?? max) as number);
}
