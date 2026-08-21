"use client";

import TimeSlotDonut from "./TimeSlotDonut";
import { useRef } from "react";
import { toPng } from "html-to-image";
import RoomBarChart from "./RoomBarChart";
import PurposePieChart from "./PurposePieChart";
import ParticipantChart, {
  HorizontalBarItem,
} from "./ParticipantHorizontalChart";
import { Button } from "@heroui/react";

export type ReportData = {
  month: string;

  timeSlotData: {
    name: "Pagi" | "Petang";
    value: number;
    color: string;
  }[];

  participantBreakdown: HorizontalBarItem;

  categoryDistribution: {
    name: string;
    value: number;
  }[];

  roomUsage: {
    room: string;
    bookings: number;
  }[];
};

type Props = {
  month: string;
  data: ReportData;
};
export default function DirectorReportPage({ month, data }: Props) {
  const reportRef = useRef<HTMLDivElement>(null);

  async function downloadPNG() {
    if (!reportRef.current) return;
    await document.fonts?.ready;
    const node = reportRef.current;
    const originalTransform = node.style.transform;

    // 👇 this is the key: "zoom out" effect for export only
    node.style.transform = "scale(0.90)";
    node.style.width = "1280px";

    const dataUrl = await toPng(node, {
      pixelRatio: 5,
      cacheBust: true,
      backgroundColor: "#ffffff",
      //
      skipAutoScale: true,
    });

    // restore
    node.style.transform = originalTransform;

    const link = document.createElement("a");
    link.download = `report-${month}.png`;
    link.href = dataUrl;
    link.click();
  }

  return (
    <div className="relative w-full max-w-7xl mx-auto rounded-2xl border border-slate-200 bg-white p-6 text-slate-900">
      <Button
        variant="primary"
        size="lg"
        className="absolute top-4 right-4  px-5 py-2 "
        onClick={downloadPNG}
      >
        EXPORT PNG
      </Button>
      {/* HEADER */}
      <div className="flex justify-between items-start border-b pb-3">
        <div>
          <h1 className="text-xl font-bold">
            Laporan Pemanfaatan dan Sumber Perpustakaan
          </h1>
          <p className="text-xs text-slate-500">
            Bulan: {month} • Untuk semakan pentadbiran
          </p>
        </div>
      </div>
      {/* EXEC SUMMARY */}

      <div ref={reportRef} className="flex flex-col gap-4 mt-5">
        <RoomBarChart data={data.roomUsage} />
        <PurposePieChart data={data.categoryDistribution} />
        <ParticipantChart data={data.participantBreakdown} />
        <TimeSlotDonut data={data.timeSlotData} />
      </div>

      {/* FOOTER */}
      <div className="border-t pt-2 flex justify-between text-[10px] text-slate-400">
        <span>Sistem Pengurusan Perpustakaan Za’ba • Laporan Dalaman</span>
        <span>Analitik dijana secara automatik</span>
      </div>
    </div>
  );
}
