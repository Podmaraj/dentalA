"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  CalendarPlus,
  Clock,
  ChevronRight,
  ChevronLeft,
  Check,
  AlertCircle,
  Loader2,
  User,
  Stethoscope,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getSpecializations,
  getDoctors,
  getSlots,
  sendChatMessage,
  type Specialization,
  type Doctor,
  type Slot,
} from "@/lib/api";
import { useRealtimeSlots } from "@/hooks/use-realtime-slots";

type Step = 1 | 2 | 3 | 4 | 5;

function BookingForm() {
  const searchParams = useSearchParams();

  const [step, setStep] = useState<Step>(1);
  const [specs, setSpecs] = useState<Specialization[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Selections
  const [selectedSpec, setSelectedSpec] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("");
  const [patientId, setPatientId] = useState("");
  const [patientName, setPatientName] = useState("");
  const [notes, setNotes] = useState("");

  // Load initial data
  const fetchData = useCallback(async () => {
    try {
      const [sp, d] = await Promise.all([getSpecializations(), getDoctors()]);
      setSpecs(sp);
      setDoctors(d);
      setError("");

      // Pre-fill from URL params
      const urlDoctor = searchParams.get("doctor");
      const urlSlot = searchParams.get("slot");
      if (urlDoctor) {
        const matchDoc = d.find((doc) => doc.doctor_name.toLowerCase() === urlDoctor.toLowerCase());
        if (matchDoc) {
          setSelectedDoctor(matchDoc.doctor_name);
          setSelectedSpec(matchDoc.specialization);
          if (urlSlot) {
            setSelectedSlot(urlSlot);
            setStep(4);
          } else {
            setStep(3);
          }
        }
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Fetch slots when doctor is selected
  useEffect(() => {
    if (selectedDoctor) {
      getSlots({ doctor_name: selectedDoctor, available_only: true, limit: 100 })
        .then(setSlots)
        .catch(() => setSlots([]));
    }
  }, [selectedDoctor]);

  // Real-time slot refresh
  useRealtimeSlots(() => {
    if (selectedDoctor) {
      getSlots({ doctor_name: selectedDoctor, available_only: true, limit: 100 })
        .then(setSlots)
        .catch(() => {});
    }
  });

  // Filtered doctors by specialization
  const filteredDoctors = selectedSpec
    ? doctors.filter((d) => d.specialization === selectedSpec)
    : doctors;

  // Handle booking
  const handleBook = async () => {
    if (!patientId || !selectedDoctor || !selectedSlot) return;

    setSubmitting(true);
    setError("");
    try {
      const msg = `Book appointment for patient ${patientId} with ${selectedDoctor} at ${selectedSlot}`;
      const res = await sendChatMessage(msg);
      if (res.response.toLowerCase().includes("success")) {
        setSuccess(res.response);
        setStep(5);
      } else {
        setSuccess(res.response);
        setStep(5);
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Booking failed");
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setStep(1);
    setSelectedSpec("");
    setSelectedDoctor("");
    setSelectedSlot("");
    setPatientId("");
    setPatientName("");
    setNotes("");
    setSuccess("");
    setError("");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-[var(--teal-500)]" />
      </div>
    );
  }

  const STEPS = [
    { num: 1, label: "Specialization" },
    { num: 2, label: "Doctor" },
    { num: 3, label: "Time Slot" },
    { num: 4, label: "Details" },
    { num: 5, label: "Confirmed" },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-[var(--fg)]" style={{ fontFamily: "var(--font-head)" }}>
          <CalendarPlus className="inline w-6 h-6 mr-2 text-[var(--teal-500)]" />
          Book an Appointment
        </h2>
        <p className="text-sm text-[var(--fg-muted)] mt-1">
          Follow the steps below — slots update in real-time
        </p>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center justify-center gap-1">
        {STEPS.map((s) => (
          <div key={s.num} className="flex items-center">
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all",
              step >= s.num
                ? "bg-[var(--teal-500)] text-white"
                : "bg-[var(--bg-muted)] text-[var(--fg-dim)] border border-[var(--border)]"
            )}>
              {step > s.num ? <Check className="w-4 h-4" /> : s.num}
            </div>
            {s.num < 5 && (
              <div className={cn(
                "w-8 h-0.5 mx-1",
                step > s.num ? "bg-[var(--teal-500)]" : "bg-[var(--border)]"
              )} />
            )}
          </div>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
          <AlertCircle className="w-4 h-4" /> {error}
        </div>
      )}

      {/* Step Content */}
      <div className="rounded-2xl bg-white border border-[var(--border)] p-6 min-h-[300px]">
        {/* Step 1: Specialization */}
        {step === 1 && (
          <div>
            <h3 className="font-semibold text-[var(--fg)] mb-1" style={{ fontFamily: "var(--font-head)" }}>
              Choose a Specialization
            </h3>
            <p className="text-sm text-[var(--fg-muted)] mb-6">Select the type of dental care you need</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {specs.map((s) => (
                <button
                  key={s.name}
                  onClick={() => { setSelectedSpec(s.name); setStep(2); }}
                  className={cn(
                    "flex items-center gap-3 p-4 rounded-xl border text-left transition-all",
                    selectedSpec === s.name
                      ? "border-[var(--teal-500)] bg-[var(--teal-50)] ring-2 ring-[var(--teal-500)]/20"
                      : "border-[var(--border)] hover:border-[var(--teal-300)] hover:bg-[var(--bg-soft)]"
                  )}
                >
                  <Stethoscope className="w-5 h-5 text-[var(--teal-500)] flex-shrink-0" />
                  <span className="font-medium text-sm">{s.display_name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Doctor */}
        {step === 2 && (
          <div>
            <h3 className="font-semibold text-[var(--fg)] mb-1" style={{ fontFamily: "var(--font-head)" }}>
              Choose a Doctor
            </h3>
            <p className="text-sm text-[var(--fg-muted)] mb-6">
              Showing {selectedSpec.replace(/_/g, " ")} specialists
            </p>
            <div className="space-y-3">
              {filteredDoctors.map((doc) => (
                <button
                  key={`${doc.doctor_name}-${doc.specialization}`}
                  onClick={() => { setSelectedDoctor(doc.doctor_name); setStep(3); }}
                  className={cn(
                    "w-full flex items-center gap-4 p-4 rounded-xl border text-left transition-all",
                    selectedDoctor === doc.doctor_name
                      ? "border-[var(--teal-500)] bg-[var(--teal-50)]"
                      : "border-[var(--border)] hover:border-[var(--teal-300)] hover:bg-[var(--bg-soft)]"
                  )}
                >
                  <div className="w-10 h-10 rounded-full bg-[var(--teal-100)] text-[var(--teal-700)] flex items-center justify-center text-xs font-bold flex-shrink-0">
                    {doc.doctor_name.split(" ").map((w) => w[0]).join("").slice(0, 2)}
                  </div>
                  <div>
                    <p className="font-medium text-sm text-[var(--fg)]">{doc.doctor_name}</p>
                    <p className="text-xs text-[var(--fg-dim)]">
                      {doc.specialization.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                    </p>
                  </div>
                </button>
              ))}
            </div>
            <button onClick={() => setStep(1)} className="mt-4 flex items-center gap-1 text-sm text-[var(--teal-600)] hover:underline">
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
          </div>
        )}

        {/* Step 3: Time Slot */}
        {step === 3 && (
          <div>
            <h3 className="font-semibold text-[var(--fg)] mb-1" style={{ fontFamily: "var(--font-head)" }}>
              Select a Time Slot
            </h3>
            <p className="text-sm text-[var(--fg-muted)] mb-6">
              Available slots for {selectedDoctor}
              <span className="ml-2 inline-flex items-center gap-1 text-xs text-emerald-600">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live
              </span>
            </p>
            {slots.length === 0 ? (
              <p className="text-center text-[var(--fg-dim)] py-8">No available slots for this doctor.</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-80 overflow-y-auto pr-1">
                {slots.map((slot) => (
                  <button
                    key={slot.date_slot}
                    onClick={() => { setSelectedSlot(slot.date_slot); setStep(4); }}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm transition-all",
                      selectedSlot === slot.date_slot
                        ? "border-[var(--teal-500)] bg-[var(--teal-50)] text-[var(--teal-700)] font-semibold"
                        : "border-[var(--border)] hover:border-[var(--teal-300)] text-[var(--fg-muted)]"
                    )}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    {slot.date_slot}
                  </button>
                ))}
              </div>
            )}
            <button onClick={() => setStep(2)} className="mt-4 flex items-center gap-1 text-sm text-[var(--teal-600)] hover:underline">
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
          </div>
        )}

        {/* Step 4: Patient Details */}
        {step === 4 && (
          <div>
            <h3 className="font-semibold text-[var(--fg)] mb-1" style={{ fontFamily: "var(--font-head)" }}>
              Patient Details
            </h3>
            <p className="text-sm text-[var(--fg-muted)] mb-6">Enter your information to confirm the booking</p>

            {/* Summary */}
            <div className="rounded-xl bg-[var(--bg-muted)] border border-[var(--border)] p-4 mb-6">
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-xs text-[var(--fg-dim)]">Specialization</p>
                  <p className="font-medium text-[var(--fg)]">{selectedSpec.replace(/_/g, " ")}</p>
                </div>
                <div>
                  <p className="text-xs text-[var(--fg-dim)]">Doctor</p>
                  <p className="font-medium text-[var(--fg)]">{selectedDoctor}</p>
                </div>
                <div>
                  <p className="text-xs text-[var(--fg-dim)]">Time</p>
                  <p className="font-medium text-[var(--teal-600)]">{selectedSlot}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--fg-muted)] mb-1.5">
                  Patient ID *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--fg-dim)]" />
                  <input
                    type="text"
                    value={patientId}
                    onChange={(e) => setPatientId(e.target.value)}
                    placeholder="e.g. 1000082"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[var(--border)] text-sm focus:outline-none focus:border-[var(--teal-500)] focus:ring-2 focus:ring-[var(--teal-500)]/20"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--fg-muted)] mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  placeholder="Rajesh Kumar"
                  className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] text-sm focus:outline-none focus:border-[var(--teal-500)] focus:ring-2 focus:ring-[var(--teal-500)]/20"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--fg-muted)] mb-1.5">
                  Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  placeholder="Any symptoms or concerns..."
                  className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] text-sm focus:outline-none focus:border-[var(--teal-500)] focus:ring-2 focus:ring-[var(--teal-500)]/20 resize-vertical"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setStep(3)} className="flex items-center gap-1 px-4 py-2.5 text-sm font-medium text-[var(--fg-muted)] border border-[var(--border)] rounded-xl hover:bg-[var(--bg-muted)]">
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
              <button
                onClick={handleBook}
                disabled={!patientId || submitting}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl transition-all",
                  patientId && !submitting
                    ? "bg-[var(--teal-500)] text-white hover:bg-[var(--teal-600)] hover:-translate-y-0.5 hover:shadow-lg"
                    : "bg-[var(--bg-muted)] text-[var(--fg-dim)] cursor-not-allowed"
                )}
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                {submitting ? "Booking..." : "Confirm Appointment"}
              </button>
            </div>
          </div>
        )}

        {/* Step 5: Confirmation */}
        {step === 5 && (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 flex items-center justify-center mb-4">
              <Check className="w-8 h-8 text-emerald-600" />
            </div>
            <h3 className="text-xl font-bold text-[var(--fg)] mb-2" style={{ fontFamily: "var(--font-head)" }}>
              Booking Result
            </h3>
            <p className="text-sm text-[var(--fg-muted)] max-w-md mx-auto whitespace-pre-line">
              {success}
            </p>
            <button
              onClick={resetForm}
              className="mt-6 px-6 py-2.5 text-sm font-medium bg-[var(--teal-500)] text-white rounded-xl hover:bg-[var(--teal-600)] transition-all"
            >
              Book Another Appointment
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function BookingPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-[var(--teal-500)]" /></div>}>
      <BookingForm />
    </Suspense>
  );
}
