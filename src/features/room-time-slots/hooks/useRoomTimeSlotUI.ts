import { useEffect, useMemo, useState } from "react";
import { useModal } from "@/hooks/useModal";
import type { RoomRow } from "@/features/rooms/room.types";
import type { RoomTimeSlotRow } from "../room-time-slot.types";
import { updateTimeSlotAction } from "../room-time-slot.actions";

type Props = {
  rooms: RoomRow[];
  roomTimeSlots: RoomTimeSlotRow[];
};

export function useRoomTimeSlotUI({ rooms, roomTimeSlots }: Props) {
  const [selectedRoom, setSelectedRoom] = useState<string | null>(
    rooms[0]?.id ?? null,
  );
  const [slots, setSlots] = useState<RoomTimeSlotRow[]>(roomTimeSlots);
  const [selectedSlot, setSelectedSlot] = useState<RoomTimeSlotRow | null>(
    null,
  );
  const [reason, setReason] = useState("");
  const modal = useModal();

  useEffect(() => {
    setSlots(roomTimeSlots);
  }, [roomTimeSlots]);

  const selectedRoomData = useMemo(
    () => rooms.find((room) => room.id === selectedRoom),
    [rooms, selectedRoom],
  );

  const roomSlots = useMemo(() => {
    if (!selectedRoom) return [];

    return slots
      .filter((slot) => slot.room_id === selectedRoom)
      .sort((a, b) => {
        if (a.day_of_week !== b.day_of_week) {
          return a.day_of_week - b.day_of_week;
        }
        return a.slot_index - b.slot_index;
      });
  }, [slots, selectedRoom]);

  const groupedSlots = useMemo(() => {
    const base: Record<number, RoomTimeSlotRow[]> = {
      1: [],
      2: [],
      3: [],
      4: [],
      5: [],
    };
    for (const slot of roomSlots) {
      base[slot.day_of_week]?.push(slot);
    }
    return base;
  }, [roomSlots]);

  const handleRoomChange = (roomId: string) => {
    setSelectedRoom(roomId);
    setSelectedSlot(null);
    setReason("");
    modal.closeModal();
  };

  const handleSlotClick = (slot: RoomTimeSlotRow) => {
    setSelectedSlot(slot);
    setReason(slot.blocked_reason ?? "");
    modal.openModal();
  };

  const confirmToggle = async () => {
    if (!selectedSlot) return;

    const isBlocking = !selectedSlot.is_blocked;

    try {
      const updatedSlot = await updateTimeSlotAction({
        id: selectedSlot.id,
        is_blocked: isBlocking,
        blocked_reason: isBlocking ? reason.trim() || null : null,
      });

      setSlots((current) =>
        current.map((slot) =>
          slot.id === updatedSlot.id ? updatedSlot : slot,
        ),
      );

      modal.closeModal();
      setSelectedSlot(null);
      setReason("");
    } catch (error) {
      console.error("Failed to update time slot:", error);
    }
  };

  return {
    selectedRoom,
    selectedRoomData,

    slots,
    roomSlots,
    groupedSlots,

    selectedSlot,
    reason,

    modal,

    setReason,

    handleRoomChange,
    handleSlotClick,
    confirmToggle,
  };
}
