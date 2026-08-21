"use client";

import { useCallback, useEffect, useState } from "react";
import { ReportsData } from "@/features/dashboard/reservation-report-csv";
import { getReports } from "../reports/reports.actions";

export function useReservationReports() {
  const [data, setData] = useState<ReportsData[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getReports();
      setData(res);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return {
    data,
    loading,
    refresh: fetchAll,
  };
}
