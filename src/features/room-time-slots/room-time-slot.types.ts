import type { Database } from "@/types/database.types";

/**
 * Database types
 */
export type RoomTimeSlotRow =
  Database["public"]["Tables"]["room_time_slots"]["Row"];

export type RoomTimeSlotInsert =
  Database["public"]["Tables"]["room_time_slots"]["Insert"];

/**
 * Application inputs
 */
export type CreateRoomTimeSlotInput = {
  roomId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
};

export type UpdateRoomTimeSlotInput = {
  id: string;
  startTime: string;
  endTime: string;
};

/**
 * Query inputs
 */
export type GetRoomTimeSlotsInput = {
  roomId: string;
  dayOfWeek: number;
};
