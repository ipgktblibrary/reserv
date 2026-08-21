import "server-only";

import { createClient } from "@/lib/supabase/server";

export const bookerRepository = {
  async getAll() {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("get_bookers_admin");
    if (error) {
      throw new Error(error.message);
    }
    return data;
  },

  async update(id: string, is_blocked: boolean, blocked_reason: string | null) {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("bookers")
      .update({
        is_blocked: is_blocked,
        block_reason: blocked_reason,
      })
      .eq("id", id)
      .select();

    if (error) {
      console.error(error.message);
      return;
    }
    return data;
  },

  async deleteAccount(bookerId: string) {
    const supabase = await createClient();

    const { error } = await supabase.rpc("booker_delete", {
      p_booker_id: bookerId,
    });

    if (error) {
      throw new Error(error.message);
    }
  },
};
