"use server";

import { roomTimeSlotRepository } from "./room-time-slot.repository";
import type {
  CreateRoomTimeSlotInput,
  UpdateRoomTimeSlotInput,
} from "./room-time-slot.types";

type UpdateTimeSlotInput = {
  id: string;
  is_blocked: boolean;
  blocked_reason: string | null;
};

export async function getRoomTimeSlots(roomId: string, dayOfWeek: number) {
  return roomTimeSlotRepository.getByRoomAndDay(roomId, dayOfWeek);
}

export async function updateTimeSlotAction(input: UpdateTimeSlotInput) {
  if (!input.id) {
    throw new Error("Time slot ID is required.");
  }
  const updatedSlot = await roomTimeSlotRepository.updateBlockStatus(input.id, {
    is_blocked: input.is_blocked,
    blocked_reason: input.blocked_reason,
  });

  return updatedSlot;
}

export async function createRoomTimeSlot(input: CreateRoomTimeSlotInput) {
  return await roomTimeSlotRepository.create(input);
}

export async function updateRoomTimeSlot(input: UpdateRoomTimeSlotInput) {
  return await roomTimeSlotRepository.updateRoomTimeSlot(input);
}

export async function deleteRoomTimeSlot(id: string) {
  return await roomTimeSlotRepository.deleteRoomTimeSlot(id);
}
