"use client";

import { AddRoomTimeSlotsModal } from "@/features/room-time-slots/components/AddRoomTimeSlotsModal";
import { useRoomTimeSlotUI } from "../hooks/useRoomTimeSlotUI";
import { Button, Card } from "@heroui/react";
import type { RoomRow } from "@/features/rooms/room.types";
import type { RoomTimeSlotRow } from "../room-time-slot.types";

type RoomTimeSlotsPageClientProps = {
  rooms: RoomRow[];
  roomTimeSlots: RoomTimeSlotRow[];
};

const DAY_MAP: Record<number, string> = {
  1: "Isnin",
  2: "Selasa",
  3: "Rabu",
  4: "Khamis",
  5: "Jumaat",
};

export function RoomTimeSlotsPageClient({
  rooms,
  roomTimeSlots,
}: RoomTimeSlotsPageClientProps) {
  const {
    selectedRoom,
    selectedRoomData,
    groupedSlots,
    selectedSlot,
    reason,
    modal,
    setReason,
    handleRoomChange,
    handleSlotClick,
    confirmToggle,
  } = useRoomTimeSlotUI({
    rooms,
    roomTimeSlots,
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Time Slot Management</h1>
          {selectedRoomData && (
            <p className="mt-1 text-sm text-gray-500">
              {selectedRoomData.name}
            </p>
          )}
        </div>
        {selectedRoomData && (
          <AddRoomTimeSlotsModal
            roomId={selectedRoomData.id}
            roomName={selectedRoomData.name}
          />
        )}
      </div>

      {/* Room Selector */}
      <div className="flex flex-wrap gap-2">
        {rooms.map((room) => {
          const active = selectedRoom === room.id;

          return (
            <Button
              key={room.id}
              type="button"
              onClick={() => handleRoomChange(room.id)}
              className={`relative border rounded-md px-4 py-2 text-sm font-medium transition-all ${
                active
                  ? "text-white shadow-md"
                  : "bg-white/70 text-gray-600 hover:border-blue-300 dark:border-white/10 dark:bg-gray-900/60 dark:text-gray-300"
              }`}
            >
              {room.name}

              {active && (
                <span className="absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-white" />
              )}
            </Button>
          );
        })}
      </div>

      {/* No rooms */}
      {!rooms.length && (
        <div className="rounded-xl border border-dashed p-8 text-center">
          <p className="text-sm text-gray-500">No rooms available.</p>
        </div>
      )}

      {/* Days */}
      {Object.entries(groupedSlots).map(([day, daySlots]) => (
        <div
          key={day}
          className="rounded-xl border border-gray-200 bg-white p-5 dark:border-white/2 "
        >
          <h2 className="mb-4 text-lg font-semibold">{DAY_MAP[Number(day)]}</h2>

          {daySlots.length === 0 ? (
            <div className="rounded-lg border border-dashed p-5 text-center">
              <p className="text-sm text-gray-500">
                Tiada slot masa untuk hari ini.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
              {daySlots.map((slot) => (
                <Card
                  key={slot.id}
                  onClick={() => handleSlotClick(slot)}
                  className={`cursor-pointer rounded-xl border p-4 text-left transition hover:scale-[1.01] ${
                    slot.is_blocked
                      ? "border-danger/20 bg-danger/10"
                      : "border-success/20 bg-success/10"
                  }`}
                >
                  <div className="text-xs text-foreground/60">
                    Slot {slot.slot_index}
                  </div>

                  <div className="mt-1 font-medium text-foreground">
                    {slot.start_time} - {slot.end_time}
                  </div>

                  <div className="mt-3">
                    {slot.is_blocked ? (
                      <span className="rounded-full bg-danger/10 px-2 py-1 text-xs text-foreground">
                        Blocked
                      </span>
                    ) : (
                      <span className="rounded-full bg-success/10 px-2 py-1 text-xs text-foreground">
                        Available
                      </span>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      ))}

      {/* Block / Unblock Modal */}
      {modal.isOpen && selectedSlot && (
        <div className="fixed inset-0 z-1000011 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md space-y-4 rounded-xl bg-white p-5">
            <div>
              <h2 className="text-lg font-semibold">
                {selectedSlot.is_blocked ? "Unblock Slot" : "Block Slot"}
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                {selectedSlot.start_time} - {selectedSlot.end_time}
              </p>
            </div>

            {!selectedSlot.is_blocked && (
              <textarea
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                placeholder="Reason for blocking"
                className="w-full rounded-lg border p-3 text-sm outline-none focus:border-blue-500"
                rows={3}
              />
            )}

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={modal.closeModal}
                className="rounded-lg border px-3 py-2 text-sm"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={confirmToggle}
                className={`rounded-lg px-3 py-2 text-sm text-white ${
                  selectedSlot.is_blocked ? "bg-green-600" : "bg-red-600"
                }`}
              >
                {selectedSlot.is_blocked ? "Unblock" : "Block"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
