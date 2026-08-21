import type { ReportData } from "@/features/reports/components/DirectorReportPage";
import DirectorReportPage from "@/features/reports/components/DirectorReportPage";
import { createClient } from "@/lib/supabase/server";

async function getReservation() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("reservations")
    .select("booking_date");

  if (error) {
    throw error;
  }

  return data;
}

async function getReportData(month: string): Promise<ReportData> {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("get_monthly_report", {
    p_month: month,
  });

  if (error) {
    throw error;
  }

  return data as ReportData;
}

export default async function Page() {
  const reservations = await getReservation();
  const months = Array.from(
    new Set((reservations ?? []).map((r) => r.booking_date.slice(0, 7))),
  )
    .sort()
    .reverse();

  const month = months[0] ?? "";
  if (!month) {
    return <div className="p-8 text-sm text-slate-500">NO DATA</div>;
  }
  const data = await getReportData(month);

  return (
    <>
      <DirectorReportPage data={data} month={month} />
    </>
  );
}
