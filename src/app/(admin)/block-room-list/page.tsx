import { roomsRepository } from "@/features/rooms/rooms.repository";
import { roomOverrideRepository } from "@/features/room-overrides/room-overrides.repository";
import BlockRoomList from "./BlockRoomList";

export default async function BlockRoomPage() {
  const [rooms, overrides] = await Promise.all([
    roomsRepository.getAll(),
    roomOverrideRepository.getAll(),
  ]);

  return (
    <div className="w-full space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <BlockRoomList rooms={rooms} overrides={overrides} />
    </div>
  );
}
