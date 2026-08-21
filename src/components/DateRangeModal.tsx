"use client";

import { Button, Input, Modal, TextField } from "@heroui/react";

type DateRangeModalProps = {
  isOpen: boolean;
  title: string;
  description?: string;

  startDate: string;
  endDate: string;
  reason: string;

  startDateLabel?: string;
  endDateLabel?: string;
  reasonLabel?: string;
  reasonPlaceholder?: string;
  confirmLabel?: string;

  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
  onReasonChange: (value: string) => void;

  onClose: () => void;
  onConfirm: () => void;
};

export function DateRangeModal({
  isOpen,
  title,
  description,
  startDate,
  endDate,
  reason,
  startDateLabel = "Start date",
  endDateLabel = "End date",
  reasonLabel = "Reason",
  reasonPlaceholder = "Maintenance...",
  confirmLabel = "Confirm",
  onStartDateChange,
  onEndDateChange,
  onReasonChange,
  onClose,
  onConfirm,
}: DateRangeModalProps) {
  const invalidRange = !startDate || !endDate || startDate > endDate;

  return (
    <Modal>
      <Modal.Backdrop
        variant="opaque"
        isOpen={isOpen}
        onOpenChange={(open) => !open && onClose()}
        className="fixed inset-0 z-99999 bg-black/50 backdrop-blur-[1px]"
      >
        <Modal.Container>
          <Modal.Dialog>
            <Modal.CloseTrigger />

            <Modal.Header>
              <Modal.Heading>{title}</Modal.Heading>

              {description && (
                <p className="mt-1 text-sm text-muted">{description}</p>
              )}
            </Modal.Header>

            <Modal.Body>
              <div className="space-y-4">
                <TextField>
                  <TextField>{startDateLabel}</TextField>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => onStartDateChange(e.target.value)}
                  />
                </TextField>

                <TextField>
                  <TextField>{endDateLabel}</TextField>
                  <Input
                    type="date"
                    value={endDate}
                    min={startDate || undefined}
                    onChange={(e) => onEndDateChange(e.target.value)}
                  />
                </TextField>

                <TextField>
                  <TextField>{reasonLabel}</TextField>
                  <Input
                    value={reason}
                    onChange={(e) => onReasonChange(e.target.value)}
                    placeholder={reasonPlaceholder}
                  />
                </TextField>
              </div>
            </Modal.Body>

            <Modal.Footer>
              <Button variant="outline" onPress={onClose}>
                Cancel
              </Button>

              <Button
                variant="danger"
                isDisabled={invalidRange}
                onPress={onConfirm}
              >
                {confirmLabel}
              </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
