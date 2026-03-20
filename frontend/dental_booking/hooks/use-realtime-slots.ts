"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { SSE_URL } from "@/lib/api";

export interface SlotEvent {
  type: "slot_booked" | "slot_cancelled" | "slot_rescheduled";
  data: {
    patient_id: string;
    doctor_name: string;
    date_slot: string;
    specialization: string;
    old_date_slot?: string;
    new_date_slot?: string;
  };
  timestamp: string;
}

/**
 * Hook that subscribes to the SSE stream for real-time slot updates.
 * Auto-reconnects on disconnect with exponential backoff.
 *
 * @param onEvent - Callback fired on each incoming event
 * @returns { connected, lastEvent }
 */
export function useRealtimeSlots(onEvent?: (event: SlotEvent) => void) {
  const [connected, setConnected] = useState(false);
  const [lastEvent, setLastEvent] = useState<SlotEvent | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const retriesRef = useRef(0);
  const onEventRef = useRef(onEvent);
  onEventRef.current = onEvent;

  const connect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const es = new EventSource(SSE_URL);
    eventSourceRef.current = es;

    es.onopen = () => {
      setConnected(true);
      retriesRef.current = 0;
    };

    es.onmessage = (event) => {
      try {
        const parsed: SlotEvent = JSON.parse(event.data);
        setLastEvent(parsed);
        onEventRef.current?.(parsed);
      } catch {
        // Ignore malformed messages
      }
    };

    es.onerror = () => {
      setConnected(false);
      es.close();

      // Reconnect with exponential backoff (max 30s)
      const delay = Math.min(1000 * 2 ** retriesRef.current, 30000);
      retriesRef.current += 1;
      setTimeout(connect, delay);
    };
  }, []);

  useEffect(() => {
    connect();
    return () => {
      eventSourceRef.current?.close();
    };
  }, [connect]);

  return { connected, lastEvent };
}
