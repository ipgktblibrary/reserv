"use server";

import type { UpdateBookerInput } from "./booker.types";
import { bookerRepository } from "./booker.repository";

export async function getBookersAction() {
  return bookerRepository.getAll();
}

export async function updateBookerAction(input: UpdateBookerInput) {
  return bookerRepository.update(
    input.id,
    input.is_blocked,
    input.block_reason,
  );
}

export async function deleteBookerAction(id: string) {
  return bookerRepository.deleteAccount(id);
}
