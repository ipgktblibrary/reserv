"use client";

import { useCallback, useEffect, useState } from "react";
import { ReportsData } from "@/features/dashboard/reservation-report-csv";
import { getReports, getTodayBooking } from "../reports/reports.actions";

export function useReservationReports() {
  const [data, setData] = useState<ReportsData[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getReports();
      setData(res);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchAll();
  }, [fetchAll]);

  return {
    data,
    loading,
    refresh: fetchAll,
  };
}

export type TodayBookingData = {
  id: string;

  booking_date: string;

  status: string;

  room_id: string;

  booker_id: string;

  capacity: number;

  booker_name: string;

  booker_phone: string | null;

  room_name: string;

  start_time: string;

  end_time: string;
};

function formatTime(time: string) {
  const [hours, minutes] = time.split(":").map(Number);

  const period = hours >= 12 ? "PM" : "AM";

  const hour = hours % 12 || 12;

  return `${hour}:${String(minutes).padStart(2, "0")} ${period}`;
}

export function useTodayReports() {
  const [data, setData] = useState<TodayBookingData[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchAll = useCallback(async () => {
    setLoading(true);

    try {
      const reservations = await getTodayBooking();

      const grouped = new Map<string, TodayBookingData>();

      for (const reservation of reservations) {
        const room = Array.isArray(reservation.rooms)
          ? reservation.rooms[0]
          : reservation.rooms;

        const booker = Array.isArray(reservation.bookers)
          ? reservation.bookers[0]
          : reservation.bookers;

        const profile = Array.isArray(booker?.profiles)
          ? booker.profiles[0]
          : booker?.profiles;

        const slot = Array.isArray(reservation.room_time_slots)
          ? reservation.room_time_slots[0]
          : reservation.room_time_slots;

        if (!slot) continue;

        const key = `${reservation.booker_id}-${reservation.room_id}-${reservation.booking_date}`;

        const existing = grouped.get(key);

        if (!existing) {
          grouped.set(key, {
            id: reservation.id,
            booking_date: reservation.booking_date,
            status: reservation.status,
            room_id: reservation.room_id,
            booker_id: reservation.booker_id,
            capacity: reservation.capacity,
            booker_name: booker?.name?.trim() ?? "",
            booker_phone: profile?.phone_number ?? null,
            room_name: room?.name ?? "",
            start_time: slot.start_time,
            end_time: slot.end_time,
          });

          continue;
        }

        // Earliest slot becomes the booking start.
        if (slot.start_time < existing.start_time) {
          existing.start_time = slot.start_time;
        }

        // Latest slot becomes the booking end.
        if (slot.end_time > existing.end_time) {
          existing.end_time = slot.end_time;
        }
      }

      const result = Array.from(grouped.values()).sort((a, b) =>
        a.start_time.localeCompare(b.start_time),
      );

      setData(result);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchAll();
  }, [fetchAll]);

  return {
    data,
    loading,
    refresh: fetchAll,
    formatTime,
  };
}
