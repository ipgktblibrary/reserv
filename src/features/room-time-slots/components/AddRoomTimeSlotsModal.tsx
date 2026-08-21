"use client";

import { useState } from "react";
import {
  Button,
  FieldError,
  Form,
  Input,
  Label,
  Modal,
  TextField,
} from "@heroui/react";

import { useRoomTimeSlots } from "../hooks/useRoomTimeSlots";
import { formatTimeTo12h } from "@/lib/time/time";

type RoomScheduleManagerProps = {
  roomId: string;
  roomName: string;
};

const DAYS = [
  { value: 1, label: "Isnin" },
  { value: 2, label: "Selasa" },
  { value: 3, label: "Rabu" },
  { value: 4, label: "Khamis" },
  { value: 5, label: "Jumaat" },
];

export function AddRoomTimeSlotsModal({
  roomId,
  roomName,
}: RoomScheduleManagerProps) {
  const [selectedDay, setSelectedDay] = useState(1);

  const { slots, isLoading, createTimeSlot, updateTimeSlot, deleteTimeSlot } =
    useRoomTimeSlots(roomId, selectedDay);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState<(typeof slots)[number] | null>(
    null,
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);

    const startTime = formData.get("startTime") as string;
    const endTime = formData.get("endTime") as string;

    setIsSubmitting(true);
    setError(null);

    try {
      await createTimeSlot({
        roomId,
        dayOfWeek: selectedDay,
        startTime,
        endTime,
      });

      form.reset();
      setIsAddOpen(false);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to create time slot.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!editingSlot) return;

    const form = event.currentTarget;
    const formData = new FormData(form);

    const startTime = formData.get("startTime") as string;
    const endTime = formData.get("endTime") as string;

    setIsSubmitting(true);
    setError(null);

    try {
      await updateTimeSlot({
        id: editingSlot.id,
        startTime,
        endTime,
      });

      setEditingSlot(null);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to update time slot.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this time slot?",
    );

    if (!confirmed) return;

    setError(null);

    try {
      await deleteTimeSlot(id);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to delete time slot.",
      );
    }
  };

  return (
    <>
      <Modal>
        <Button variant="primary" size="lg">
          Add Time Slots
        </Button>

        <Modal.Backdrop className="z-100000">
          <Modal.Container>
            <Modal.Dialog className="sm:max-w-[520px]">
              <Modal.CloseTrigger />

              <Modal.Heading>Manage Time Slots</Modal.Heading>

              <Modal.Body className="space-y-5">
                <div>
                  <p className="text-sm text-gray-500">Room</p>

                  <p className="font-semibold">{roomName}</p>
                </div>

                {/* Days */}

                <div className="flex gap-2 overflow-x-auto pb-1">
                  {DAYS.map((day) => (
                    <Button
                      key={day.value}
                      size="sm"
                      variant={
                        selectedDay === day.value ? "primary" : "secondary"
                      }
                      onPress={() => {
                        setSelectedDay(day.value);
                        setError(null);
                      }}
                    >
                      {day.label}
                    </Button>
                  ))}
                </div>

                {error && (
                  <div className="rounded-lg bg-danger-50 px-3 py-2 text-sm text-danger-700">
                    {error}
                  </div>
                )}

                {/* Slots */}

                <div className="space-y-2">
                  {isLoading ? (
                    <div className="py-8 text-center text-sm text-gray-500">
                      Loading time slots...
                    </div>
                  ) : slots.length === 0 ? (
                    <div className="rounded-lg border border-dashed p-6 text-center">
                      <p className="text-sm text-gray-500">
                        No time slots configured for{" "}
                        {DAYS.find((day) => day.value === selectedDay)?.label}.
                      </p>
                    </div>
                  ) : (
                    slots.map((slot) => (
                      <div
                        key={slot.id}
                        className="flex items-center justify-between rounded-lg border px-4 py-3"
                      >
                        <div>
                          <p className="font-medium">
                            {formatTimeTo12h(slot.start_time)}
                            {" → "}
                            {formatTimeTo12h(slot.end_time)}
                          </p>

                          <p className="text-xs text-gray-500">
                            Slot {slot.slot_index}
                          </p>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="secondary"
                            onPress={() => setEditingSlot(slot)}
                          >
                            Edit
                          </Button>

                          <Button
                            size="sm"
                            variant="danger"
                            onPress={() => handleDelete(slot.id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <Button
                  className="w-full"
                  onPress={() => {
                    setError(null);
                    setIsAddOpen(true);
                  }}
                >
                  + Add Time Slot
                </Button>
              </Modal.Body>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>

      {/* Add */}

      <Modal isOpen={isAddOpen} onOpenChange={setIsAddOpen}>
        <Modal.Backdrop className="z-100001">
          <Modal.Container>
            <Modal.Dialog className="sm:max-w-[360px]">
              <Modal.CloseTrigger />

              <Modal.Heading>Add Time Slot</Modal.Heading>

              <Modal.Body>
                <Form className="space-y-4" onSubmit={handleCreate}>
                  <TextField isRequired name="startTime" type="time">
                    <Label>Start Time</Label>
                    <Input />
                    <FieldError />
                  </TextField>

                  <TextField isRequired name="endTime" type="time">
                    <Label>End Time</Label>
                    <Input />
                    <FieldError />
                  </TextField>

                  <Button
                    type="submit"
                    className="w-full"
                    isDisabled={isSubmitting}
                  >
                    {isSubmitting ? "Adding..." : "Add Time Slot"}
                  </Button>
                </Form>
              </Modal.Body>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>

      {/* Edit */}

      <Modal
        isOpen={!!editingSlot}
        onOpenChange={(open) => {
          if (!open) {
            setEditingSlot(null);
          }
        }}
      >
        <Modal.Backdrop className="z-100001">
          <Modal.Container>
            <Modal.Dialog className="sm:max-w-[360px]">
              <Modal.CloseTrigger />

              <Modal.Heading>Edit Time Slot</Modal.Heading>

              <Modal.Body>
                {editingSlot && (
                  <Form className="space-y-4" onSubmit={handleUpdate}>
                    <TextField
                      isRequired
                      name="startTime"
                      type="time"
                      defaultValue={editingSlot.start_time.slice(0, 5)}
                    >
                      <Label>Start Time</Label>
                      <Input />
                      <FieldError />
                    </TextField>

                    <TextField
                      isRequired
                      name="endTime"
                      type="time"
                      defaultValue={editingSlot.end_time.slice(0, 5)}
                    >
                      <Label>End Time</Label>
                      <Input />
                      <FieldError />
                    </TextField>

                    <Button
                      type="submit"
                      className="w-full"
                      isDisabled={isSubmitting}
                    >
                      {isSubmitting ? "Saving..." : "Save Changes"}
                    </Button>
                  </Form>
                )}
              </Modal.Body>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>
    </>
  );
}
