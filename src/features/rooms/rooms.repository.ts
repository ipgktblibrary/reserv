import "server-only";

import { createClient } from "@/lib/supabase/server";
import { RoomInsert, RoomUpdate } from "./room.types";

export const roomsRepository = {
  async getAll() {
    const start = performance.now();

    const supabase = await createClient();

    const { data, error } = await supabase
      .from("rooms")
      .select("*")
      .order("id", { ascending: true });

    console.log(
      `[roomsRepository.getAll] ${Math.round(performance.now() - start)}ms`,
    );

    if (error) {
      throw error;
    }

    return data ?? [];
  },

  async create(payload: RoomInsert) {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("rooms")
      .insert(payload)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  },

  async update(id: string, payload: RoomUpdate) {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("rooms")
      .update(payload)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  },

  async delete(id: string) {
    const supabase = await createClient();

    const { data, error } = await supabase.from("rooms").delete().eq("id", id);

    if (error) {
      throw error;
    }

    return data;
  },
};
