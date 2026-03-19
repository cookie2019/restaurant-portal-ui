import { type ClassValue, clsx } from "clsx";
import { format, parseISO, isToday, isTomorrow } from "date-fns";
import type { ReservationStatus } from "./types";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatTime(time: string): string {
  // "18:00" → "6:00 PM"
  const [h, m] = time.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${m.toString().padStart(2, "0")} ${suffix}`;
}

export function formatDate(date: string): string {
  const parsed = parseISO(date);
  if (isToday(parsed)) return "Today";
  if (isTomorrow(parsed)) return "Tomorrow";
  return format(parsed, "EEE, MMM d");
}

export function formatPhone(phone: string): string {
  // "+19705550100" → "(970) 555-0100"
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 11 && digits[0] === "1") {
    return `(${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
  }
  return phone;
}

export const STATUS_CONFIG: Record<
  ReservationStatus,
  { label: string; color: string; bg: string; dot: string }
> = {
  pending: {
    label: "Pending",
    color: "text-amber-400",
    bg: "bg-amber-400/10",
    dot: "bg-amber-400",
  },
  confirmed: {
    label: "Confirmed",
    color: "text-blue-400",
    bg: "bg-blue-400/10",
    dot: "bg-blue-400",
  },
  seated: {
    label: "Seated",
    color: "text-green-400",
    bg: "bg-green-400/10",
    dot: "bg-green-400",
  },
  completed: {
    label: "Completed",
    color: "text-slate-400",
    bg: "bg-slate-400/10",
    dot: "bg-slate-400",
  },
  cancelled: {
    label: "Cancelled",
    color: "text-red-400",
    bg: "bg-red-400/10",
    dot: "bg-red-400",
  },
  no_show: {
    label: "No Show",
    color: "text-red-300",
    bg: "bg-red-300/10",
    dot: "bg-red-300",
  },
};

export const VALID_TRANSITIONS: Record<ReservationStatus, ReservationStatus[]> =
  {
    pending: ["confirmed", "cancelled"],
    confirmed: ["seated", "cancelled"],
    seated: ["completed", "no_show"],
    completed: [],
    cancelled: [],
    no_show: [],
  };
