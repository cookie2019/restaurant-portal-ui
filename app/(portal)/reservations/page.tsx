"use client";

import { useEffect, useState } from "react";
import { format, addDays, subDays } from "date-fns";
import { ChevronLeft, ChevronRight, Plus, Search } from "lucide-react";
import { ReservationCard } from "@/components/ReservationCard";
import { getReservations, updateReservationStatus } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import type { Reservation, ReservationStatus } from "@/lib/types";
import { NewReservationModal } from "@/components/NewReservationModal";

export default function ReservationsPage() {
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [showNew, setShowNew] = useState(false);

  const restaurantId =
    typeof window !== "undefined"
      ? (localStorage.getItem("portal_restaurant_id") ?? "")
      : "";

  useEffect(() => {
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date, restaurantId]);

  async function load() {
    setLoading(true);
    try {
      const data = await getReservations(restaurantId, date);
      setReservations(data.reservations ?? []);
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
    } finally {
      setUpdating(null);
    }
  }

  const filtered = reservations.filter(
    (r) =>
      !search ||
      r.customer_name.toLowerCase().includes(search.toLowerCase()) ||
      r.customer_phone.includes(search)
  );

  const STATUS_ORDER = ["seated", "confirmed", "pending", "completed", "no_show", "cancelled"];
  const sorted = [...filtered].sort(
    (a, b) =>
      STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status) ||
      a.reservation_time.localeCompare(b.reservation_time)
  );

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-[22px] font-semibold text-[#f0f0f5]">
          Reservations
        </h1>
        <button
          onClick={() => setShowNew(true)}
          className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#6c63ff] text-white text-[13px] font-medium hover:bg-[#7c74ff] transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          New
        </button>
      </div>

      {/* Date nav */}
      <div className="flex items-center gap-3">
        <button
          onClick={() =>
            setDate(format(subDays(new Date(date + "T12:00:00"), 1), "yyyy-MM-dd"))
          }
          className="p-1.5 rounded-lg text-[#8888a0] hover:text-[#f0f0f5] hover:bg-white/5 transition-all"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="text-[15px] font-medium text-[#f0f0f5] min-w-[100px] text-center">
          {formatDate(date)}
        </span>
        <button
          onClick={() =>
            setDate(format(addDays(new Date(date + "T12:00:00"), 1), "yyyy-MM-dd"))
          }
          className="p-1.5 rounded-lg text-[#8888a0] hover:text-[#f0f0f5] hover:bg-white/5 transition-all"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
        <div className="ml-2 text-[13px] text-[#55556a]">
          {reservations.length > 0 &&
            `${reservations.length} reservations · ${reservations.reduce((s, r) => s + r.party_size, 0)} covers`}
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#55556a]" />
        <input
          type="text"
          placeholder="Search by name or phone…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-[#111114] border border-[#2a2a32] text-[13px] text-[#f0f0f5] placeholder-[#55556a] focus:outline-none focus:border-[#6c63ff] transition-colors"
        />
      </div>

      {/* List */}
      {loading ? (
        <div className="grid gap-3 md:grid-cols-2">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-32 rounded-xl bg-[#111114] border border-[#2a2a32] animate-pulse"
            />
          ))}
        </div>
      ) : sorted.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-[14px] text-[#55556a]">
            {search ? "No reservations match your search" : "No reservations for this day"}
          </p>
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {sorted.map((r) => (
            <ReservationCard
              key={r.id}
              reservation={r}
              onStatusChange={handleStatusChange}
              isUpdating={updating === r.id}
            />
          ))}
        </div>
      )}

      {showNew && (
        <NewReservationModal
          restaurantId={restaurantId}
          date={date}
          onClose={() => setShowNew(false)}
          onCreated={(r) => {
            setReservations((prev) => [r, ...prev]);
            setShowNew(false);
          }}
        />
      )}
    </div>
  );
}
