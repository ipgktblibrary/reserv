"use server";

import { reportsRepository } from "./reports.repository";

export async function getReports() {
  return reportsRepository.getAll();
}
