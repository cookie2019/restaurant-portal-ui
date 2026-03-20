"use client";

import { useState, useEffect } from "react";
import { X, Users, Clock, AlertCircle, Loader2 } from "lucide-react";
import { createReservation, getAvailability } from "@/lib/api";
import { formatTime } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { Reservation, AvailabilitySlot } from "@/lib/types";

interface Props {
  restaurantId: string;
  date: string;
  onClose: () => void;
  onCreated: (reservation: Reservation) => void;
}

export function NewReservationModal({
  restaurantId,
  date,
  onClose,
  onCreated,
}: Props) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [partySize, setPartySize] = useState(2);
  const [time, setTime] = useState("");
  const [notes, setNotes] = useState("");
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!partySize || partySize < 1) return;
    const timeout = setTimeout(loadSlots, 300);
    return () => clearTimeout(timeout);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [partySize, date]);

  async function loadSlots() {
    setLoadingSlots(true);
    setTime("");
    try {
      const data = await getAvailability(restaurantId, date, partySize);
      setSlots(data.slots);
    } catch {
      setSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const reservation = await createReservation(restaurantId, {
        customerName: name.trim(),
        customerPhone: phone.trim(),
        partySize,
        date,
        time,
        specialRequests: notes.trim() || undefined,
      });
      onCreated(reservation);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Unable to create reservation"
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-[420px] rounded-2xl border border-[#2a2a32] bg-[#111114] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#2a2a32]">
          <h2 className="text-[16px] font-semibold text-[#f0f0f5]">
            New reservation
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#8888a0] hover:text-[#f0f0f5] hover:bg-white/5 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Guest name */}
          <div>
            <label className="block text-[12px] font-medium text-[#8888a0] mb-1.5">
              Guest name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jane Smith"
              required
              className="w-full px-3.5 py-2.5 rounded-lg bg-[#1a1a1f] border border-[#2a2a32] text-[14px] text-[#f0f0f5] placeholder-[#55556a] focus:outline-none focus:border-[#6c63ff] transition-colors"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-[12px] font-medium text-[#8888a0] mb-1.5">
              Phone number
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 (970) 555-0100"
              required
              className="w-full px-3.5 py-2.5 rounded-lg bg-[#1a1a1f] border border-[#2a2a32] text-[14px] text-[#f0f0f5] placeholder-[#55556a] focus:outline-none focus:border-[#6c63ff] transition-colors"
            />
          </div>

          {/* Party size */}
          <div>
            <label className="block text-[12px] font-medium text-[#8888a0] mb-1.5">
              <Users className="w-3 h-3 inline mr-1" />
              Party size
            </label>
            <input
              type="number"
              value={partySize}
              min={1}
              max={20}
              onChange={(e) => setPartySize(parseInt(e.target.value) || 1)}
              className="w-full px-3.5 py-2.5 rounded-lg bg-[#1a1a1f] border border-[#2a2a32] text-[14px] text-[#f0f0f5] focus:outline-none focus:border-[#6c63ff] transition-colors"
            />
          </div>

          {/* Time slots */}
          <div>
            <label className="block text-[12px] font-medium text-[#8888a0] mb-2">
              <Clock className="w-3 h-3 inline mr-1" />
              Available times
            </label>
            {loadingSlots ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="w-4 h-4 text-[#55556a] animate-spin" />
                <span className="ml-2 text-[12px] text-[#55556a]">
                  Checking availability…
                </span>
              </div>
            ) : slots.length === 0 ? (
              <div className="flex items-center justify-center gap-2 py-4 rounded-lg bg-[#1a1a1f] border border-[#2a2a32]">
                <AlertCircle className="w-3.5 h-3.5 text-[#55556a]" />
                <span className="text-[13px] text-[#55556a]">
                  No availability for this date and party size
                </span>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {slots.map((s) => (
                  <button
                    key={s.time}
                    type="button"
                    onClick={() => setTime(s.time)}
                    className={cn(
                      "px-3 py-2 rounded-lg text-[13px] font-medium border transition-all",
                      time === s.time
                        ? "bg-[#6c63ff] border-[#6c63ff] text-white"
                        : "bg-[#1a1a1f] border-[#2a2a32] text-[#f0f0f5] hover:border-[#6c63ff]/50"
                    )}
                  >
                    <span>{formatTime(s.time)}</span>
                    <span className="ml-1.5 text-[11px] opacity-60">
                      {s.tablesAvailable} left
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-[12px] font-medium text-[#8888a0] mb-1.5">
              Special requests{" "}
              <span className="text-[#55556a]">(optional)</span>
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Window seat, high chair, anniversary…"
              rows={2}
              maxLength={500}
              className="w-full px-3.5 py-2.5 rounded-lg bg-[#1a1a1f] border border-[#2a2a32] text-[14px] text-[#f0f0f5] placeholder-[#55556a] focus:outline-none focus:border-[#6c63ff] transition-colors resize-none"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-lg bg-red-400/10 border border-red-400/20 text-[13px] text-red-400">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-lg border border-[#2a2a32] text-[13px] text-[#8888a0] hover:text-[#f0f0f5] hover:bg-white/5 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !name || !phone || !time}
              className="flex-1 py-2.5 rounded-lg bg-[#6c63ff] text-white text-[13px] font-medium hover:bg-[#7c74ff] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {submitting ? "Booking…" : "Book table"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
