const escape = (v: string | number | null | undefined) => {
  if (v === null || v === undefined) return "";
  const str = String(v);
  return `"${str.replace(/"/g, '""')}"`;
};

export type ReportsData = {
  id: string;
  booking_date: string;
  status: string;
  room_id: string;
  capacity: number;
  room_name: string;
  booker_name: string;
  booker_phone: string;
  time_slot: string;
};

export function exportReservationReportCSV(rows: ReportsData[]) {
  const header = [
    "ID",
    "Nama",
    "No.Telefon",
    "Tarikh",
    "Bilik",
    "Masa Tempahan",
    "Jumlah Peserta",
  ];

  const csvRows = rows.map((r) => {
    return [
      escape(r.id),
      escape(r.booker_name.toUpperCase()),
      escape(r.booker_phone),
      escape(r.booking_date),
      escape(r.room_name),
      escape(r.time_slot),
      escape(r.capacity),
    ].join(",");
  });

  const csvContent = [header.join(","), ...csvRows].join("\n");

  const blob = new Blob([csvContent], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `reservation-report-${new Date().toISOString()}.csv`;
  a.click();

  URL.revokeObjectURL(url);
}
