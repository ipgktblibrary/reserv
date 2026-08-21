import { useCallback, useEffect, useRef, useState } from "react";

import { useSearch } from "@/components/useSearch";
import { getBookersAction, updateBookerAction } from "./booker.actions";

type BookerUI = {
  id: string;
  name: string;
  phone_number: string;
  is_blocked: boolean;
  block_reason: string | null;
  total_bookings: number;
};

const ROWS_PER_PAGE = 25;

export function useBookers() {
  // -----------------------------
  // State
  // -----------------------------

  const [bookers, setBookers] = useState<BookerUI[]>([]);
  const [loading, setLoading] = useState(true);

  const [selected, setSelected] = useState<BookerUI | null>(null);
  const [reason, setReason] = useState("");

  const [page, setPage] = useState(1);

  const requestId = useRef(0);

  // -----------------------------
  // Fetch
  // -----------------------------

  const fetchBookers = useCallback(async () => {
    const id = ++requestId.current;

    setLoading(true);

    try {
      const data = await getBookersAction();

      if (id !== requestId.current) return;

      setBookers(data);

      // Make sure current page is still valid
      const totalPages = Math.max(1, Math.ceil(data.length / ROWS_PER_PAGE));

      setPage((currentPage) => Math.min(currentPage, totalPages));
    } catch (error) {
      if (id === requestId.current) {
        console.error("Failed to fetch bookers:", error);
        setBookers([]);
      }
    } finally {
      if (id === requestId.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    fetchBookers();
  }, [fetchBookers]);

  // -----------------------------
  // Modal
  // -----------------------------

  const openBlockModal = useCallback((booker: BookerUI) => {
    setSelected(booker);
    setReason(booker.block_reason ?? "");
  }, []);

  const closeModal = useCallback(() => {
    setSelected(null);
    setReason("");
  }, []);

  // -----------------------------
  // Actions
  // -----------------------------

  const toggleBlock = useCallback(async () => {
    if (!selected) return;

    const isBlocking = !selected.is_blocked;

    try {
      await updateBookerAction({
        id: selected.id,
        is_blocked: isBlocking,
        block_reason: isBlocking ? reason.trim() || null : null,
      });

      closeModal();

      await fetchBookers();
    } catch (error) {
      console.error("Failed to update booker:", error);
    }
  }, [selected, reason, closeModal, fetchBookers]);

  // -----------------------------
  // Searching Query
  // -----------------------------
  const { query, setQuery, filteredItems } = useSearch(
    bookers,
    (booker, query) =>
      booker.name?.toLowerCase().includes(query) ||
      booker.phone_number?.toLowerCase().includes(query),
  );
  // -----------------------------
  // Pagination
  // -----------------------------
  const totalPages = Math.max(
    1,
    Math.ceil(filteredItems.length / ROWS_PER_PAGE),
  );

  const startIndex = (page - 1) * ROWS_PER_PAGE;
  const endIndex = startIndex + ROWS_PER_PAGE;
  const paginatedBookers = filteredItems.slice(startIndex, endIndex);

  // -----------------------------
  // Return
  // -----------------------------

  return {
    // Data
    bookers,
    paginatedBookers,

    // Loading
    loading,

    // Modal
    selected,
    reason,
    setReason,
    openBlockModal,
    closeModal,

    // Actions
    toggleBlock,
    refresh: fetchBookers,

    //Searching
    query,
    setQuery,

    // Pagination
    page,
    setPage,
    totalPages,
  };
}
