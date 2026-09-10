import { useEffect, useMemo, useState } from "react";
import {
  useReservationReports,
  useTodayReports,
} from "../reservation/useReservationReports";

const ITEMS_PER_PAGE = 10;

function getMinutes(slot: string) {
  const start = slot.split(" - ")[0];
  const [time, period] = start.split(" ");
  const [parsedHour, minute] = time.split(":").map(Number);
  let hour = parsedHour;
  if (period === "PM" && hour !== 12) hour += 12;
  if (period === "AM" && hour === 12) hour = 0;

  return hour * 60 + minute;
}

const getCurrentMonth = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
};

export function useDashboard() {
  const { data: reservations, loading } = useReservationReports();
  const { data: todayReservations, loading: todayLoading } = useTodayReports();

  const [month, setMonth] = useState<string>(getCurrentMonth());
  const [searchPhone, setSearchPhone] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCurrentPage(1);
  }, [month, searchPhone]);

  const filtered = useMemo(() => {
    if (!reservations) return [];

    return reservations

      .filter((r) => {
        const matchesMonth = r.booking_date?.startsWith(month);

        const matchesPhone =
          searchPhone.trim() === "" ||
          (r.booker_phone ?? "").includes(searchPhone.trim());

        return matchesMonth && matchesPhone;
      })
      .sort((a, b) => {
        const dateCompare =
          new Date(b.booking_date).getTime() -
          new Date(a.booking_date).getTime();

        if (dateCompare !== 0) return dateCompare;
        return getMinutes(b.time_slot ?? "") - getMinutes(a.time_slot ?? "");
      });
  }, [reservations, month, searchPhone]);

  /* SUMMARY */
  const summary = useMemo(() => {
    const total = filtered.length;
    const confirmed = filtered.filter((r) => r.status === "confirmed").length;
    const cancelled = filtered.filter((r) => r.status === "cancelled").length;

    const rooms = new Set(filtered.map((r) => r.room_id)).size;

    return { total, confirmed, cancelled, rooms };
  }, [filtered]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);

  const paginatedReservations = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filtered.slice(start, start + ITEMS_PER_PAGE);
  }, [filtered, currentPage]);

  return {
    totalPages,
    paginatedReservations,
    summary,
    loading,

    todayReservations,
    todayLoading,

    month,
    setMonth,

    searchPhone,
    setSearchPhone,

    currentPage,
    setCurrentPage,

    filtered,
  };
}
