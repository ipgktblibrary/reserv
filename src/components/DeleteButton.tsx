"use client";
import { Button } from "@heroui/react";
import { useRouter } from "next/navigation";
import { useState, ReactNode } from "react";

type DeleteButtonProps = {
  onDelete: () => Promise<void>;
  title?: string;
  description?: string;
  children?: ReactNode;
};

export function DeleteButton({
  onDelete,
  title = "Delete?",
  description = "Are you sure you want to delete this item?",
  children,
}: DeleteButtonProps) {
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);

    try {
      await onDelete();
      setOpen(false);
      router.refresh();
    } catch (error) {
      console.error("Delete failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button variant="danger" onClick={() => setOpen(true)}>
        Delete
      </Button>

      {open && (
        <div className="fixed inset-0 z-100001 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-xl bg-white p-5 shadow-xl">
            <h2 className="text-lg font-semibold">{title}</h2>

            <p className="mt-2 text-sm text-gray-500">{description}</p>

            {children && <div className="mt-4">{children}</div>}

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                disabled={loading}
                className="rounded-lg border px-4 py-2 text-sm"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDelete}
                disabled={loading}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700 disabled:opacity-50"
              >
                {loading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
