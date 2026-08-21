import "server-only";

import { createClient } from "@/lib/supabase/server";
import type {
  CreateRoomTimeSlotInput,
  UpdateRoomTimeSlotInput,
} from "./room-time-slot.types";

export const roomTimeSlotRepository = {
  async getAll() {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("room_time_slots")
      .select("*")
      .order("room_id", { ascending: true })
      .order("day_of_week", { ascending: true })
      .order("slot_index", { ascending: true });

    if (error) throw error;
    return data ?? [];
  },

  async getByRoomAndDay(roomId: string, dayOfWeek: number) {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("room_time_slots")
      .select("*")
      .eq("room_id", roomId)
      .eq("day_of_week", dayOfWeek)
      .order("slot_index", { ascending: true });
    if (error) throw error;
    return data ?? [];
  },

  async updateBlockStatus(
    id: string,
    payload: {
      is_blocked: boolean;
      blocked_reason: string | null;
    },
  ) {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("room_time_slots")
      .update(payload)
      .eq("id", id)
      .select("*");

    if (error) {
      console.error("update time slot error:", error);
      throw new Error(error.message);
    }

    if (data.length !== 1) {
      throw new Error(
        `Expected 1 updated time slot, but database returned ${data.length}`,
      );
    }

    return data[0];
  },

  async create(input: CreateRoomTimeSlotInput) {
    const supabase = await createClient();

    const { data, error } = await supabase.rpc("create_room_time_slot", {
      p_room_id: input.roomId,
      p_day_of_week: input.dayOfWeek,
      p_start_time: input.startTime,
      p_end_time: input.endTime,
    });

    if (error) throw error;
    return data;
  },

  async updateRoomTimeSlot(input: UpdateRoomTimeSlotInput) {
    const supabase = await createClient();

    const { data, error } = await supabase.rpc("update_room_time_slot", {
      p_id: input.id,
      p_start_time: input.startTime,
      p_end_time: input.endTime,
    });

    if (error) throw error;
    return data;
  },

  async deleteRoomTimeSlot(id: string) {
    const supabase = await createClient();

    const { data, error } = await supabase.rpc("delete_room_time_slot", {
      p_id: id,
    });

    if (error) {
      throw new Error(error.message);
    }
    return data;
  },
};
