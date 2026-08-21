"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  LabelList,
} from "recharts";

export type BarChartItem = {
  room: string;
  bookings: number;
};

type Props = {
  data: BarChartItem[];
};

export default function RoomBarChart({ data }: Props) {
  return (
    <div className="w-full max-w-7xl mx-auto rounded-2xl border bg-white p-6 shadow-sm">
      {/* Header */}
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-slate-900">
          Laporan Kekerapan Penggunaan Bilik
        </h2>
        <p className="text-sm text-slate-500">
          Analisis bilangan tempahan bagi setiap bilik/ruang
        </p>
      </div>

      {/* Chart */}
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barSize={40}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.25} />

            <XAxis
              dataKey="room"
              interval={0}
              angle={-30}
              textAnchor="end"
              height={70}
              tick={{ fontSize: 12, fill: "#0f172a" }}
              axisLine={false}
              tickLine={false}
            />

            <YAxis
              tick={{ fontSize: 14, fill: "#0f172a" }}
              axisLine={false}
              tickLine={false}
              domain={[0, (dataMax: number) => dataMax * 2.0]}
            />

            <Tooltip
              contentStyle={{
                borderRadius: 12,
                border: "1px solid #e2e8f0",
                fontSize: 14,
              }}
              cursor={{ fill: "rgba(99, 102, 241, 0.08)" }}
            />

            <Bar dataKey="bookings" fill="#4f46e5" radius={[8, 8, 0, 0]}>
              {/* 👇 VALUE LABELS (this is what you were missing) */}
              <LabelList
                dataKey="bookings"
                position="top"
                style={{ fontSize: 14, fill: "#0f172a", fontWeight: 600 }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
