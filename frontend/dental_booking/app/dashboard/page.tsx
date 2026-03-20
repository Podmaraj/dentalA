"use client";

import { useState, useEffect, useCallback } from "react";
import {
  CalendarDays,
  Users,
  Clock,
  TrendingUp,
  Stethoscope,
  Activity,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getStats, getSlots, getDoctors, type Stats, type Slot, type Doctor } from "@/lib/api";
import { useRealtimeSlots } from "@/hooks/use-realtime-slots";

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentSlots, setRecentSlots] = useState<Slot[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchData = useCallback(async () => {
    try {
      const [s, sl, d] = await Promise.all([
        getStats(),
        getSlots({ available_only: false, limit: 20 }),
        getDoctors(),
      ]);
      setStats(s);
      setRecentSlots(sl);
      setDoctors(d);
      setError("");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Real-time updates
  useRealtimeSlots(() => {
    fetchData();
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 rounded-2xl bg-white border border-[var(--border)] animate-pulse" />
          ))}
        </div>
        <div className="h-64 rounded-2xl bg-white border border-[var(--border)] animate-pulse" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-3 p-6 rounded-2xl bg-red-50 border border-red-200 text-red-700">
        <AlertCircle className="w-5 h-5 flex-shrink-0" />
        <div>
          <p className="font-semibold">Connection Error</p>
          <p className="text-sm mt-1">{error}</p>
          <button
            onClick={() => { setLoading(true); fetchData(); }}
            className="mt-3 px-4 py-2 text-sm font-medium bg-red-100 hover:bg-red-200 rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      label: "Total Slots",
      value: stats?.total_slots.toLocaleString() ?? "—",
      icon: CalendarDays,
      color: "var(--teal-500)",
      bg: "var(--teal-50)",
    },
    {
      label: "Available",
      value: stats?.available_slots.toLocaleString() ?? "—",
      icon: Clock,
      color: "#16a34a",
      bg: "#f0fdf4",
    },
    {
      label: "Booked",
      value: stats?.booked_slots.toLocaleString() ?? "—",
      icon: Users,
      color: "#ea580c",
      bg: "#fff7ed",
    },
    {
      label: "Occupancy",
      value: `${stats?.occupancy_rate ?? 0}%`,
      icon: TrendingUp,
      color: "#7c3aed",
      bg: "#faf5ff",
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="relative overflow-hidden rounded-2xl bg-white border border-[var(--border)] p-5 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-[var(--fg-dim)]" style={{ fontFamily: "var(--font-body)" }}>
                  {card.label}
                </p>
                <p className="mt-2 text-3xl font-bold" style={{ fontFamily: "var(--font-head)", color: card.color }}>
                  {card.value}
                </p>
              </div>
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: card.bg }}
              >
                <card.icon className="w-5 h-5" style={{ color: card.color }} />
              </div>
            </div>
            {/* Decorative line */}
            <div className="absolute bottom-0 left-0 right-0 h-1 opacity-80" style={{ background: `linear-gradient(90deg, ${card.color}, transparent)` }} />
          </div>
        ))}
      </div>

      {/* Info Cards Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Doctors */}
        <div className="rounded-2xl bg-white border border-[var(--border)] p-5">
          <div className="flex items-center gap-2 mb-4">
            <Stethoscope className="w-4 h-4 text-[var(--teal-500)]" />
            <h3 className="text-sm font-semibold text-[var(--fg)]" style={{ fontFamily: "var(--font-head)" }}>
              Doctors ({doctors.length})
            </h3>
          </div>
          <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
            {doctors.map((doc) => (
              <div
                key={`${doc.doctor_name}-${doc.specialization}`}
                className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[var(--bg-muted)] transition-colors"
              >
                <div className="w-9 h-9 rounded-full bg-[var(--teal-100)] text-[var(--teal-700)] flex items-center justify-center text-xs font-bold" style={{ fontFamily: "var(--font-head)" }}>
                  {doc.doctor_name.split(" ").map((w) => w[0]).join("").slice(0, 2)}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-[var(--fg)] truncate">{doc.doctor_name}</p>
                  <p className="text-xs text-[var(--fg-dim)]">
                    {doc.specialization.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Specializations */}
        <div className="rounded-2xl bg-white border border-[var(--border)] p-5">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-4 h-4 text-[var(--teal-500)]" />
            <h3 className="text-sm font-semibold text-[var(--fg)]" style={{ fontFamily: "var(--font-head)" }}>
              Specializations
            </h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {[...new Set(doctors.map((d) => d.specialization))].map((spec) => (
              <span
                key={spec}
                className="px-3 py-1.5 rounded-full text-xs font-medium bg-[var(--teal-50)] text-[var(--teal-700)] border border-[var(--teal-200)]"
              >
                {spec.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
              </span>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="rounded-2xl bg-gradient-to-br from-[var(--teal-600)] to-[var(--teal-800)] p-5 text-white">
          <h3 className="text-sm font-semibold mb-4" style={{ fontFamily: "var(--font-head)" }}>
            Quick Overview
          </h3>
          <div className="space-y-4">
            {[
              ["Doctors", stats?.total_doctors],
              ["Specializations", stats?.total_specializations],
              ["Unique Patients", stats?.unique_patients],
            ].map(([label, value]) => (
              <div key={String(label)} className="flex items-center justify-between">
                <span className="text-sm text-white/75">{label as string}</span>
                <span className="text-lg font-bold">{(value as number)?.toLocaleString() ?? "—"}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Slots Table */}
      <div className="rounded-2xl bg-white border border-[var(--border)] overflow-hidden">
        <div className="px-5 py-4 border-b border-[var(--border)]">
          <h3 className="text-sm font-semibold text-[var(--fg)]" style={{ fontFamily: "var(--font-head)" }}>
            Recent Slot Activity
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--bg-soft)]">
                <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-[var(--fg-dim)]">Date / Time</th>
                <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-[var(--fg-dim)]">Doctor</th>
                <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-[var(--fg-dim)]">Specialization</th>
                <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-[var(--fg-dim)]">Status</th>
                <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-[var(--fg-dim)]">Patient</th>
              </tr>
            </thead>
            <tbody>
              {recentSlots.map((slot, i) => (
                <tr
                  key={`${slot.date_slot}-${slot.doctor_name}-${i}`}
                  className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--bg-soft)] transition-colors"
                >
                  <td className="px-5 py-3 font-medium text-[var(--fg)]">{slot.date_slot}</td>
                  <td className="px-5 py-3 text-[var(--fg-muted)]">{slot.doctor_name}</td>
                  <td className="px-5 py-3">
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-[var(--teal-50)] text-[var(--teal-700)]">
                      {slot.specialization.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={cn(
                        "px-2 py-0.5 rounded-full text-xs font-semibold",
                        slot.is_available
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-orange-50 text-orange-700"
                      )}
                    >
                      {slot.is_available ? "Available" : "Booked"}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-[var(--fg-dim)]">
                    {slot.patient_to_attend || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
