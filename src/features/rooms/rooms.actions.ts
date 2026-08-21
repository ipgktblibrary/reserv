"use server";

import { roomsRepository } from "./rooms.repository";
import { RoomInsert, RoomUpdate } from "./room.types";

export async function createRoomAction(payload: RoomInsert) {
  return roomsRepository.create(payload);
}

export async function updateRoomAction(id: string, payload: RoomUpdate) {
  return roomsRepository.update(id, payload);
}

export async function deleteRoomAction(id: string) {
  return roomsRepository.delete(id);
}
