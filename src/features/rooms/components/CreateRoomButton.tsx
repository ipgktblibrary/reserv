"use client";

import { useState } from "react";
import {
  Button,
  FieldError,
  Form,
  Input,
  Label,
  ListBox,
  ListBoxItem,
  Modal,
  Select,
  TextField,
} from "@heroui/react";

import { createRoomAction } from "../rooms.actions";

export function CreateRoomButton() {
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const form = event.currentTarget;

    setIsSubmitting(true);
    setIsSuccess(false);

    const formData = new FormData(form);

    try {
      const room = await createRoomAction({
        id: crypto.randomUUID(),
        name: formData.get("roomName") as string,
        label: formData.get("label") as string,
        capacity: Number(formData.get("capacity")),
        teacher_only: formData.get("teacherOnly") === "yes",
      });

      if (!room) {
        return;
      }

      form.reset();
      setIsSuccess(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal>
      <Button variant="primary" size="lg">
        Create New Room
      </Button>

      <Modal.Backdrop className="z-100000">
        <Modal.Container>
          <Modal.Dialog className="sm:max-w-[360px]">
            <Modal.CloseTrigger />

            <Modal.Heading>Create Room</Modal.Heading>

            {isSuccess ? (
              <Modal.Body className="py-8 text-center">
                <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-success-100 text-success-600">
                  ✓
                </div>

                <h3 className="text-lg font-semibold">
                  Room created successfully
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                  The room has been added successfully.
                </p>
              </Modal.Body>
            ) : (
              <>
                <Modal.Body>
                  <Form className="space-y-4" onSubmit={handleSubmit}>
                    <TextField isRequired name="roomName">
                      <Label>Nama Bilik</Label>
                      <Input placeholder="Bilik Multimedia 1" />
                      <FieldError />
                    </TextField>

                    <TextField isRequired name="label">
                      <Label>Label</Label>
                      <Input placeholder="BM1" />
                      <FieldError />
                    </TextField>

                    <TextField isRequired name="capacity" type="number">
                      <Label>Kapasiti</Label>
                      <Input placeholder="100" />
                      <FieldError />
                    </TextField>

                    <Select isRequired name="teacherOnly">
                      <Label>Untuk VIP</Label>

                      <Select.Trigger>
                        <Select.Value />
                        <Select.Indicator />
                      </Select.Trigger>

                      <Select.Popover className="z-100001">
                        <ListBox>
                          <ListBoxItem id="yes">Ya</ListBoxItem>
                          <ListBoxItem id="no">Tidak</ListBoxItem>
                        </ListBox>
                      </Select.Popover>

                      <FieldError />
                    </Select>

                    <Button
                      type="submit"
                      size="lg"
                      className="w-full"
                      isDisabled={isSubmitting}
                    >
                      {isSubmitting ? "Creating..." : "Create Room"}
                    </Button>
                  </Form>
                </Modal.Body>
              </>
            )}

            {isSuccess && (
              <Modal.Footer>
                <Button
                  className="w-full"
                  slot="close"
                  onPress={() => setIsSuccess(false)}
                >
                  Done
                </Button>
              </Modal.Footer>
            )}
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
