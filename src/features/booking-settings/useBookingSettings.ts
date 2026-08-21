"use client";

import { useCallback, useEffect, useState } from "react";
import {
  getAllBookingSetting,
  updateBookingSetting,
} from "./booking-setttings.actions";
import type { BookingSettingsUpdate } from "./booking-settings.types";

export function useBookingSettings() {
  const [settings, setSettings] = useState<BookingSettingsUpdate | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = useCallback(async () => {
    setLoading(true);

    setError(null);

    try {
      const data = await getAllBookingSetting();

      setSettings(data);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to fetch booking settings",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const updateSettings = async (updates: BookingSettingsUpdate) => {
    if (!settings) return false;

    setSaving(true);

    setError(null);

    try {
      const data = await updateBookingSetting({
        ...updates,
        id: settings.id,
      });

      setSettings(data);
      return true;
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to update booking settings",
      );
      return false;
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  return {
    settings,
    loading,
    saving,
    error,
    updateSettings,
    refetch: fetchSettings,
  };
}
