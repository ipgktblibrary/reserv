"use client";

import { useState } from "react";
import { deleteBookerAction } from "../booker.actions";

type DeleteBookerProps = {
  id: string;
};

export function DeleteBookerButton({ id }: DeleteBookerProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);

    try {
      await deleteBookerAction(id);
      setOpen(false);
    } catch (error) {
      console.error("Failed to delete booker:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
      >
        Delete
      </button>

      {open && (
        <div className="fixed inset-0 z-100001 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-xl bg-white p-5 shadow-xl">
            <h2 className="text-lg font-semibold">Delete Booker?</h2>

            <p className="mt-2 text-sm text-gray-500">
              Are you sure you want to delete this booker?
            </p>

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
