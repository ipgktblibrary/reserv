import { RoomPageClient } from "@/features/rooms/components/RoomPageClient";
import { CreateRoomButton } from "@/features/rooms/components/CreateRoomButton";
import { roomsRepository } from "@/features/rooms/rooms.repository";
import { buttonVariants, Link } from "@heroui/react";

export default async function RoomsPage() {
  const rooms = await roomsRepository.getAll();
  return (
    <div className="w-full px-4 space-y-5 py-6 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Room Management
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage rooms, capacity, and booking access.
          </p>
        </div>
        <div className="justfity-between space-x-3">
          <Link
            href="/block-room-list"
            className={buttonVariants({ variant: "tertiary", size: "lg" })}
          >
            List of Block Room
          </Link>

          <CreateRoomButton />
        </div>
      </div>

      <RoomPageClient rooms={rooms} />
    </div>
  );
}
