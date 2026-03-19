"use client";

import { useEffect, useState } from "react";
import { Plus, Users, TableProperties, CheckCircle2, XCircle } from "lucide-react";
import { getTables } from "@/lib/api";
import type { Table } from "@/lib/types";

export default function TablesPage() {
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);

  const restaurantId =
    typeof window !== "undefined"
      ? (localStorage.getItem("portal_restaurant_id") ?? "")
      : "";

  useEffect(() => {
    if (!restaurantId) return;
    getTables(restaurantId)
      .then(setTables)
      .finally(() => setLoading(false));
  }, [restaurantId]);

  const sections = [...new Set(tables.map((t) => t.section ?? "Uncategorized"))];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-semibold text-[#f0f0f5]">Tables</h1>
          <p className="text-[13px] text-[#8888a0] mt-0.5">
            {tables.length > 0
              ? `${tables.length} tables · ${tables.reduce((s, t) => s + t.capacity, 0)} total covers`
              : "Configure your floor layout"}
          </p>
        </div>
        <button className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#6c63ff] text-white text-[13px] font-medium hover:bg-[#7c74ff] transition-colors">
          <Plus className="w-3.5 h-3.5" />
          Add table
        </button>
      </div>

      {loading ? (
        <div className="grid gap-3 grid-cols-2 md:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-24 rounded-xl bg-[#111114] border border-[#2a2a32] animate-pulse"
            />
          ))}
        </div>
      ) : tables.length === 0 ? (
        <div className="py-16 text-center">
          <TableProperties className="w-8 h-8 text-[#2a2a32] mx-auto mb-3" />
          <p className="text-[14px] text-[#55556a]">No tables configured yet</p>
          <p className="text-[12px] text-[#3a3a44] mt-1">
            Add tables to start accepting reservations
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {sections.map((section) => (
            <div key={section}>
              <h2 className="text-[12px] font-medium text-[#55556a] uppercase tracking-wider mb-3">
                {section}
              </h2>
              <div className="grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {tables
                  .filter((t) => (t.section ?? "Uncategorized") === section)
                  .map((table) => (
                    <div
                      key={table.id}
                      className="rounded-xl border border-[#2a2a32] bg-[#111114] p-4 hover:border-[#3a3a44] transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <span className="text-[15px] font-semibold text-[#f0f0f5]">
                          {table.table_number}
                        </span>
                        {table.is_active ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
                        ) : (
                          <XCircle className="w-3.5 h-3.5 text-[#55556a]" />
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-[12px] text-[#8888a0]">
                        <Users className="w-3 h-3" />
                        {table.capacity} seats
                      </div>
                      {table.notes && (
                        <p className="text-[11px] text-[#55556a] mt-1.5 truncate">
                          {table.notes}
                        </p>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
