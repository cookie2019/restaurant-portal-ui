"use client";

import { Users, Clock, Phone, MessageSquare, Car } from "lucide-react";
import { StatusBadge } from "./StatusBadge";
import { cn, formatTime, formatPhone, VALID_TRANSITIONS } from "@/lib/utils";
import type { Reservation, ReservationStatus } from "@/lib/types";

interface Props {
  reservation: Reservation;
  onStatusChange: (id: number, status: ReservationStatus) => void;
  isUpdating?: boolean;
}

const ACTION_LABELS: Partial<Record<ReservationStatus, string>> = {
  confirmed: "Confirm",
  seated: "Seat Now",
  completed: "Complete",
  cancelled: "Cancel",
  no_show: "No Show",
};

const ACTION_STYLES: Partial<Record<ReservationStatus, string>> = {
  confirmed: "bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border-blue-500/20",
  seated: "bg-green-500/10 text-green-400 hover:bg-green-500/20 border-green-500/20",
  completed: "bg-slate-500/10 text-slate-400 hover:bg-slate-500/20 border-slate-500/20",
  cancelled: "bg-red-500/10 text-red-400 hover:bg-red-500/20 border-red-500/20",
  no_show: "bg-red-300/10 text-red-300 hover:bg-red-300/20 border-red-300/20",
};

export function ReservationCard({ reservation, onStatusChange, isUpdating }: Props) {
  const transitions = VALID_TRANSITIONS[reservation.status];

  return (
    <div
      className={cn(
        "rounded-xl border p-4 transition-all duration-200",
        "bg-[#111114] border-[#2a2a32]",
        "hover:border-[#3a3a44] hover:bg-[#13131a]",
        isUpdating && "opacity-60 pointer-events-none"
      )}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0">
          <h3 className="text-[15px] font-semibold text-[#f0f0f5] truncate">
            {reservation.customer_name}
          </h3>
          <div className="flex items-center gap-3 mt-1">
            <span className="flex items-center gap-1 text-[13px] text-[#8888a0]">
              <Clock className="w-3 h-3" />
              {formatTime(reservation.reservation_time)}
            </span>
            <span className="flex items-center gap-1 text-[13px] text-[#8888a0]">
              <Users className="w-3 h-3" />
              {reservation.party_size}
            </span>
          </div>
        </div>
        <StatusBadge status={reservation.status} />
      </div>

      {/* Details row */}
      <div className="flex items-center gap-4 mb-4">
        <a
          href={`tel:${reservation.customer_phone}`}
          className="flex items-center gap-1.5 text-[13px] text-[#6c63ff] hover:text-[#7c74ff] transition-colors"
        >
          <Phone className="w-3 h-3" />
          {formatPhone(reservation.customer_phone)}
        </a>
        {reservation.ride_requested && (
          <span className="flex items-center gap-1 text-[13px] text-[#22c55e]">
            <Car className="w-3 h-3" />
            Ride requested
          </span>
        )}
      </div>

      {/* Special requests */}
      {reservation.special_requests && (
        <div className="flex items-start gap-2 mb-4 px-3 py-2 rounded-lg bg-[#1a1a1f] text-[13px] text-[#8888a0]">
          <MessageSquare className="w-3 h-3 mt-0.5 flex-shrink-0" />
          <span>{reservation.special_requests}</span>
        </div>
      )}

      {/* Actions */}
      {transitions.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          {transitions.map((status) => (
            <button
              key={status}
              onClick={() => onStatusChange(reservation.id, status)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium border transition-all",
                ACTION_STYLES[status] ??
                  "bg-white/5 text-[#8888a0] hover:bg-white/10 border-white/10"
              )}
            >
              {ACTION_LABELS[status] ?? status}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
