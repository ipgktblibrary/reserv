"use server";

import { getTodayReports, reportsRepository } from "./reports.repository";

export async function getReports() {
  console.log("🔥 getReports CALLED");

  const data = await reportsRepository.getAll();

  console.log("🔥 TOTAL REPORTS:", data?.length);

  console.log(
    "🔥 BI SEPT 24:",
    data?.filter(
      (r: { room_id: string; booking_date: string }) =>
        r.room_id === "BI" && r.booking_date === "2026-09-24",
    ),
  );

  return data;
}

export async function getTodayBooking() {
  return getTodayReports();
}
