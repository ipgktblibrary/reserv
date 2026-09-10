"use server";

import { getTodayReports, reportsRepository } from "./reports.repository";

export async function getReports() {
  return reportsRepository.getAll();
}

export async function getTodayBooking() {
  return getTodayReports();
}
