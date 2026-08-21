import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { BookingSettingsUpdate } from "./booking-settings.types";

export const bookingSettingRepository = {
  async getAll() {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("booking_settings")
      .select("*")
      .single();

    if (error) {
      throw Error;
    }

    return data;
  },

  async update(input: BookingSettingsUpdate) {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("booking_settings")
      .update(input)
      .eq("id", input.id)
      .select()
      .single();

    if (error) {
      throw Error;
    }

    return data;
  },
};
