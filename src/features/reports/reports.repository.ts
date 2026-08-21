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
