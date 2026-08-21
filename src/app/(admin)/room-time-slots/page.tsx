import { roomsRepository } from "@/features/rooms/rooms.repository";
import { RoomTimeSlotsPageClient } from "@/features/room-time-slots/components/RoomTimeSlotsPageClient";
import { roomTimeSlotRepository } from "@/features/room-time-slots/room-time-slot.repository";

export default async function TimeSlotsPage() {
  const [rooms, roomTimeSlots] = await Promise.all([
    roomsRepository.getAll(),
    roomTimeSlotRepository.getAll(),
  ]);

  return (
    <div className="w-full px-4 space-y-5 py-6 sm:px-6 lg:px-8">
      <RoomTimeSlotsPageClient rooms={rooms} roomTimeSlots={roomTimeSlots} />
    </div>
  );
}
