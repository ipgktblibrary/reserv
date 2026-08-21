"use server";

import { roomOverrideRepository } from "./room-overrides.repository";

export async function createRoomOverrideAction(
  roomId: string,
  startDate: string,
  endDate: string,
  reason?: string | null,
) {
  return roomOverrideRepository.create(roomId, startDate, endDate, reason);
}

export async function getRoomOverridesAction() {
  return roomOverrideRepository.getAll();
}

export async function deleteRoomOverrideAction(id: string) {
  return roomOverrideRepository.delete(id);
}
