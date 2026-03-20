"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Search,
  Calendar,
  Clock,
  AlertCircle,
  Filter,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getDoctors, getSlots, getSpecializations, type Doctor, type Slot, type Specialization } from "@/lib/api";
import { useRealtimeSlots } from "@/hooks/use-realtime-slots";
import Link from "next/link";

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [specializations, setSpecializations] = useState<Specialization[]>([]);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterSpec, setFilterSpec] = useState("");
  const [search, setSearch] = useState("");
  const [expandedDoctor, setExpandedDoctor] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const [d, sp, sl] = await Promise.all([
        getDoctors(),
        getSpecializations(),
        getSlots({ available_only: true, limit: 200 }),
      ]);
      setDoctors(d);
      setSpecializations(sp);
      setSlots(sl);
      setError("");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load doctors");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Real-time: refresh on slot changes
  useRealtimeSlots(() => {
    getSlots({ available_only: true, limit: 200 }).then(setSlots).catch(() => {});
  });

  // Filtered doctors
  const filtered = doctors.filter((d) => {
    const matchSpec = !filterSpec || d.specialization === filterSpec;
    const matchSearch = !search || d.doctor_name.toLowerCase().includes(search.toLowerCase());
    return matchSpec && matchSearch;
  });

  // Available slots count per doctor
  const availableByDoctor = (name: string) =>
    slots.filter((s) => s.doctor_name.toLowerCase() === name.toLowerCase() && s.is_available).length;

  // Slots for a specific doctor
  const doctorSlots = (name: string) =>
    slots.filter((s) => s.doctor_name.toLowerCase() === name.toLowerCase() && s.is_available).slice(0, 12);

  if (loading) {
    return (
      <div className="space-y-4 max-w-5xl">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 rounded-2xl bg-white border border-[var(--border)] animate-pulse" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-3 p-6 rounded-2xl bg-red-50 border border-red-200 text-red-700">
        <AlertCircle className="w-5 h-5" />
        <span>{error}</span>
        <button onClick={() => { setLoading(true); fetchData(); }} className="ml-auto px-4 py-2 text-sm font-medium bg-red-100 hover:bg-red-200 rounded-lg">Retry</button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-[var(--fg)]" style={{ fontFamily: "var(--font-head)" }}>
          Our Doctors
        </h2>
        <p className="text-sm text-[var(--fg-muted)] mt-1">
          Browse our team — availability updates in real-time
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--fg-dim)]" />
          <input
            type="text"
            placeholder="Search doctors..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[var(--border)] bg-white text-sm focus:outline-none focus:border-[var(--teal-500)] focus:ring-2 focus:ring-[var(--teal-500)]/20 transition-all"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--fg-dim)]" />
          <select
            value={filterSpec}
            onChange={(e) => setFilterSpec(e.target.value)}
            className="pl-10 pr-8 py-2.5 rounded-xl border border-[var(--border)] bg-white text-sm appearance-none focus:outline-none focus:border-[var(--teal-500)] cursor-pointer"
          >
            <option value="">All Specializations</option>
            {specializations.map((s) => (
              <option key={s.name} value={s.name}>{s.display_name}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--fg-dim)] pointer-events-none" />
        </div>
      </div>

      {/* Doctor Cards */}
      <div className="space-y-3">
        {filtered.length === 0 && (
          <p className="text-center text-[var(--fg-muted)] py-12">No doctors match your search.</p>
        )}
        {filtered.map((doc) => {
          const avail = availableByDoctor(doc.doctor_name);
          const isExpanded = expandedDoctor === doc.doctor_name;
          const docSlots = isExpanded ? doctorSlots(doc.doctor_name) : [];

          return (
            <div key={`${doc.doctor_name}-${doc.specialization}`} className="rounded-2xl bg-white border border-[var(--border)] overflow-hidden transition-all hover:border-[var(--teal-300)] hover:shadow-sm">
              <button
                onClick={() => setExpandedDoctor(isExpanded ? null : doc.doctor_name)}
                className="w-full flex items-center gap-4 p-5 text-left"
              >
                {/* Avatar */}
                <div className="w-12 h-12 rounded-full bg-[var(--teal-100)] text-[var(--teal-700)] flex items-center justify-center text-sm font-bold flex-shrink-0 border-2 border-[var(--teal-200)]" style={{ fontFamily: "var(--font-head)" }}>
                  {doc.doctor_name.split(" ").map((w) => w[0]).join("").slice(0, 2)}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-[var(--fg)]">{doc.doctor_name}</h3>
                  <p className="text-xs text-[var(--fg-dim)] mt-0.5">
                    {doc.specialization.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                  </p>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className={cn(
                    "px-3 py-1 rounded-full text-xs font-semibold",
                    avail > 0 ? "bg-emerald-50 text-emerald-700" : "bg-orange-50 text-orange-700"
                  )}>
                    {avail} slot{avail !== 1 ? "s" : ""} open
                  </span>
                  <ChevronDown className={cn("w-4 h-4 text-[var(--fg-dim)] transition-transform", isExpanded && "rotate-180")} />
                </div>
              </button>

              {/* Expanded slots */}
              {isExpanded && (
                <div className="px-5 pb-5 border-t border-[var(--border)] pt-4">
                  {docSlots.length === 0 ? (
                    <p className="text-sm text-[var(--fg-dim)]">No available slots at this time.</p>
                  ) : (
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-[var(--fg-dim)] mb-3">
                        <Calendar className="inline w-3 h-3 mr-1" />
                        Available Slots
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {docSlots.map((slot) => (
                          <Link
                            key={slot.date_slot}
                            href={`/booking?doctor=${encodeURIComponent(doc.doctor_name)}&slot=${encodeURIComponent(slot.date_slot)}`}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--bg-soft)] text-sm text-[var(--fg-muted)] hover:border-[var(--teal-400)] hover:bg-[var(--teal-50)] hover:text-[var(--teal-700)] transition-all"
                          >
                            <Clock className="w-3 h-3" />
                            {slot.date_slot}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
