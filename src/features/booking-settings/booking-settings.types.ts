import type { Database } from "@/types/database.types";

type BookingSettingsRow =
  Database["public"]["Tables"]["booking_settings"]["Row"];

export type BookingSettingsUpdate = {
  id: BookingSettingsRow["id"];
  booking_enabled: boolean;
  min_days_ahead: number;
  max_days_ahead: number;
  max_slots_per_user_per_day: number;
  allowed_days: number[];
};

export const DAYS_OF_WEEK = [
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
  { value: 7, label: "Sunday" },
] as const;
