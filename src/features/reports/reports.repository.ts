import { createClient } from "@/lib/supabase/server";
import "server-only";

export const reportsRepository = {
  async getAll() {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("get_reservation_reports");
    if (error) {
      throw Error;
    }
    return data;
  },
};

export async function getTodayReports() {
  const supabase = await createClient();

  const today = new Date().toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("reservations")
    .select(
      `
      id,
      booking_date,
      status,
      room_id,
      booker_id,
      capacity,
      rooms (
        name
      ),
      bookers (
        name,
        profiles (
          phone_number
        )
      ),
      room_time_slots (
        start_time,
        end_time
      )
    `,
    )
    .eq("booking_date", today)
    .eq("status", "confirmed")
    .order("slot_id", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}
