"use client";

import { useEffect, useState } from "react";
import {
  Clock,
  CalendarOff,
  Plus,
  Trash2,
  Save,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import {
  getAvailabilitySettings,
  updateAvailabilityHours,
  createBlackout,
  deleteBlackout,
} from "@/lib/api";
import type { DayHours, BlackoutDate } from "@/lib/types";

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const defaultHours: DayHours[] = DAYS.map((day) => ({
  day,
  is_open: day !== "Sunday",
  open_time: "11:00",
  close_time: "22:00",
  turn_time_minutes: 90,
}));

export default function SettingsPage() {
  const [hours, setHours] = useState<DayHours[]>(defaultHours);
  const [blackouts, setBlackouts] = useState<BlackoutDate[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingHours, setSavingHours] = useState(false);
  const [hoursSaved, setHoursSaved] = useState(false);
  const [hoursError, setHoursError] = useState("");
  const [newDate, setNewDate] = useState("");
  const [newReason, setNewReason] = useState("");
  const [addingBlackout, setAddingBlackout] = useState(false);

  const restaurantId =
    typeof window !== "undefined"
      ? (localStorage.getItem("portal_restaurant_id") ?? "")
      : "";

  useEffect(() => {
    if (!restaurantId) return;
    getAvailabilitySettings(restaurantId)
      .then((data) => {
        if (data.hours?.length) setHours(data.hours);
        if (data.blackouts) setBlackouts(data.blackouts);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [restaurantId]);

  function updateDay(index: number, patch: Partial<DayHours>) {
    setHours((prev) =>
      prev.map((h, i) => (i === index ? { ...h, ...patch } : h))
    );
    setHoursSaved(false);
  }

  async function saveHours() {
    setSavingHours(true);
    setHoursError("");
    try {
      const updated = await updateAvailabilityHours(restaurantId, hours);
      setHours(updated);
      setHoursSaved(true);
    } catch (err: unknown) {
      setHoursError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSavingHours(false);
    }
  }

  async function handleAddBlackout(e: React.FormEvent) {
    e.preventDefault();
    if (!newDate) return;
    setAddingBlackout(true);
    try {
      const blackout = await createBlackout(restaurantId, {
        date: newDate,
        reason: newReason.trim() || undefined,
      });
      setBlackouts((prev) => [...prev, blackout]);
      setNewDate("");
      setNewReason("");
    } catch {
      // silently fail
    } finally {
      setAddingBlackout(false);
    }
  }

  async function handleDeleteBlackout(id: number) {
    try {
      await deleteBlackout(restaurantId, id);
      setBlackouts((prev) => prev.filter((b) => b.id !== id));
    } catch {
      // silently fail
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-5 h-5 text-[#55556a] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="text-[22px] font-semibold text-[#f0f0f5]">Settings</h1>
        <p className="text-[13px] text-[#8888a0] mt-0.5">
          Manage hours, availability, and blackout dates
        </p>
      </div>

      {/* Hours & Availability */}
      <section className="rounded-xl border border-[#2a2a32] bg-[#111114] overflow-hidden">
        <div className="px-5 py-4 border-b border-[#2a2a32] flex items-center gap-2">
          <Clock className="w-4 h-4 text-[#6c63ff]" />
          <h2 className="text-[15px] font-semibold text-[#f0f0f5]">
            Hours & Availability
          </h2>
        </div>

        <div className="p-5 space-y-3">
          {hours.map((day, i) => (
            <div
              key={day.day}
              className="flex items-center gap-3 py-2 border-b border-[#1e1e24] last:border-0"
            >
              {/* Toggle */}
              <button
                type="button"
                onClick={() => updateDay(i, { is_open: !day.is_open })}
                className={`w-9 h-5 rounded-full relative transition-colors ${
                  day.is_open ? "bg-[#6c63ff]" : "bg-[#2a2a32]"
                }`}
              >
                <span
                  className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                    day.is_open ? "left-[18px]" : "left-0.5"
                  }`}
                />
              </button>

              {/* Day name */}
              <span
                className={`w-24 text-[13px] font-medium ${
                  day.is_open ? "text-[#f0f0f5]" : "text-[#55556a]"
                }`}
              >
                {day.day}
              </span>

              {day.is_open ? (
                <>
                  <input
                    type="time"
                    value={day.open_time}
                    onChange={(e) =>
                      updateDay(i, { open_time: e.target.value })
                    }
                    className="px-2.5 py-1.5 rounded-lg bg-[#1a1a1f] border border-[#2a2a32] text-[13px] text-[#f0f0f5] focus:outline-none focus:border-[#6c63ff] transition-colors"
                  />
                  <span className="text-[12px] text-[#55556a]">to</span>
                  <input
                    type="time"
                    value={day.close_time}
                    onChange={(e) =>
                      updateDay(i, { close_time: e.target.value })
                    }
                    className="px-2.5 py-1.5 rounded-lg bg-[#1a1a1f] border border-[#2a2a32] text-[13px] text-[#f0f0f5] focus:outline-none focus:border-[#6c63ff] transition-colors"
                  />
                  <div className="flex items-center gap-1.5 ml-auto">
                    <input
                      type="number"
                      value={day.turn_time_minutes}
                      min={15}
                      max={300}
                      onChange={(e) =>
                        updateDay(i, {
                          turn_time_minutes: parseInt(e.target.value) || 90,
                        })
                      }
                      className="w-16 px-2 py-1.5 rounded-lg bg-[#1a1a1f] border border-[#2a2a32] text-[13px] text-[#f0f0f5] text-center focus:outline-none focus:border-[#6c63ff] transition-colors"
                    />
                    <span className="text-[11px] text-[#55556a]">min turn</span>
                  </div>
                </>
              ) : (
                <span className="text-[12px] text-[#55556a]">Closed</span>
              )}
            </div>
          ))}

          {hoursError && (
            <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-lg bg-red-400/10 border border-red-400/20 text-[13px] text-red-400">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
              {hoursError}
            </div>
          )}

          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={saveHours}
              disabled={savingHours}
              className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#6c63ff] text-white text-[13px] font-medium hover:bg-[#7c74ff] disabled:opacity-50 transition-colors"
            >
              {savingHours ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Save className="w-3.5 h-3.5" />
              )}
              Save hours
            </button>
            {hoursSaved && (
              <span className="flex items-center gap-1 text-[12px] text-green-400">
                <CheckCircle2 className="w-3 h-3" />
                Saved
              </span>
            )}
          </div>
        </div>
      </section>

      {/* Blackout Dates */}
      <section className="rounded-xl border border-[#2a2a32] bg-[#111114] overflow-hidden">
        <div className="px-5 py-4 border-b border-[#2a2a32] flex items-center gap-2">
          <CalendarOff className="w-4 h-4 text-red-400" />
          <h2 className="text-[15px] font-semibold text-[#f0f0f5]">
            Blackout Dates
          </h2>
        </div>

        <div className="p-5 space-y-4">
          {/* Add form */}
          <form
            onSubmit={handleAddBlackout}
            className="flex items-end gap-3"
          >
            <div className="flex-1">
              <label className="block text-[12px] font-medium text-[#8888a0] mb-1.5">
                Date
              </label>
              <input
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#1a1a1f] border border-[#2a2a32] text-[14px] text-[#f0f0f5] focus:outline-none focus:border-[#6c63ff] transition-colors"
              />
            </div>
            <div className="flex-1">
              <label className="block text-[12px] font-medium text-[#8888a0] mb-1.5">
                Reason <span className="text-[#55556a]">(optional)</span>
              </label>
              <input
                type="text"
                value={newReason}
                onChange={(e) => setNewReason(e.target.value)}
                placeholder="Holiday, private event…"
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#1a1a1f] border border-[#2a2a32] text-[14px] text-[#f0f0f5] placeholder-[#55556a] focus:outline-none focus:border-[#6c63ff] transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={addingBlackout || !newDate}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-lg bg-[#6c63ff] text-white text-[13px] font-medium hover:bg-[#7c74ff] disabled:opacity-50 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Add
            </button>
          </form>

          {/* List */}
          {blackouts.length === 0 ? (
            <p className="text-[13px] text-[#55556a] py-4 text-center">
              No blackout dates configured
            </p>
          ) : (
            <div className="space-y-2">
              {blackouts.map((b) => (
                <div
                  key={b.id}
                  className="flex items-center justify-between px-4 py-3 rounded-lg bg-[#1a1a1f] border border-[#2a2a32]"
                >
                  <div>
                    <span className="text-[13px] font-medium text-[#f0f0f5]">
                      {b.date}
                    </span>
                    {b.reason && (
                      <span className="ml-2 text-[12px] text-[#55556a]">
                        — {b.reason}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => handleDeleteBlackout(b.id)}
                    className="p-1.5 rounded text-[#55556a] hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
