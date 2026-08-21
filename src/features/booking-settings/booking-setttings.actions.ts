"use server";

import { bookingSettingRepository } from "./booking-settings.repository";
import type { BookingSettingsUpdate } from "./booking-settings.types";

export async function getAllBookingSetting() {
  return bookingSettingRepository.getAll();
}

export async function updateBookingSetting(input: BookingSettingsUpdate) {
  return bookingSettingRepository.update(input);
}
