"use client";

import { useEffect, useState } from "react";
import { format, parseISO } from "date-fns";
import { Users, Star, Search, Phone } from "lucide-react";
import { getCustomers } from "@/lib/api";
import { formatPhone } from "@/lib/utils";
import type { LoyaltyCustomer } from "@/lib/types";

export default function CustomersPage() {
  const [customers, setCustomers] = useState<LoyaltyCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const restaurantId =
    typeof window !== "undefined"
      ? (localStorage.getItem("portal_restaurant_id") ?? "")
      : "";

  useEffect(() => {
    if (!restaurantId) return;
    getCustomers(restaurantId)
      .then(setCustomers)
      .finally(() => setLoading(false));
  }, [restaurantId]);

  const filtered = customers.filter(
    (c) =>
      !search ||
      c.customer_name.toLowerCase().includes(search.toLowerCase()) ||
      c.customer_phone.includes(search)
  );

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-[22px] font-semibold text-[#f0f0f5]">Guests</h1>
        <p className="text-[13px] text-[#8888a0] mt-0.5">
          {customers.length > 0
            ? `${customers.length} guests · auto-built from completed reservations`
            : "Guest profiles build automatically from completed reservations"}
        </p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#55556a]" />
        <input
          type="text"
          placeholder="Search guests…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-[#111114] border border-[#2a2a32] text-[13px] text-[#f0f0f5] placeholder-[#55556a] focus:outline-none focus:border-[#6c63ff] transition-colors"
        />
      </div>

      {loading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-16 rounded-xl bg-[#111114] border border-[#2a2a32] animate-pulse"
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center">
          <Users className="w-8 h-8 text-[#2a2a32] mx-auto mb-3" />
          <p className="text-[14px] text-[#55556a]">
            {search ? "No guests match your search" : "No guest profiles yet"}
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-[#2a2a32] overflow-hidden">
          {filtered.map((c, i) => (
            <div
              key={c.id}
              className={`flex items-center justify-between px-4 py-3.5 ${
                i < filtered.length - 1 ? "border-b border-[#1e1e24]" : ""
              } hover:bg-[#13131a] transition-colors`}
            >
              <div className="flex items-center gap-3 min-w-0">
                {/* Avatar */}
                <div className="w-8 h-8 rounded-full bg-[#6c63ff]/15 flex items-center justify-center flex-shrink-0">
                  <span className="text-[12px] font-semibold text-[#6c63ff]">
                    {c.customer_name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-[14px] font-medium text-[#f0f0f5] truncate">
                      {c.customer_name}
                    </p>
                    {c.visit_count >= 5 && (
                      <Star className="w-3 h-3 text-amber-400 flex-shrink-0" />
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-0.5">
                    <a
                      href={`tel:${c.customer_phone}`}
                      className="flex items-center gap-1 text-[12px] text-[#8888a0] hover:text-[#6c63ff] transition-colors"
                    >
                      <Phone className="w-2.5 h-2.5" />
                      {formatPhone(c.customer_phone)}
                    </a>
                    {c.notes && (
                      <span className="text-[12px] text-[#55556a] truncate max-w-[180px]">
                        {c.notes}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="text-right flex-shrink-0 ml-4">
                <p className="text-[14px] font-semibold text-[#f0f0f5]">
                  {c.visit_count}
                  <span className="text-[12px] font-normal text-[#55556a] ml-1">
                    {c.visit_count === 1 ? "visit" : "visits"}
                  </span>
                </p>
                <p className="text-[11px] text-[#55556a]">
                  Last: {format(parseISO(c.last_seen_at), "MMM d")}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
