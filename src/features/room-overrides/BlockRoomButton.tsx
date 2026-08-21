"use client";

import { DateRangeModal } from "@/components/DateRangeModal";
import { Button } from "@heroui/react";
import { useState } from "react";

type Room = {
  id: string;
  name: string;
};

type Props = {
  room: Room;
  onBlock: (
    roomId: string,
    startDate: string,
    endDate: string,
    reason: string,
  ) => Promise<void>;
};

export default function BlockRoomButton({ room, onBlock }: Props) {
  const [open, setOpen] = useState(false);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");

  function openBlock() {
    setStartDate("");
    setEndDate("");
    setReason("");
    setOpen(true);
  }

  function closeBlock() {
    setOpen(false);
  }

  async function handleCreate() {
    if (!startDate || !endDate || startDate > endDate) return;

    await onBlock(room.id, startDate, endDate, reason);

    closeBlock();
  }

  return (
    <>
      <Button size="sm" variant="danger-soft" onPress={openBlock}>
        Block Room
      </Button>

      <DateRangeModal
        isOpen={open}
        title={`Block ${room.name}`}
        description="The entire room will be unavailable during this period."
        startDate={startDate}
        endDate={endDate}
        reason={reason}
        confirmLabel="Block Room"
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
        onReasonChange={setReason}
        onClose={closeBlock}
        onConfirm={handleCreate}
      />
    </>
  );
}
