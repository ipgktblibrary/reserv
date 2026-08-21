import { createClient } from "@/lib/supabase/server";

export const roomOverrideRepository = {
  async getAll() {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("room_overrides")
      .select(
        `
        id,
        room_id,
        start_date,
        end_date,
        is_blocked,
        blocked_reason,
        created_at,
        rooms (
          id,
          name
        )
      `,
      )
      .eq("is_blocked", true)
      .order("start_date", { ascending: true });

    if (error) throw new Error(error.message);

    return data ?? [];
  },

  async create(
    roomId: string,
    startDate: string,
    endDate: string,
    reason?: string | null,
  ) {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("room_overrides")
      .insert({
        room_id: roomId,
        start_date: startDate,
        end_date: endDate,
        is_blocked: true,
        blocked_reason: reason ?? null,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);

    return data;
  },

  async delete(id: string) {
    const supabase = await createClient();

    const { error } = await supabase
      .from("room_overrides")
      .delete()
      .eq("id", id);

    if (error) throw new Error(error.message);
  },
};
