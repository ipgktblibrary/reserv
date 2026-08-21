"use client";

import { Table } from "@heroui/react";
import {
  deleteRoomAction,
  updateRoomAction,
} from "@/features/rooms/rooms.actions";
import type { RoomRow } from "@/features/rooms/room.types";
import { DeleteButton } from "@/components/DeleteButton";
import BlockRoomButton from "../../room-overrides/BlockRoomButton";
import { createRoomOverrideAction } from "../../room-overrides/room-overrides.actions";
import { useRouter } from "next/navigation";

type RoomTableProps = {
  rooms: RoomRow[];
};

export function RoomPageClient({ rooms }: RoomTableProps) {
  const onCapacityUpdate =
    (roomId: string) => async (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key !== "Enter") return;
      const value = Number((e.target as HTMLInputElement).value);
      if (!Number.isFinite(value) || value < 1) {
        return;
      }
      await updateRoomAction(roomId, {
        capacity: value,
      });
    };
  const router = useRouter();

  async function handleBlock(
    roomId: string,
    startDate: string,
    endDate: string,
    reason: string,
  ) {
    await createRoomOverrideAction(
      roomId,
      startDate,
      endDate,
      reason.trim() || null,
    );
    router.push("/block-room-list");
  }

  return (
    <Table>
      <Table.ScrollContainer>
        <Table.Content aria-label="Team members" className="min-w-[600px]">
          <Table.Header>
            <Table.Column isRowHeader>Room Name</Table.Column>
            <Table.Column>Label</Table.Column>
            <Table.Column>Lecturer?</Table.Column>
            <Table.Column>Capacity</Table.Column>
            <Table.Column>Block Room</Table.Column>
            <Table.Column>Delete</Table.Column>
          </Table.Header>

          <Table.Body>
            {rooms.map((room) => (
              <Table.Row key={room.id}>
                <Table.Cell>{room.name}</Table.Cell>
                <Table.Cell>{room.label}</Table.Cell>
                <Table.Cell>{room.teacher_only ? "Ya" : "Tidak"}</Table.Cell>
                <Table.Cell className="px-5 py-3">
                  <div className="flex flex-col gap-1">
                    <input
                      type="number"
                      defaultValue={room.capacity}
                      min={1}
                      className="w-24 border rounded-2xl px-2 py-1 text-sm"
                      onKeyDown={onCapacityUpdate(room.id)}
                    />
                    <span className="text-[11px] text-gray-400">
                      Press Enter to update
                    </span>
                  </div>
                </Table.Cell>

                <Table.Cell>
                  <BlockRoomButton room={room} onBlock={handleBlock} />
                </Table.Cell>

                <Table.Cell>
                  <DeleteButton
                    onDelete={async () => {
                      await deleteRoomAction(room.id);
                    }}
                  />
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Content>
      </Table.ScrollContainer>
    </Table>
  );
}
