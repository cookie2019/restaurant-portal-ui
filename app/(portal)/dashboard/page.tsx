"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import {
  CalendarDays,
  Users,
  CheckCircle2,
  Clock,
  TrendingUp,
  Car,
} from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { ReservationCard } from "@/components/ReservationCard";
import { getReservations, updateReservationStatus } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import type { Reservation, ReservationStatus } from "@/lib/types";

export default function DashboardPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<number | null>(null);
  const [error, setError] = useState("");

  const today = format(new Date(), "yyyy-MM-dd");

  const restaurantId =
    typeof window !== "undefined"
      ? (localStorage.getItem("portal_restaurant_id") ?? "")
      : "";

  useEffect(() => {
    if (!restaurantId) return;
    loadReservations();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restaurantId]);

  async function loadReservations() {
    setLoading(true);
    setError("");
    try {
      const data = await getReservations(restaurantId, today);
      setReservations(data.reservations ?? []);
    } catch {
      setError("Unable to load reservations. Check your connection.");
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusChange(id: number, status: ReservationStatus) {
    setUpdating(id);
    try {
      const updated = await updateReservationStatus(restaurantId, id, status);
      setReservations((prev) =>
        prev.map((r) => (r.id === updated.id ? updated : r))
      );
    } catch {
      // Surface briefly
    } finally {
      setUpdating(null);
    }
  }

  // Stats
  const active = reservations.filter((r) =>
    ["pending", "confirmed", "seated"].includes(r.status)
  );
  const seated = reservations.filter((r) => r.status === "seated");
  const completed = reservations.filter((r) => r.status === "completed");
  const covers = active.reduce((sum, r) => sum + r.party_size, 0);
  const rideRequests = reservations.filter((r) => r.ride_requested).length;

  const upcoming = active
    .filter((r) => r.status !== "seated")
    .sort((a, b) => a.reservation_time.localeCompare(b.reservation_time));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-[22px] font-semibold text-[#f0f0f5]">
          {formatDate(today)}
        </h1>
        <p className="text-[13px] text-[#8888a0] mt-0.5">
          {active.length === 0
            ? "No active reservations today"
            : `${active.length} reservations · ${covers} covers`}
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          label="Seated now"
          value={seated.length}
          icon={Users}
          color="green"
          sub={`${seated.reduce((s, r) => s + r.party_size, 0)} covers`}
        />
        <StatCard
          label="Upcoming"
          value={upcoming.length}
          icon={Clock}
          color="amber"
        />
        <StatCard
          label="Completed"
          value={completed.length}
          icon={CheckCircle2}
          color="default"
        />
        <StatCard
          label="Ride requests"
          value={rideRequests}
          icon={Car}
          color="purple"
        />
      </div>

      {/* Seated now — highest priority */}
      {seated.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <h2 className="text-[13px] font-medium text-[#8888a0] uppercase tracking-wide">
              Seated now
            </h2>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {seated.map((r) => (
              <ReservationCard
                key={r.id}
                reservation={r}
                onStatusChange={handleStatusChange}
                isUpdating={updating === r.id}
              />
            ))}
          </div>
        </section>
      )}

      {/* Upcoming */}
      {upcoming.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <CalendarDays className="w-3.5 h-3.5 text-[#8888a0]" />
            <h2 className="text-[13px] font-medium text-[#8888a0] uppercase tracking-wide">
              Upcoming
            </h2>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {upcoming.map((r) => (
              <ReservationCard
                key={r.id}
                reservation={r}
                onStatusChange={handleStatusChange}
                isUpdating={updating === r.id}
              />
            ))}
          </div>
        </section>
      )}

      {/* Empty */}
      {!loading && active.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <TrendingUp className="w-8 h-8 text-[#2a2a32] mb-3" />
          <p className="text-[14px] text-[#55556a]">
            No active reservations for today
          </p>
          <p className="text-[12px] text-[#3a3a44] mt-1">
            New bookings will appear here automatically
          </p>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="grid gap-3 md:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-32 rounded-xl bg-[#111114] border border-[#2a2a32] animate-pulse"
            />
          ))}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="px-4 py-3 rounded-lg bg-red-400/10 border border-red-400/20 text-[13px] text-red-400">
          {error}
        </div>
      )}
    </div>
  );
}
