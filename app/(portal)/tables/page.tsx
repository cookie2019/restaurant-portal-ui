"use client";

import { useEffect, useState } from "react";
import {
  Plus,
  Users,
  TableProperties,
  CheckCircle2,
  XCircle,
  Pencil,
  Trash2,
  X,
  AlertCircle,
} from "lucide-react";
import { getTables, createTable, updateTable, deleteTable } from "@/lib/api";
import type { Table } from "@/lib/types";

const SECTIONS = ["Indoor", "Outdoor", "Bar", "Patio", "Private"];

interface TableForm {
  table_number: string;
  capacity: number;
  section: string;
  notes: string;
}

const emptyForm: TableForm = {
  table_number: "",
  capacity: 2,
  section: "Indoor",
  notes: "",
};

export default function TablesPage() {
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<Table | null>(null);
  const [form, setForm] = useState<TableForm>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

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

  function openAdd() {
    setEditingTable(null);
    setForm(emptyForm);
    setError("");
    setModalOpen(true);
  }

  function openEdit(table: Table) {
    setEditingTable(table);
    setForm({
      table_number: table.table_number,
      capacity: table.capacity,
      section: table.section ?? "Indoor",
      notes: table.notes ?? "",
    });
    setError("");
    setModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      if (editingTable) {
        const updated = await updateTable(restaurantId, editingTable.id, {
          table_number: form.table_number,
          capacity: form.capacity,
          section: form.section,
          notes: form.notes || undefined,
        });
        setTables((prev) =>
          prev.map((t) => (t.id === updated.id ? updated : t))
        );
      } else {
        const created = await createTable(restaurantId, {
          table_number: form.table_number,
          capacity: form.capacity,
          section: form.section,
          notes: form.notes || undefined,
        });
        setTables((prev) => [...prev, created]);
      }
      setModalOpen(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Request failed");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(tableId: number) {
    try {
      await deleteTable(restaurantId, tableId);
      setTables((prev) => prev.filter((t) => t.id !== tableId));
      setDeleteConfirm(null);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to delete table");
      setDeleteConfirm(null);
    }
  }

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
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#6c63ff] text-white text-[13px] font-medium hover:bg-[#7c74ff] transition-colors"
        >
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
                      className="group rounded-xl border border-[#2a2a32] bg-[#111114] p-4 hover:border-[#3a3a44] transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <span className="text-[15px] font-semibold text-[#f0f0f5]">
                          {table.table_number}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => openEdit(table)}
                            className="p-1 rounded text-[#55556a] opacity-0 group-hover:opacity-100 hover:text-[#8888a0] transition-all"
                          >
                            <Pencil className="w-3 h-3" />
                          </button>
                          {deleteConfirm === table.id ? (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleDelete(table.id)}
                                className="px-1.5 py-0.5 rounded text-[11px] bg-red-400/10 text-red-400 hover:bg-red-400/20 transition-colors"
                              >
                                Yes
                              </button>
                              <button
                                onClick={() => setDeleteConfirm(null)}
                                className="px-1.5 py-0.5 rounded text-[11px] text-[#55556a] hover:text-[#8888a0] transition-colors"
                              >
                                No
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setDeleteConfirm(table.id)}
                              className="p-1 rounded text-[#55556a] opacity-0 group-hover:opacity-100 hover:text-red-400 transition-all"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                          {table.is_active ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
                          ) : (
                            <XCircle className="w-3.5 h-3.5 text-[#55556a]" />
                          )}
                        </div>
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

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-[420px] rounded-2xl border border-[#2a2a32] bg-[#111114] shadow-2xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#2a2a32]">
              <h2 className="text-[16px] font-semibold text-[#f0f0f5]">
                {editingTable ? "Edit table" : "Add table"}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-lg text-[#8888a0] hover:text-[#f0f0f5] hover:bg-white/5 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[12px] font-medium text-[#8888a0] mb-1.5">
                    Table number
                  </label>
                  <input
                    type="text"
                    value={form.table_number}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, table_number: e.target.value }))
                    }
                    placeholder="T1"
                    required
                    className="w-full px-3.5 py-2.5 rounded-lg bg-[#1a1a1f] border border-[#2a2a32] text-[14px] text-[#f0f0f5] placeholder-[#55556a] focus:outline-none focus:border-[#6c63ff] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-medium text-[#8888a0] mb-1.5">
                    Capacity
                  </label>
                  <input
                    type="number"
                    value={form.capacity}
                    min={1}
                    max={50}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        capacity: parseInt(e.target.value) || 1,
                      }))
                    }
                    className="w-full px-3.5 py-2.5 rounded-lg bg-[#1a1a1f] border border-[#2a2a32] text-[14px] text-[#f0f0f5] focus:outline-none focus:border-[#6c63ff] transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-medium text-[#8888a0] mb-1.5">
                  Section
                </label>
                <select
                  value={form.section}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, section: e.target.value }))
                  }
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[#1a1a1f] border border-[#2a2a32] text-[14px] text-[#f0f0f5] focus:outline-none focus:border-[#6c63ff] transition-colors"
                >
                  {SECTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[12px] font-medium text-[#8888a0] mb-1.5">
                  Notes <span className="text-[#55556a]">(optional)</span>
                </label>
                <textarea
                  value={form.notes}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, notes: e.target.value }))
                  }
                  placeholder="Near window, wheelchair accessible…"
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
                  onClick={() => setModalOpen(false)}
                  className="flex-1 py-2.5 rounded-lg border border-[#2a2a32] text-[13px] text-[#8888a0] hover:text-[#f0f0f5] hover:bg-white/5 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !form.table_number}
                  className="flex-1 py-2.5 rounded-lg bg-[#6c63ff] text-white text-[13px] font-medium hover:bg-[#7c74ff] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {submitting
                    ? "Saving…"
                    : editingTable
                      ? "Update table"
                      : "Add table"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
